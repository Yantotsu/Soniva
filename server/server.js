
import "dotenv/config";

import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

app.disable("x-powered-by");

app.use(helmet());

app.use(express.json({ limit: "20kb" }));

// Izinkan frontend berbeda domain mengakses API katalog publik.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Rate limit untuk melindungi backend.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak permintaan. Coba lagi nanti."
  }
});

app.use("/api", apiLimiter);

// Cache token Spotify di memori backend.
let spotifyToken = null;
let spotifyTokenExpiresAt = 0;
let tokenRequestPromise = null;

function hasSpotifyConfig() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET
  );
}

// Mengambil access token aplikasi dari Spotify.
async function getSpotifyAccessToken() {
  if (!hasSpotifyConfig()) {
    const error = new Error(
      "Konfigurasi Spotify belum tersedia di backend."
    );
    error.status = 503;
    throw error;
  }

  // Gunakan token yang masih berlaku.
  if (
    spotifyToken &&
    Date.now() < spotifyTokenExpiresAt
  ) {
    return spotifyToken;
  }

  // Hindari beberapa request token sekaligus.
  if (tokenRequestPromise) {
    return tokenRequestPromise;
  }

  tokenRequestPromise = (async () => {
    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      10000
    );

    try {
      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "client_credentials"
        }),
        signal: controller.signal
      });

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        // Jangan log Client Secret atau header Authorization.
        console.error(
          "Spotify token request failed:",
          response.status,
          data.error || data.error_description || "Unknown error"
        );

        const error = new Error(
          "Spotify gagal memberikan access token."
        );
        error.status = 502;
        throw error;
      }

      spotifyToken = data.access_token;

      // Perbarui token sebelum token benar-benar kedaluwarsa.
      spotifyTokenExpiresAt =
        Date.now() + Math.max(
          0,
          Number(data.expires_in || 3600) - 60
        ) * 1000;

      return spotifyToken;
    } catch (error) {
      if (error.name === "AbortError") {
        const timeoutError = new Error(
          "Permintaan token Spotify timeout."
        );
        timeoutError.status = 504;
        throw timeoutError;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  })();

  try {
    return await tokenRequestPromise;
  } finally {
    tokenRequestPromise = null;
  }
}

// Memanggil Spotify Web API dari backend.
async function spotifyGet(endpoint, query = {}) {
  const token = await getSpotifyAccessToken();

  const url = new URL(
    `${SPOTIFY_API_URL}/${endpoint.replace(/^\/+/, "")}`
  );

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    15000
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const spotifyMessage =
        data?.error?.message ||
        data?.error_description ||
        "Permintaan Spotify gagal.";

      const error = new Error(spotifyMessage);

      // Token mungkin kedaluwarsa atau dicabut.
      if (response.status === 401) {
        spotifyToken = null;
        spotifyTokenExpiresAt = 0;
      }

      error.status =
        response.status === 429 ? 429 : 502;

      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "Permintaan katalog Spotify timeout."
      );
      timeoutError.status = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Health check.
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Soniva Music",
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Informasi API.
app.get("/api", (_req, res) => {
  res.json({
    name: "Soniva Music API",
    version: "1.0.0",
    endpoints: [
      "GET /health",
      "GET /api",
      "GET /api/config",
      "GET /api/spotify/search"
    ]
  });
});

// Konfigurasi publik frontend.
// Client Secret tidak pernah dikirim ke browser.
app.get("/api/config", (_req, res) => {
  res.set("Cache-Control", "no-store");

  res.json({
    appName: "Soniva Music",
    spotifyConfigured: hasSpotifyConfig()
  });
});

// Mencari lagu, album, atau artis.
app.get("/api/spotify/search", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const q =
    typeof req.query.q === "string"
      ? req.query.q.trim()
      : "";

  if (!q) {
    return res.status(400).json({
      error: "Parameter q wajib diisi."
    });
  }

  if (q.length > 200) {
    return res.status(400).json({
      error: "Kata pencarian maksimal 200 karakter."
    });
  }

  const allowedTypes = [
    "track",
    "album",
    "artist",
    "playlist"
  ];

  const requestedTypes =
    typeof req.query.type === "string"
      ? req.query.type.split(",").map((type) => type.trim())
      : ["track"];

  const validTypes = requestedTypes.filter(
    (type) => allowedTypes.includes(type)
  );

  if (
    validTypes.length === 0 ||
    validTypes.length !== requestedTypes.length
  ) {
    return res.status(400).json({
      error: "type harus berupa track, album, artist, atau playlist."
    });
  }

  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
  );

  const offset = Math.min(
    1000,
    Math.max(0, Number.parseInt(req.query.offset, 10) || 0)
  );

  try {
    const data = await spotifyGet("search", {
      q,
      type: validTypes.join(","),
      limit,
      offset
    });

    return res.json({
      success: true,
      query: q,
      data
    });
  } catch (error) {
    console.error(
      "Spotify search error:",
      error.status || 500,
      error.message
    );

    return res.status(error.status || 500).json({
      error: error.message || "Pencarian Spotify gagal."
    });
  }
});

// Endpoint API yang tidak ditemukan.
app.use("/api/*path", (_req, res) => {
  res.status(404).json({
    error: "Endpoint API tidak ditemukan."
  });
});

// Error handler umum.
app.use((error, _req, res, _next) => {
  console.error("Soniva server error:", error.message);

  res.status(500).json({
    error: "Terjadi kesalahan pada server."
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Soniva API berjalan di http://${HOST}:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(
    `Spotify configured: ${hasSpotifyConfig()}`
  );
});
