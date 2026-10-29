
import "dotenv/config";

import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

app.disable("x-powered-by");

app.use(helmet());

app.use(express.json({ limit: "20kb" }));

// Batasi request agar endpoint tidak mudah disalahgunakan.
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

// Health check untuk memeriksa apakah server aktif.
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
      "GET /api/config"
    ]
  });
});

// Mengirim informasi publik frontend.
// Jangan pernah mengirim Client Secret ke browser.
app.get("/api/config", (_req, res) => {
  res.set("Cache-Control", "no-store");

  res.json({
    appName: "Soniva Music",
    spotifyConfigured: Boolean(
      process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET
    )
  });
});

// Handler endpoint yang tidak ditemukan.
app.use("/api/*path", (_req, res) => {
  res.status(404).json({
    error: "Endpoint API tidak ditemukan."
  });
});

// Handler error umum.
app.use((error, _req, res, _next) => {
  console.error("Soniva server error:", error.message);

  res.status(500).json({
    error: "Terjadi kesalahan pada server."
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Soniva API berjalan di http://${HOST}:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
