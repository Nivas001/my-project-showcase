ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS github_visibility text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS downloads jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_github_visibility_check
  CHECK (github_visibility IN ('none', 'public', 'private'));

UPDATE public.projects SET github_visibility = 'public' WHERE github_url IS NOT NULL AND github_url <> '';