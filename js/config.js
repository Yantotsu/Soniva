
export const APP_CONFIG = Object.freeze({
  name: "Soniva Music",
  version: "1.0.0",
  defaultRoute: "home",
  routes: [
    "home",
    "search",
    "explore",
    "library",
    "album",
    "artist",
    "playlist",
    "queue",
    "settings",
    "profile",
    "now-playing"
  ]
});

export const API_CONFIG = Object.freeze({
  // Alamat backend saat pengembangan lokal.
  // Ubah sesuai alamat server yang kamu gunakan.
  baseURL: "https://soniva-app.bonto.run/api",
  timeout: 15000
});
