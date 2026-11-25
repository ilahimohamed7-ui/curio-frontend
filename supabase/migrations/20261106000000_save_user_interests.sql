CREATE OR REPLACE FUNCTION public.save_user_interests(p_categories text[])
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '28000';
  END IF;

  IF p_categories IS NULL THEN
    RAISE EXCEPTION 'Categories must be provided'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(p_categories) AS requested(category)
    WHERE requested.category IS NULL
       OR requested.category NOT IN (
         'Wissenschaft',
         'Technologie',
         'Psychologie'
       )
  ) THEN
    RAISE EXCEPTION 'One or more categories are invalid'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_interests (user_id, category)
  SELECT v_user_id, requested.category
  FROM (
    SELECT DISTINCT categories.category
    FROM unnest(p_categories) AS categories(category)
  ) AS requested
  ON CONFLICT (user_id, category) DO NOTHING;

  DELETE FROM public.user_interests AS stored
  WHERE stored.user_id = v_user_id
    AND NOT (stored.category = ANY (p_categories));
END;
$function$;

REVOKE ALL ON FUNCTION public.save_user_interests(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_user_interests(text[]) TO authenticated;
