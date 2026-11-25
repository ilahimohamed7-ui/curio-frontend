-- Basis-Schema von Curio: Tabellen posts und user_interests.
--
-- Bildet den Stand der produktiven Datenbank ab. Das Skript ist idempotent:
-- Auf einer bestehenden Datenbank ändert es nichts an vorhandenen Tabellen,
-- auf einer leeren Datenbank legt es alles vollständig an.

-- ---------------------------------------------------------------------------
-- posts: Wissensbeiträge im Feed
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text        NOT NULL,
  category    text        NOT NULL
    CONSTRAINT posts_category_check
    CHECK (category IN ('Wissenschaft', 'Technologie', 'Psychologie')),
  source      text        NOT NULL,
  emoji       text        NOT NULL DEFAULT '💡',
  color       text        NOT NULL DEFAULT 'purple'
    CONSTRAINT posts_color_check
    CHECK (color IN ('purple', 'blue', 'orange')),
  likes       integer     NOT NULL DEFAULT 0 CHECK (likes >= 0),
  comments    integer     NOT NULL DEFAULT 0 CHECK (comments >= 0),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.posts IS 'Wissensbeiträge, die im Feed angezeigt werden.';

-- Der Feed filtert nach Kategorie und sortiert nach Datum.
CREATE INDEX IF NOT EXISTS posts_category_created_at_idx
  ON public.posts (category, created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Angemeldete Benutzer dürfen alle Beiträge lesen. Schreiben ist nur
-- serverseitig erlaubt (Service Role, z. B. eine Edge Function).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND policyname = 'Authenticated users can read posts'
  ) THEN
    CREATE POLICY "Authenticated users can read posts"
      ON public.posts FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- user_interests: gewählte Themen pro Benutzer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id  uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category text NOT NULL
    CONSTRAINT user_interests_category_check
    CHECK (category IN ('Wissenschaft', 'Technologie', 'Psychologie')),
  PRIMARY KEY (user_id, category)
);

COMMENT ON TABLE public.user_interests IS 'Themen, die ein Benutzer in seinem Feed sehen möchte.';

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- Zugriffsregeln (Policies) und eindeutige Interessen pro Benutzer:
-- siehe 20261125000000_user_interests_constraints.sql
