
# Soniva Music Backend

Backend Soniva menggunakan Node.js dan Express.

## Persyaratan
- Node.js 20 atau lebih baru
- npm

## Instalasi
Jalankan dari folder utama proyek:

npm install

## Mode pengembangan
npm run dev

## Mode produksi
npm start

## Endpoint
- GET /health
- GET /api
- GET /api/config

## Keamanan
- Simpan kredensial dalam file .env.
- Jangan kirim Spotify Client Secret ke frontend.
- Gunakan HTTPS saat deployment publik.
- Atur environment variables melalui dashboard hosting.
