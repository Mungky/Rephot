-- Atomic concurrent-generation cap (max 3 status = processing per user).
-- Satu panggilan RPC dari PostgREST dijalankan dalam satu transaksi server;
-- pg_advisory_xact_lock mencegah race saat beberapa request paralel.

CREATE INDEX IF NOT EXISTS generations_user_processing_idx
  ON public.generations (user_id)
  WHERE status = 'processing';

CREATE OR REPLACE FUNCTION public.create_generation_safely(
  p_user_id uuid,
  p_payload jsonb
)
RETURNS SETOF public.generations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_count integer;
BEGIN
  -- Blok BEGIN/END = transaksi implisit dalam satu statement RPC dari klien.
  BEGIN
    PERFORM pg_advisory_xact_lock(
      88429101,
      hashtext(p_user_id::text)
    );

    SELECT count(*)::integer
    INTO v_count
    FROM public.generations
    WHERE user_id = p_user_id
      AND status = 'processing';

    IF v_count >= 3 THEN
      RAISE EXCEPTION 'MAX_CONCURRENT_REACHED'
        USING ERRCODE = 'P0001';
    END IF;

    RETURN QUERY
      INSERT INTO public.generations (
        user_id,
        input_image_url,
        style,
        prompt_used,
        tokens_charged,
        status,
        aspect_ratio,
        resolution
      )
      VALUES (
        p_user_id,
        trim(coalesce(p_payload->>'input_image_url', '')),
        trim(coalesce(p_payload->>'style', '')),
        coalesce(p_payload->>'prompt_used', ''),
        coalesce((p_payload->>'tokens_charged')::integer, 4),
        'processing',
        trim(coalesce(p_payload->>'aspect_ratio', '')),
        trim(coalesce(p_payload->>'resolution', ''))
      )
      RETURNING *;
  END;

  RETURN;
END;
$func$;

REVOKE ALL ON FUNCTION public.create_generation_safely(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_generation_safely(uuid, jsonb) TO service_role;

COMMENT ON FUNCTION public.create_generation_safely(uuid, jsonb) IS
  'Insert one generation row if user has fewer than 3 processing rows; else raise MAX_CONCURRENT_REACHED.';
