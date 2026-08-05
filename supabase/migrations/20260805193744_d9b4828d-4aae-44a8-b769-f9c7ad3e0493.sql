CREATE TABLE public.horror_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story text NOT NULL,
  ending text NOT NULL,
  outcome text NOT NULL DEFAULT 'doomed',
  nickname text NOT NULL DEFAULT '',
  choices text[] NOT NULL DEFAULT '{}'::text[],
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX horror_runs_story_idx ON public.horror_runs (story);

GRANT SELECT ON public.horror_runs TO anon;
GRANT SELECT ON public.horror_runs TO authenticated;
GRANT ALL ON public.horror_runs TO service_role;

ALTER TABLE public.horror_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Horror runs are publicly readable" ON public.horror_runs
FOR SELECT TO public USING (true);