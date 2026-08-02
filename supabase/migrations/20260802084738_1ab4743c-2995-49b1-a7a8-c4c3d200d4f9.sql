ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS doc_url text,
  ADD COLUMN IF NOT EXISTS doc_path text,
  ADD COLUMN IF NOT EXISTS designs text[] NOT NULL DEFAULT '{}'::text[];