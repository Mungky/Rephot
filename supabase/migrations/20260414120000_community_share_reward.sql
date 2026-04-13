-- Community share: reward tokens + public flag + optional profiles.token_balance mirror.
-- Jalankan migrasi ini sebelum memakai POST /api/community/share.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS token_balance integer NOT NULL DEFAULT 0;

-- Error 23514 saat ADD CONSTRAINT CHECK tanpa NOT VALID = ada baris lama dengan `type` di luar daftar.
-- NOT VALID = baris yang sudah ada tidak dicek; hanya INSERT/UPDATE baru yang wajib memenuhi CHECK.
-- Setelah membersihkan/normalisasi data, kamu bisa: VALIDATE CONSTRAINT token_transactions_type_check;

ALTER TABLE public.token_transactions DROP CONSTRAINT IF EXISTS token_transactions_type_check;

ALTER TABLE public.token_transactions
  ADD CONSTRAINT token_transactions_type_check
  CHECK (type IN ('welcome_bonus', 'purchase', 'generate', 'reward'))
  NOT VALID;

CREATE OR REPLACE FUNCTION public.claim_community_share_reward(
  p_generation_id uuid,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_status text;
  v_is_public boolean;
  v_uid uuid;
BEGIN
  SELECT g.status, g.is_public, g.user_id
  INTO v_status, v_is_public, v_uid
  FROM public.generations g
  WHERE g.id = p_generation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  END IF;

  IF v_uid IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('ok', false, 'code', 'FORBIDDEN');
  END IF;

  IF v_status IS DISTINCT FROM 'completed' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_COMPLETED');
  END IF;

  IF v_is_public THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ALREADY_SHARED');
  END IF;

  UPDATE public.generations
  SET is_public = true
  WHERE id = p_generation_id;

  INSERT INTO public.token_transactions (
    user_id,
    amount,
    type,
    description,
    reference_id
  )
  VALUES (
    p_user_id,
    1,
    'reward',
    'Community Share Bonus',
    p_generation_id::text
  );

  INSERT INTO public.profiles (id, token_balance, updated_at)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (id) DO UPDATE SET
    token_balance = COALESCE(public.profiles.token_balance, 0) + 1,
    updated_at = excluded.updated_at;

  RETURN jsonb_build_object('ok', true);
END;
$fn$;

REVOKE ALL ON FUNCTION public.claim_community_share_reward(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_community_share_reward(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.claim_community_share_reward(uuid, uuid) IS
  'Atomically set generation public, credit +1 reward transaction, bump profiles.token_balance.';
