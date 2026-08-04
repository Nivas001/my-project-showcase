ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slides_url text,
  ADD COLUMN IF NOT EXISTS slides_path text;