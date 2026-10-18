# LatihanKu – cara memasang sebagai website

Isi proyek:
- `public/index.html`  : seluruh tampilan web
- `functions/api/ai.js`: server kecil yang memanggil API Anthropic (kunci rahasia tersimpan di sini, tidak di halaman)

## Langkah (lewat dashboard Cloudflare, tanpa perintah terminal)
1. Buat API key di https://console.anthropic.com lalu atur batas pengeluaran bulanan.
2. Buat repositori GitHub baru, unggah isi folder ini (folder `public` dan `functions` harus di akar repositori).
3. Daftar di https://dash.cloudflare.com (gratis) lalu buka Workers & Pages > Create > Pages > Connect to Git, pilih repositori tadi.
4. Pengaturan build: Framework = None, Build command = kosong, Build output directory = `public`. Klik Deploy.
5. Buka proyek > Settings > Variables and Secrets, tambahkan (jenis Secret):
   - `ANTHROPIC_API_KEY` = kunci dari langkah 1
   - `ACCESS_CODE` = kode akses yang kamu buat sendiri (dibagikan ke teman)
   Opsional: `DAILY_LIMIT` = batas permintaan per IP per hari (bawaan 60), `MODEL` = nama model lain.
6. Opsional pembatas harian: Storage & Databases > KV > buat namespace, lalu proyek > Settings > Bindings > KV namespace, nama variabel `RL`.
7. Deploy ulang (Deployments > Retry). Buka alamat `nama-proyek.pages.dev`, coba buat soal. Pertama kali akan diminta kode akses.
8. Bagikan link dan kode akses ke teman. Pantau biaya di Anthropic Console.

## Lewat terminal (alternatif)
    npx wrangler pages deploy public --project-name latihanku
    npx wrangler pages secret put ANTHROPIC_API_KEY --project-name latihanku
    npx wrangler pages secret put ACCESS_CODE --project-name latihanku

## Catatan
- Jangan menaruh API key di `index.html`.
- Jadwal, XP, dan kemajuan tersimpan di peramban masing-masing pengguna.
- Soal panjang dengan gambar bisa makan waktu 30-90 detik dan paling banyak memakai biaya.
- Kode ini belum diuji di akun Cloudflare-mu; kalau ada error, cek Deployments > Functions logs.
- deploy ulang
