# Portofolio Alfin Rifaldy Siregar

Website portofolio pribadi dibangun dengan **React + Vite** dan **Supabase** sebagai backend.

## Tech Stack

- **React 19** — UI library
- **Vite 6** — Build tool & dev server
- **Tailwind CSS 4** — Styling
- **React Router 7** — Client-side routing
- **Supabase** — Database (PostgreSQL) & Authentication

## Setup

1. Clone repo ini
2. Buat project di [supabase.com](https://supabase.com)
3. Jalankan `supabase-schema.sql` di Supabase SQL Editor
4. Buat user admin di Supabase Authentication
5. Copy `.env.local.example` → `.env.local` dan isi credentials:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
6. Install dependencies & jalankan:
   ```bash
   npm install
   npm run dev
   ```

## Routes

| Path | Keterangan |
|------|-----------|
| `/` | Halaman portofolio publik |
| `/admin/login` | Login admin (Supabase Auth) |
| `/admin/dashboard` | Admin panel CRUD |

## Build

```bash
npm run build
```

Output di folder `dist/`.
