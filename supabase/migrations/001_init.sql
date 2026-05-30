-- ─────────────────────────────────────────────────────────────────────────────
-- 001_init.sql — Antigravity initial schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url   TEXT,
  credits      INT DEFAULT 10,
  plan         TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Generations
CREATE TABLE IF NOT EXISTS public.generations (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id              UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id                 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                  TEXT DEFAULT 'queued' CHECK (status IN ('queued','processing','done','failed')),
  product_group           TEXT,
  product_subgroup        TEXT,
  product_type            TEXT,
  resolution              TEXT,
  aspect_ratio            TEXT,
  short_overlay_text      TEXT,
  detailed_marketing_text TEXT,
  logo_position           TEXT,
  user_preferences        TEXT,
  output_url              TEXT,
  error_message           TEXT,
  duration_ms             INT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  completed_at            TIMESTAMPTZ
);

-- Uploaded Images
CREATE TABLE IF NOT EXISTS public.uploaded_images (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  type          TEXT CHECK (type IN ('product', 'reference', 'logo')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users own their projects"
  ON public.projects FOR ALL USING (auth.uid() = user_id);

-- Generations
CREATE POLICY "Users own their generations"
  ON public.generations FOR ALL USING (auth.uid() = user_id);

-- Uploaded Images
CREATE POLICY "Users own their uploads"
  ON public.uploaded_images FOR ALL
  USING (
    generation_id IN (
      SELECT id FROM public.generations WHERE user_id = auth.uid()
    )
  );

-- ─── Storage Buckets ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('products',   'products',   false),
  ('references', 'references', false),
  ('logos',      'logos',      false),
  ('generated',  'generated',  true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload/read their own files
CREATE POLICY "Auth users upload products"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

CREATE POLICY "Auth users read products"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'products');

CREATE POLICY "Auth users upload references"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'references');

CREATE POLICY "Auth users read references"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'references');

CREATE POLICY "Auth users upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Auth users read logos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'logos');

-- Generated images are public
CREATE POLICY "Public can read generated"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'generated');

CREATE POLICY "Service role uploads generated"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'generated');
