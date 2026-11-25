-- KI-generierte Beiträge: Kennzeichnung und tägliche Erzeugung.
--
-- Damit der Cron-Job funktioniert, müssen (vor dem ersten Lauf, gern auch
-- nach dieser Migration) zwei Secrets im Vault angelegt werden.
-- Die Werte NICHT ins Repository committen:
--
--   select vault.create_secret('https://<projekt-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<derselbe Wert wie CRON_SECRET der Edge Function>', 'cron_secret');

-- ---------------------------------------------------------------------------
-- Kennzeichnung KI-generierter Beiträge
-- ---------------------------------------------------------------------------
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.posts.ai_generated IS
  'true, wenn der Beitrag von der Edge Function generate-daily-posts erzeugt wurde.';

-- ---------------------------------------------------------------------------
-- Tägliche Ausführung um 05:00 UTC (06:00 MEZ / 07:00 MESZ)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- cron.schedule mit gleichem Namen ersetzt einen bestehenden Job.
SELECT cron.schedule(
  'generate-daily-posts',
  '0 5 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/generate-daily-posts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
