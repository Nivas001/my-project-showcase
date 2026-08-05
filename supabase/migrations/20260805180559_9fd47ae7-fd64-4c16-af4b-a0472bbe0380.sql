CREATE TABLE public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game text NOT NULL,
  nickname text NOT NULL,
  score integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.game_scores TO anon;
GRANT SELECT ON public.game_scores TO authenticated;
GRANT ALL ON public.game_scores TO service_role;

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game scores are publicly readable" ON public.game_scores
FOR SELECT TO public USING (true);