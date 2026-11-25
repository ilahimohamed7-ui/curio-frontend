-- Voraussetzungen für save_user_interests():
-- eindeutige Interessen pro Benutzer, Row Level Security und Zugriffsregeln.
-- Das Skript ist idempotent und kann gefahrlos mehrfach ausgeführt werden.

CREATE UNIQUE INDEX IF NOT EXISTS user_interests_user_id_category_key
  ON public.user_interests (user_id, category);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_interests'
      AND policyname = 'Users can read own interests'
  ) THEN
    CREATE POLICY "Users can read own interests"
      ON public.user_interests FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_interests'
      AND policyname = 'Users can insert own interests'
  ) THEN
    CREATE POLICY "Users can insert own interests"
      ON public.user_interests FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_interests'
      AND policyname = 'Users can delete own interests'
  ) THEN
    CREATE POLICY "Users can delete own interests"
      ON public.user_interests FOR DELETE
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END
$$;
