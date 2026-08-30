-- Schema Supabase / PostgreSQL pentru Sistem Management Elevi Vulnerabili (Model CJRAE BN)
-- Școala Gimnazială „Grigore Silași” Beclean

-- 1. Tabele de bază

-- Tabel Clase
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level TEXT,
  total_students INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Diriginți / Cadre Didactice
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Asocieri (Diriginte - Clasă - Acces PIN/Token)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  pin VARCHAR(6) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'asteptare', -- 'asteptare', 'trimis', 'completat'
  invited_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, teacher_id)
);

-- Tabel Formular Categorii Vulnerabilitate (Configurabil de Consilier)
CREATE TABLE IF NOT EXISTS public.form_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checkbox_notes', -- 'text' sau 'checkbox_notes'
  position INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Elevi Inregistrați per Clasă
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 1,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Vulnerabilități per Elev
CREATE TABLE IF NOT EXISTS public.student_vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.form_categories(id) ON DELETE CASCADE,
  checked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT '',
  UNIQUE(student_id, category_id)
);

-- 2. Seed inițial - Categorii Standard CJRAE BN
INSERT INTO public.form_categories (key, label, type, position, visible, is_custom) VALUES
('rezultate_slabe', 'Rezultate școlare slabe (corigențe / repetenție)', 'checkbox_notes', 1, true, false),
('comportament', 'Probleme de comportament (bullying, disciplină)', 'checkbox_notes', 2, true, false),
('absenteism', 'Absenteism școlar', 'checkbox_notes', 3, true, false),
('substante', 'Consum de substanțe', 'checkbox_notes', 4, true, false),
('ces', 'CES (cu certificat CJRAE)', 'checkbox_notes', 5, true, false),
('familiala', 'Situație familială (divorț, deces, plecați străinătate, plasament)', 'checkbox_notes', 6, true, false),
('remigrati', 'Copii remigrați', 'checkbox_notes', 7, true, false),
('alte_situatii', 'Alte situații (handicap, diagnostic medical etc.)', 'checkbox_notes', 8, true, false)
ON CONFLICT (key) DO NOTHING;
