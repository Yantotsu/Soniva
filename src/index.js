let cachedToken = null;
let tokenExpiresAt = 0;

const SPOTIFY_TOKEN_URL =
  "https://accounts.spotify.com/api/token";

const SPOTIFY_API_URL =
  "https://api.spotify.com/v1";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

async function getSpotifyToken(env) {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Konfigurasi Spotify belum lengkap.");
  }

  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const credentials = btoa(
    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
  );

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials"
    })
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error(
      "Spotify token error:",
      response.status,
      data.error || data.error_description || "Unknown error"
    );

    throw new Error(
      "Spotify menolak kredensial. Periksa Client ID dan Secret."
    );
  }

  cachedToken = data.access_token;
  tokenExpiresAt =
    Date.now() + Math.max(0, (data.expires_in || 3600) - 60) * 1000;

  return cachedToken;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "GET") {
      return json({ error: "Method tidak didukung." }, 405);
    }

    if (url.pathname === "/health") {
      return json({
        status: "ok",
        app: "Soniva Music API",
        hosting: "Cloudflare Workers"
      });
    }

    if (url.pathname === "/api/config") {
      return json({
        appName: "Soniva Music",
        spotifyConfigured: Boolean(
          env.SPOTIFY_CLIENT_ID &&
          env.SPOTIFY_CLIENT_SECRET
        )
      });
    }

    if (url.pathname === "/api/spotify/search") {
      const query = (url.searchParams.get("q") || "").trim();

      if (!query) {
        return json({ error: "Parameter q wajib diisi." }, 400);
      }

      if (query.length > 200) {
        return json({ error: "Kata pencarian terlalu panjang." }, 400);
      }

      const allowedTypes = ["track", "album", "artist", "playlist"];
      const types = (
        url.searchParams.get("type") || "track"
      ).split(",").map((item) => item.trim());

      if (
        !types.length ||
        types.some((type) => !allowedTypes.includes(type))
      ) {
        return json({ error: "Jenis pencarian tidak valid." }, 400);
      }

      const parsedLimit = Number.parseInt(
        url.searchParams.get("limit") || "10",
        10
      );

      const parsedOffset = Number.parseInt(
        url.searchParams.get("offset") || "0",
        10
      );

      const limit = Number.isFinite(parsedLimit)
        ? Math.min(50, Math.max(1, parsedLimit))
        : 10;

      const offset = Number.isFinite(parsedOffset)
        ? Math.min(1000, Math.max(0, parsedOffset))
        : 0;

      try {
        const token = await getSpotifyToken(env);

        const spotifyURL = new URL(`${SPOTIFY_API_URL}/search`);
        spotifyURL.searchParams.set("q", query);
        spotifyURL.searchParams.set("type", types.join(","));
        spotifyURL.searchParams.set("limit", String(limit));
        spotifyURL.searchParams.set("offset", String(offset));

        const response = await fetch(spotifyURL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.status === 401) {
          cachedToken = null;
          tokenExpiresAt = 0;
        }

        if (!response.ok) {
          console.error(
            "Spotify search error:",
            response.status,
            data.error?.message || "Unknown error"
          );

          return json({
            error: "Pencarian Spotify gagal.",
            spotifyStatus: response.status
          }, 502);
        }

        return json({
          success: true,
          query,
          data
        });
      } catch (error) {
        console.error("Soniva API error:", error.message);

        return json({
          error: error.message || "Server gagal mengakses Spotify."
        }, 502);
      }
    }

    return json({
      error: "Endpoint tidak ditemukan.",
      path: url.pathname
    }, 404);
  }
};
    
