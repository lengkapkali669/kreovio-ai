# Kreovio AI v1.0 — Cloudflare Pages

Bilingual AI Caption Generator (Indonesia/English), Dark Purple Neon.

## Deploy paling mudah: GitHub + Cloudflare Pages
1. Buat repository GitHub baru bernama `kreovio-ai`.
2. Upload semua isi ZIP ke root repository. Pastikan `index.html`, `functions/`, `assets/`, `data/`, dan `wrangler.jsonc` terlihat langsung di root.
3. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
4. Pilih repository tersebut. Framework preset: **None**. Build command: kosongkan. Build output directory: `.`
5. Deploy.
6. Project → Settings → Bindings → Add → Workers AI. Variable name harus `AI`. Simpan dan lakukan redeploy.
7. Buka alamat `*.pages.dev` dan coba generator.

## Model AI
Model starter: `@cf/meta/llama-3.1-8b-instruct-fp8`. Periksa katalog Workers AI di dashboard. Jika model tidak tersedia, ganti konstanta `MODEL` di `functions/api/generate.js` dengan ID text-generation model yang tersedia di akunmu.

## Alternatif CLI
Perlu Node.js:
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=kreovio-ai
```
Untuk dev lokal dengan binding AI: `wrangler pages dev . --ai AI`.

## Sebelum launch publik
- Ganti email placeholder pada halaman kontak (belum ada formulir kontak).
- Tambahkan rate limiting/abuse protection pada `/api/generate`.
- Uji kuota dan biaya Workers AI. Request AI dapat menimbulkan biaya sesuai ketentuan akun/kuota.
- Lengkapi kebijakan privasi dan syarat penggunaan.
- Brand `Kreovio AI` adalah nama kerja; cek domain dan merek dagang sebelum investasi branding.

## Endpoint
`POST /api/generate` dengan JSON `{ "topic":"Produk baru", "platform":"Instagram", "tone":"Friendly", "outputLanguage":"Bahasa Indonesia", "details":"Promo launching" }`.
