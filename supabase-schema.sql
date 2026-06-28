-- ============================================================
-- SUPABASE SCHEMA & SEED DATA for Portfolio
-- Jalankan SQL ini di Supabase SQL Editor (https://supabase.com)
-- ============================================================

-- ========================
-- 1. TABEL BIO
-- ========================
CREATE TABLE IF NOT EXISTS bio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  cv_url TEXT NOT NULL DEFAULT '',
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 2. TABEL EDUCATIONS
-- ========================
CREATE TABLE IF NOT EXISTS educations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution TEXT NOT NULL DEFAULT '',
  degree TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 3. TABEL EXPERIENCES
-- ========================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 4. TABEL SKILLS
-- ========================
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  level INT NOT NULL DEFAULT 80,
  category TEXT NOT NULL DEFAULT 'Frontend',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 5. TABEL PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  github TEXT NOT NULL DEFAULT '',
  demo TEXT NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 6. TABEL CERTIFICATES
-- ========================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  issuer TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 7. TABEL MESSAGES (Contact Form)
-- ========================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE bio ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public READ access for portfolio data (everyone can view the portfolio)
CREATE POLICY "Public read bio" ON bio FOR SELECT USING (true);
CREATE POLICY "Public read educations" ON educations FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);

-- Public INSERT for messages (anyone can send a contact message)
CREATE POLICY "Public insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access bio" ON bio FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access educations" ON educations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access experiences" ON experiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access skills" ON skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access certificates" ON certificates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access messages" ON messages FOR ALL USING (auth.role() = 'authenticated');


-- ============================================================
-- SEED DATA (dari portfolio.json yang sudah ada)
-- ============================================================

-- Bio
INSERT INTO bio (name, role, about, avatar, cv_url, socials) VALUES (
  'Alfin Rifaldy Siregar',
  'Fullstack Web Developer & UI/UX Designer',
  'Saya adalah seorang developer web yang berdedikasi dengan ketertarikan mendalam pada pembuatan aplikasi web modern yang cepat, aman, dan berestetika tinggi. Saya menyukai tantangan baru dan selalu berupaya meningkatkan keahlian saya dalam dunia pengembangan web.',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=387&auto=format&fit=crop',
  '#',
  '{"github": "https://github.com/alfinrifaldy", "linkedin": "https://linkedin.com/in/alfinrifaldy", "instagram": "https://instagram.com/alfinrifaldy", "email": "alfin.rifaldy@example.com"}'::jsonb
);

-- Educations
INSERT INTO educations (institution, degree, period, description, sort_order) VALUES
(
  'Universitas Sumatera Utara',
  'S1 Teknik Informatika',
  '2020 - 2024',
  'Fokus pada Rekayasa Perangkat Lunak, Basis Data, dan Pengembangan Aplikasi Web. Lulus dengan predikat sangat memuaskan.',
  1
),
(
  'SMA Negeri 1 Medan',
  'MIPA (Matematika dan Ilmu Pengetahuan Alam)',
  '2017 - 2020',
  'Aktif dalam organisasi komputer sekolah dan olimpiade fisika.',
  2
);

-- Experiences
INSERT INTO experiences (company, role, period, description, sort_order) VALUES
(
  'Tech Solutions Corp',
  'Frontend Developer',
  '2024 - Sekarang',
  'Mengembangkan antarmuka aplikasi web modern menggunakan React, Next.js, dan Tailwind CSS. Meningkatkan kecepatan loading aplikasi hingga 40%.',
  1
),
(
  'Web Kreasi Nusantara',
  'Web Developer Intern',
  'Jan 2023 - Jun 2023',
  'Membantu dalam pembuatan website company profile berbasis WordPress dan Laravel. Melakukan slicing UI design menjadi kode web.',
  2
);

-- Skills
INSERT INTO skills (name, level, category, sort_order) VALUES
('JavaScript & TypeScript', 90, 'Frontend', 1),
('React & Next.js', 85, 'Frontend', 2),
('Tailwind CSS', 95, 'Frontend', 3),
('Node.js & Express.js', 80, 'Backend', 4),
('MongoDB & Mongoose', 75, 'Backend', 5),
('UI/UX Design (Figma)', 80, 'Design', 6),
('NextJS Advanced', 90, 'Frontend', 7);

-- Projects
INSERT INTO projects (title, description, image, tags, github, demo, sort_order) VALUES
(
  'E-Commerce Gadget Modern',
  'Aplikasi e-commerce lengkap dengan cart, checkout, integrasi payment gateway Midtrans, dan admin panel.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=815&auto=format&fit=crop',
  ARRAY['Next.js', 'MongoDB', 'Tailwind CSS', 'Midtrans'],
  'https://github.com/alfinrifaldy/ecommerce',
  'https://ecommerce-demo.example.com',
  1
),
(
  'Dashboard Analitik Real-time',
  'Dashboard untuk memonitor trafik server dan performa web secara langsung dengan grafik interaktif.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=870&auto=format&fit=crop',
  ARRAY['React', 'Chart.js', 'Tailwind CSS', 'Socket.io'],
  'https://github.com/alfinrifaldy/analytics',
  'https://analytics-demo.example.com',
  2
);

-- Certificates
INSERT INTO certificates (title, issuer, date, image, sort_order) VALUES
(
  'Dicoding: Menjadi Front-End Web Developer Expert',
  'Dicoding Indonesia',
  'Maret 2024',
  'https://images.unsplash.com/photo-1589330694653-ded6df53f7ee?q=80&w=870&auto=format&fit=crop',
  1
),
(
  'AWS Certified Cloud Practitioner',
  'Amazon Web Services',
  'Desember 2023',
  'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=870&auto=format&fit=crop',
  2
);
