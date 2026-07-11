# EcoEats — SDGs Creative Web Competition (Bytesfest 2026)

Landing page untuk EcoEats, marketplace makanan surplus di Solo (sub tema
"Impact Hub: Social Innovation & Zero Waste" — SDG 1, 10, 13).

## Menjalankan proyek

Proyek ini dibangun dengan React + Vite (front-end statis, tanpa database,
tanpa localStorage/sessionStorage).

```bash
npm install
npm run dev       # menjalankan mode pengembangan
npm run build     # menghasilkan build produksi ke folder dist/
npm run preview   # preview hasil build produksi
```

## Struktur

- `src/App.jsx` — seluruh komponen halaman (Nav, Hero, Masalah, Cara Kerja,
  Temukan Makanan, Dampak, Cerita, CTA & Footer)
- `src/index.css` — sistem desain ("Nota Penyelamatan" / rescue-receipt),
  token warna & tipografi, animasi scroll-reveal
- `index.html` — entry HTML + font (Google Fonts: Fraunces, Manrope, IBM Plex Mono)

Sebelum submit, folder `node_modules/` dan `dist/` sudah dihapus sesuai
ketentuan panitia.
