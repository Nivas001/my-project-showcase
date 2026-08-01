CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  tech text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'Web',
  period text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  live_url text,
  github_url text,
  screenshots text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are publicly readable"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.projects (slug, title, summary, description, highlights, tech, category, period, role, github_url, featured, sort_order) VALUES
('tamil-text-summarization',
 'Tamil Text Summarization using NER',
 'Research-level NLP system that summarizes Tamil sports news while preserving key named entities.',
 'A Tamil sports news summarization system combining Named Entity Recognition with abstractive deep learning. The model preserves critical entities — players, scores, locations — that generic summarizers routinely drop, reducing information loss by roughly 30% against the baseline. Built as my postgraduate main project at Pondicherry University.',
 ARRAY['Combined NER with abstractive deep learning to preserve players, scores and locations in generated summaries','Reduced information loss by ~30% compared to the baseline summarizer','Solved low-resource language challenges: Tamil-specific tokenization, normalization and preprocessing','Trained and evaluated on a curated Tamil sports news corpus'],
 ARRAY['Python','NLTK','SpaCy','TensorFlow','Deep Learning','NER'],
 'Research', 'Jan 2025 – Jun 2025', 'PG Main Project — Sole developer', NULL, true, 1),
('clinical-dental-care',
 'Clinical Assistance for Dental Care',
 'Full-stack dental consultation platform with appointments, patient records and digital prescriptions.',
 'A full-stack web application for dental clinics that manages appointments, patient records and digital prescriptions, backed by a real-time Firestore admin dashboard and secure cloud-based history tracking. The React interface is fully responsive across desktop and mobile.',
 ARRAY['Appointment booking and management with real-time status updates','Patient records and digital prescription generation','Real-time Firestore admin dashboard with secure cloud history tracking','Responsive React.js UI verified across desktop, tablet and mobile'],
 ARRAY['React.js','Firebase','Firestore','JavaScript','CSS'],
 'Web', 'Jul 2024 – Nov 2024', 'Full-stack developer', NULL, true, 2),
('centac-android-app',
 'Android App for CENTAC, Puducherry',
 'Flutter app for the Centralised Admission Committee with real-time data and authentication.',
 'A team-built Android application for the Centralised Admission Committee (CENTAC), Puducherry. Built with Flutter and Dart, integrated with Firebase for real-time data management and authentication so applicants could track admission information from their phones. Undergraduate main project.',
 ARRAY['Built with Flutter and Dart for Android','Firebase authentication and real-time data management','Delivered as a collaborative team project','UG main project for a live government admissions body'],
 ARRAY['Flutter','Dart','Firebase','Android'],
 'Mobile', 'Jan 2023 – Jun 2023', 'UG Main Project — Team member', NULL, false, 3),
('live-project-one',
 'Live Project One',
 'Add your first hosted project details from the admin panel.',
 'This is a placeholder entry. Sign in to the admin panel to replace the title, description, screenshots, live URL and GitHub repository with your real hosted project.',
 ARRAY['Replace these highlights from the admin panel'],
 ARRAY['React'],
 'Live', '2025', 'Developer', NULL, false, 4),
('live-project-two',
 'Live Project Two',
 'Add your second hosted project details from the admin panel.',
 'This is a placeholder entry. Sign in to the admin panel to replace the title, description, screenshots, live URL and GitHub repository with your real hosted project.',
 ARRAY['Replace these highlights from the admin panel'],
 ARRAY['Python'],
 'Live', '2025', 'Developer', NULL, false, 5);