-- =============================================================
-- SPEED DATING EVENT - TABELAS ISOLADAS
-- =============================================================
-- Estas tabelas são NOVAS e não mexem nas tabelas existentes
-- do projeto (profiles, etc.)
-- =============================================================

-- =============================================================
-- 1. SPEED_DATING_PROFILES - Perfis dos participantes
-- =============================================================
CREATE TABLE public.speed_dating_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  avatar_url       TEXT,
  gender           TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  interested_in    TEXT CHECK (interested_in IN ('men', 'women', 'everyone')),
  is_admin         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id)
);

CREATE INDEX idx_speed_dating_profiles_user_id ON public.speed_dating_profiles(user_id);

-- =============================================================
-- 2. SPEED_DATING_CONNECTIONS - Quem escaneou quem
-- =============================================================
CREATE TABLE public.speed_dating_connections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id  UUID NOT NULL REFERENCES public.speed_dating_profiles(id) ON DELETE CASCADE,
  scanned_id  UUID NOT NULL REFERENCES public.speed_dating_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_speed_dating_connection UNIQUE (scanner_id, scanned_id),
  CONSTRAINT no_self_scan CHECK (scanner_id <> scanned_id)
);

CREATE INDEX idx_speed_dating_connections_scanner ON public.speed_dating_connections(scanner_id);
CREATE INDEX idx_speed_dating_connections_scanned ON public.speed_dating_connections(scanned_id);

-- =============================================================
-- 3. SPEED_DATING_LIKES - Votação
-- =============================================================
CREATE TABLE public.speed_dating_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id    UUID NOT NULL REFERENCES public.speed_dating_profiles(id) ON DELETE CASCADE,
  liked_id    UUID NOT NULL REFERENCES public.speed_dating_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_speed_dating_like UNIQUE (liker_id, liked_id),
  CONSTRAINT no_self_like CHECK (liker_id <> liked_id)
);

CREATE INDEX idx_speed_dating_likes_liker ON public.speed_dating_likes(liker_id);
CREATE INDEX idx_speed_dating_likes_liked ON public.speed_dating_likes(liked_id);

-- =============================================================
-- 4. SPEED_DATING_SETTINGS - Controles do admin (singleton)
-- =============================================================
CREATE TABLE public.speed_dating_settings (
  id                   INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_voting_open       BOOLEAN NOT NULL DEFAULT false,
  are_matches_revealed BOOLEAN NOT NULL DEFAULT false,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed do singleton
INSERT INTO public.speed_dating_settings (id) VALUES (1);

-- =============================================================
-- 5. REALTIME
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.speed_dating_settings;

-- =============================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================

-- speed_dating_profiles --
ALTER TABLE public.speed_dating_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Speed dating profiles são públicos para autenticados"
  ON public.speed_dating_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users podem criar seu próprio speed dating profile"
  ON public.speed_dating_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users podem atualizar seu próprio speed dating profile"
  ON public.speed_dating_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- speed_dating_connections --
ALTER TABLE public.speed_dating_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users veem suas próprias connections"
  ON public.speed_dating_connections FOR SELECT
  USING (
    scanner_id IN (
      SELECT id FROM public.speed_dating_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users podem criar connections"
  ON public.speed_dating_connections FOR INSERT
  WITH CHECK (
    scanner_id IN (
      SELECT id FROM public.speed_dating_profiles WHERE user_id = auth.uid()
    )
  );

-- speed_dating_likes --
ALTER TABLE public.speed_dating_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users podem dar like quando voting está aberto"
  ON public.speed_dating_likes FOR INSERT
  WITH CHECK (
    liker_id IN (
      SELECT id FROM public.speed_dating_profiles WHERE user_id = auth.uid()
    )
    AND EXISTS (SELECT 1 FROM public.speed_dating_settings WHERE is_voting_open = true)
  );

CREATE POLICY "Users veem seus próprios likes"
  ON public.speed_dating_likes FOR SELECT
  USING (
    liker_id IN (
      SELECT id FROM public.speed_dating_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users veem likes recebidos quando matches revelados"
  ON public.speed_dating_likes FOR SELECT
  USING (
    liked_id IN (
      SELECT id FROM public.speed_dating_profiles WHERE user_id = auth.uid()
    )
    AND EXISTS (SELECT 1 FROM public.speed_dating_settings WHERE are_matches_revealed = true)
  );

CREATE POLICY "Users podem deletar seus próprios likes"
  ON public.speed_dating_likes FOR DELETE
  USING (
    liker_id IN (
      SELECT id FROM public.speed_dating_profiles WHERE user_id = auth.uid()
    )
  );

-- speed_dating_settings --
ALTER TABLE public.speed_dating_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos autenticados podem ler settings"
  ON public.speed_dating_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem atualizar settings"
  ON public.speed_dating_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.speed_dating_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
