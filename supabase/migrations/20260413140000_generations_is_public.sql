-- Public gallery flag for Community feed
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS generations_is_public_created_idx
  ON public.generations (is_public, created_at DESC)
  WHERE is_public = true;

COMMENT ON COLUMN public.generations.is_public IS
  'When true, generation may appear in the Community gallery (output visible to other users).';
