-- Wavespeed task tracking + align with app (aspect ratio / resolution from ControlPanel)
-- Run in Supabase SQL Editor or via CLI migrate.

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS aspect_ratio text,
  ADD COLUMN IF NOT EXISTS resolution text,
  ADD COLUMN IF NOT EXISTS wavespeed_task_id text,
  ADD COLUMN IF NOT EXISTS wavespeed_submit jsonb,
  ADD COLUMN IF NOT EXISTS wavespeed_status jsonb,
  ADD COLUMN IF NOT EXISTS error_message text;

COMMENT ON COLUMN public.generations.aspect_ratio IS 'User-selected aspect ratio, e.g. 1:1, 9:16';
COMMENT ON COLUMN public.generations.resolution IS 'User-selected resolution, lowercase e.g. 1k, 4k';
COMMENT ON COLUMN public.generations.wavespeed_task_id IS 'Wavespeed prediction task id after submit';
COMMENT ON COLUMN public.generations.wavespeed_submit IS 'Full payload from Wavespeed task submit (task_id, model, parameters, …)';
COMMENT ON COLUMN public.generations.wavespeed_status IS 'Last Wavespeed getStatus response data object (outputs, timings, …)';

CREATE INDEX IF NOT EXISTS generations_wavespeed_task_id_idx ON public.generations (wavespeed_task_id)
  WHERE wavespeed_task_id IS NOT NULL;
