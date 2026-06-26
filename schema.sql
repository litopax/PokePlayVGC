
-- ============================================================
-- Pokémon Champions Team Builder - Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL DEFAULT 'Mi equipo',
  showdown_format  TEXT,
  team_data        JSONB NOT NULL DEFAULT '[]',
  share_token      TEXT UNIQUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own teams" ON public.teams
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow anyone to read a team by share_token (public view)
CREATE POLICY "Public can read shared teams" ON public.teams
  FOR SELECT USING (share_token IS NOT NULL);

-- If teams table already exists, add share_token column:
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Team versions (history)
CREATE TABLE IF NOT EXISTS public.team_versions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id        UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  version_number INT  NOT NULL DEFAULT 1,
  team_data      JSONB NOT NULL,
  note           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.team_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own versions" ON public.team_versions
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.teams WHERE id = team_id)
  );
CREATE POLICY "Users can insert own versions" ON public.team_versions
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.teams WHERE id = team_id)
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on teams
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS teams_updated_at ON public.teams;
CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
