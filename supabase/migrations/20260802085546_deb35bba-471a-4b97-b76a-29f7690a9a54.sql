CREATE TABLE public.skill_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  items text[] NOT NULL DEFAULT '{}'::text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.skill_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_groups TO authenticated;
GRANT ALL ON public.skill_groups TO service_role;

ALTER TABLE public.skill_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skill groups are publicly readable" ON public.skill_groups FOR SELECT USING (true);
CREATE POLICY "Admins can insert skill groups" ON public.skill_groups FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update skill groups" ON public.skill_groups FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete skill groups" ON public.skill_groups FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER skill_groups_set_updated_at BEFORE UPDATE ON public.skill_groups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.skill_groups (name, items, sort_order) VALUES
  ('Languages', ARRAY['Python','Java','C','SQL','Dart','JavaScript'], 0),
  ('Frameworks & Libraries', ARRAY['Flutter','React','Node.js','Streamlit','TensorFlow','spaCy','NLTK'], 1),
  ('Tools & Platforms', ARRAY['Git','GitHub','Firebase','Supabase','Hugging Face','VS Code','Android Studio'], 2),
  ('Concepts', ARRAY['NLP','Machine Learning','Deep Learning','REST APIs','Data Structures','DBMS'], 3);