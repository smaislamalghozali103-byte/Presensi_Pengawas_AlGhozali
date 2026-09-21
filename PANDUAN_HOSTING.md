# Panduan Hosting ke Vercel & Netlify (PWA Presensi Pengawas Al-Ghozali)

Aplikasi ini telah dikonfigurasi penuh sebagai **Progressive Web App (PWA)** dengan Service Worker, Web App Manifest, icon multi-resolusi, dan tombol instalasi in-app di HP / Laptop.

---

## 🚀 Opsi 1: Deploy ke Vercel (Rekomendasi)

1. **Unduh Kode atau Push ke GitHub**:
   - Buka menu **Settings** di AI Studio -> **Export to GitHub** (atau Download ZIP lalu push ke repo GitHub Anda).
2. **Buka [vercel.com](https://vercel.com)**:
   - Login dengan akun GitHub Anda.
   - Klik tombol **"Add New..."** -> **"Project"**.
   - Pilih repositori GitHub `presensi-pengawas-alghozali`.
3. **Pengaturan Project di Vercel**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build:client` (atau `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Environment Variables (Opsional)**:
   - Jika ingin mengubah endpoint Google Apps Script:
     - `API_URL`: URL Web App Apps Script Anda
     - `API_KEY`: `AL-GHOZALI-PRESENSI-2026`
5. **Klik "Deploy"**:
   - Vercel akan mem-build aplikasi dan memberikan domain gratis ber-HTTPS (misal: `https://presensi-alghozali.vercel.app`).
   - Berkat HTTPS, PWA akan langsung aktif dan bisa dipasang (*Add to Home Screen*) di semua browser Android, iOS Safari, dan Chrome Desktop.

---

## 🌐 Opsi 2: Deploy ke Netlify

1. **Buka [netlify.com](https://netlify.com)**:
   - Login dengan akun GitHub / Email.
   - Klik **"Add new site"** -> **"Import an existing project"** -> **GitHub**.
2. **Pilih Repository**:
   - Netlify akan otomatis membaca berkas konfigurasi `netlify.toml` yang sudah kami sediakan:
     - **Base directory**: (kosongkan / default)
     - **Build command**: `npm run build:client`
     - **Publish directory**: `dist`
3. **Klik "Deploy presensi-pengawas-alghozali"**:
   - Dalam ~1 menit aplikasi akan live di domain seperti `https://presensi-alghozali.netlify.app`.
   - Fitur PWA dan routing SPA langsung berjalan otomatis tanpa error 404 saat refresh.

---

## 📲 Cara Pengawas Memasang Aplikasi (PWA) di HP:
- **Di Android (Chrome)**:
  - Buka link aplikasi -> Ketuk tombol hijau **"Install Aplikasi di HP (PWA)"** atau pilih menu titik tiga (⋮) -> **Install App / Pasang Aplikasi**.
- **Di iPhone / iPad (Safari)**:
  - Buka link di Safari -> Ketuk tombol **Share (Bagikan)** -> Pilih **Add to Home Screen (Tambahkan ke Layar Utama)**.
