-- ==============================================================================
-- MASTER SUPABASE SETUP SCRIPT FOR PORTFOLIO (nivas.tech)
-- Run this entire script in your new Supabase Project SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. UPDATED_AT TRIGGER FUNCTION
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

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 3. USER ROLES TABLE & HAS_ROLE FUNCTION
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}'::text[],
  tech text[] NOT NULL DEFAULT '{}'::text[],
  category text NOT NULL DEFAULT 'Web',
  period text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  live_url text,
  github_url text,
  github_visibility text NOT NULL DEFAULT 'none' CHECK (github_visibility IN ('none', 'public', 'private')),
  downloads jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  doc_url text,
  doc_path text,
  slides_url text,
  slides_path text,
  screenshots text[] NOT NULL DEFAULT '{}'::text[],
  designs text[] NOT NULL DEFAULT '{}'::text[],
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projects are publicly readable" ON public.projects;
CREATE POLICY "Projects are publicly readable" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. SKILL GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.skill_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  items text[] NOT NULL DEFAULT '{}'::text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.skill_groups TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skill_groups TO authenticated;
GRANT ALL ON public.skill_groups TO service_role;
ALTER TABLE public.skill_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Skill groups are publicly readable" ON public.skill_groups;
CREATE POLICY "Skill groups are publicly readable" ON public.skill_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert skill groups" ON public.skill_groups;
CREATE POLICY "Admins can insert skill groups" ON public.skill_groups FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update skill groups" ON public.skill_groups;
CREATE POLICY "Admins can update skill groups" ON public.skill_groups FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete skill groups" ON public.skill_groups;
CREATE POLICY "Admins can delete skill groups" ON public.skill_groups FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS skill_groups_set_updated_at ON public.skill_groups;
CREATE TRIGGER skill_groups_set_updated_at
  BEFORE UPDATE ON public.skill_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  issued_on text NOT NULL DEFAULT '',
  credential_url text,
  images text[] NOT NULL DEFAULT '{}'::text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certificates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Certificates are publicly readable" ON public.certificates;
CREATE POLICY "Certificates are publicly readable" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert certificates" ON public.certificates;
CREATE POLICY "Admins can insert certificates" ON public.certificates FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update certificates" ON public.certificates;
CREATE POLICY "Admins can update certificates" ON public.certificates FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete certificates" ON public.certificates;
CREATE POLICY "Admins can delete certificates" ON public.certificates FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS certificates_set_updated_at ON public.certificates;
CREATE TRIGGER certificates_set_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  company text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT 'Full-time',
  start_date text NOT NULL DEFAULT '',
  end_date text NOT NULL DEFAULT '',
  is_current boolean NOT NULL DEFAULT false,
  summary text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}'::text[],
  tech text[] NOT NULL DEFAULT '{}'::text[],
  company_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.experiences TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Experiences are publicly readable" ON public.experiences;
CREATE POLICY "Experiences are publicly readable" ON public.experiences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert experiences" ON public.experiences;
CREATE POLICY "Admins can insert experiences" ON public.experiences FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update experiences" ON public.experiences;
CREATE POLICY "Admins can update experiences" ON public.experiences FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete experiences" ON public.experiences;
CREATE POLICY "Admins can delete experiences" ON public.experiences FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS experiences_set_updated_at ON public.experiences;
CREATE TRIGGER experiences_set_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. GAME SCORES TABLE
CREATE TABLE IF NOT EXISTS public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game text NOT NULL,
  nickname text NOT NULL,
  score integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.game_scores TO anon, authenticated;
GRANT ALL ON public.game_scores TO service_role;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Game scores are publicly readable" ON public.game_scores;
CREATE POLICY "Game scores are publicly readable" ON public.game_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public score submissions" ON public.game_scores;
CREATE POLICY "Allow public score submissions" ON public.game_scores FOR INSERT WITH CHECK (true);

-- 9. HORROR RUNS TABLE
CREATE TABLE IF NOT EXISTS public.horror_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story text NOT NULL,
  ending text NOT NULL,
  outcome text NOT NULL DEFAULT 'doomed',
  nickname text NOT NULL DEFAULT '',
  choices text[] NOT NULL DEFAULT '{}'::text[],
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS horror_runs_story_idx ON public.horror_runs (story);

GRANT SELECT, INSERT ON public.horror_runs TO anon, authenticated;
GRANT ALL ON public.horror_runs TO service_role;
ALTER TABLE public.horror_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Horror runs are publicly readable" ON public.horror_runs;
CREATE POLICY "Horror runs are publicly readable" ON public.horror_runs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public horror run submissions" ON public.horror_runs;
CREATE POLICY "Allow public horror run submissions" ON public.horror_runs FOR INSERT WITH CHECK (true);

-- 10. STORAGE BUCKET FOR SCREENSHOTS & DOCS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-screenshots', 'project-screenshots', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view screenshots" ON storage.objects;
CREATE POLICY "Public can view screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'project-screenshots');

DROP POLICY IF EXISTS "Admins can upload project screenshots" ON storage.objects;
CREATE POLICY "Admins can upload project screenshots" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-screenshots' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update project screenshots" ON storage.objects;
CREATE POLICY "Admins can update project screenshots" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-screenshots' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete project screenshots" ON storage.objects;
CREATE POLICY "Admins can delete project screenshots" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-screenshots' AND public.has_role(auth.uid(), 'admin'));

-- 11. INSERT DEFAULT SKILL GROUPS
INSERT INTO public.skill_groups (id, name, items, sort_order) VALUES
  ('1a7e88f4-8a27-4bb8-a569-47ddff3d69b7', 'Languages', ARRAY['Python','Java','C','SQL','Dart','JavaScript']::text[], 0),
  ('a594f308-3c09-4ab7-8f35-adc646cb1af4', 'Frameworks & Libraries', ARRAY['Flutter','React','Node.js','Streamlit','TensorFlow','spaCy','NLTK']::text[], 1),
  ('6f6cf824-8ca6-4219-9fe1-4ad013bce109', 'Tools & Platforms', ARRAY['Git','GitHub','Firebase','Supabase','Hugging Face','VS Code','Android Studio']::text[], 2),
  ('aa68d709-2df4-4592-b098-d2e937b8ec11', 'Concepts', ARRAY['NLP','Machine Learning','Deep Learning','REST APIs','Data Structures','DBMS']::text[], 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  items = EXCLUDED.items,
  sort_order = EXCLUDED.sort_order;

-- 12. INSERT ALL 6 PROJECTS WITH FULL DETAILS
INSERT INTO public.projects (
  id, slug, title, summary, description, highlights, tech, category,
  period, role, live_url, github_url, github_visibility, downloads,
  video_url, doc_url, doc_path, slides_url, slides_path,
  screenshots, designs, featured, sort_order, created_at, updated_at
) VALUES (
  '56b2b0b1-620d-49f4-860c-fa0fcadc396a',
  'clinical-dental-care',
  'Clinical Assistance for Dental Care',
  'Full-stack dental consultation platform with appointments, patient records and digital prescriptions.',
  'A full-stack web application for dental clinics that manages appointments, patient records and digital prescriptions, backed by a real-time Firestore admin dashboard and secure cloud-based history tracking. The React interface is fully responsive across desktop and mobile.',
  ARRAY['Appointment booking and management with real-time status updates', 'Patient records and digital prescription generation', 'Real-time Firestore admin dashboard with secure cloud history tracking', 'Responsive React.js UI verified across desktop, tablet and mobile']::text[],
  ARRAY['React.js', 'Firebase', 'Firestore', 'JavaScript', 'CSS']::text[],
  'Web',
  'Jul 2024 – Nov 2024',
  'Full-stack developer',
  NULL,
  NULL,
  'none',
  '[]'::jsonb,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}'::text[],
  '{}'::text[],
  false,
  6,
  '2026-08-01T17:16:00.967994+00:00',
  '2026-08-24T16:51:34.856933+00:00'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tech = EXCLUDED.tech,
  category = EXCLUDED.category,
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  live_url = EXCLUDED.live_url,
  github_url = EXCLUDED.github_url,
  github_visibility = EXCLUDED.github_visibility,
  downloads = EXCLUDED.downloads,
  video_url = EXCLUDED.video_url,
  doc_url = EXCLUDED.doc_url,
  doc_path = EXCLUDED.doc_path,
  slides_url = EXCLUDED.slides_url,
  slides_path = EXCLUDED.slides_path,
  screenshots = EXCLUDED.screenshots,
  designs = EXCLUDED.designs,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.projects (
  id, slug, title, summary, description, highlights, tech, category,
  period, role, live_url, github_url, github_visibility, downloads,
  video_url, doc_url, doc_path, slides_url, slides_path,
  screenshots, designs, featured, sort_order, created_at, updated_at
) VALUES (
  '8c91c96e-8c60-4872-b6c4-e7e3733b9708',
  'anibakes',
  'Ani Bakes - E-comerce Platform',
  'A modern, high-performance artisanal e-commerce web platform for a boutique bakery. Features small-batch slot scheduling, bespoke cake customization, multi-tier pricing, Razorpay checkout, and an admin operations hub with drag-and-drop media reordering.
',
  'Overview & Client Objective
Ani Bakes is a boutique artisanal bakery in Pondicherry specializing in small-batch cakes, sourdough breads, French pastries, and handcrafted desserts. The client needed a bespoke, high-converting digital storefront to transition from manual WhatsApp orders to an automated, scalable ordering and production scheduling system.

Core Architectural Features (50% Milestone Accomplished)

1. Artisan Catalog & Category Lanes (`/shop`)
   - Engineered horizontal responsive category lanes supporting 1 to 4 multi-row desktop layouts and 2-column mobile bento grids.
   - Real-time search with GodUI 3D MagicInput, category MultiButton action rails, and price/curation sorting.

2. Bespoke Product & Tiered Pricing Architecture (`/shop/$slug`)
   - Multi-image swipe gallery with real-time thumbnail strip.
   - Dynamic weight/size selectors (0.5kg, 1kg, 1.5kg, etc.) with automatic tiered volume discount calculations.
   - Animated 3-step order pipeline (*1. Choose Cake → 2. Pay → 3. Delivery*) powered by Framer Motion spring physics.

3. Smart Slot-Based Production & Cart Engine (`/cart`, `/checkout`)
   - Implemented 24-hour advance slot booking across Morning, Midday, Afternoon, and Evening batches to prevent kitchen overcapacity.
   - Dynamic cart state management with minimum order thresholds and automatic delivery fee calculation.

4. Interactive Brand Experience & Customizer (`/`)
   - Interactive 3D Cake Customizer Widget for personalized party cake inquiries.
   - Polaroid Customer Moments Wall and Baker''s Laboratory Bento showcase.
   - Accessible GodUI Spring Accordion FAQ section with category filtering.

5. Appwrite Cloud Admin Operations Suite (`/admin`)
   - Role-Based Access Control (RBAC) protecting order fulfillment and product management.
   - Drag-and-drop GodUI gallery reordering with live database synchronization.
   - Gamified coupon code generator (`/play-coupons`) and targeted customer newsletter broadcast manager.

6. Payment & Security Infrastructure
   - End-to-end Razorpay payment processing with automated server-side webhook signature validation and CSRF protection.
   - Deployed on Cloudflare edge workers for high reliability, instant cold starts, and zero downtime.

 Next Development Milestones (Roadmap)
- Real-time delivery driver tracking integration.
- AI-driven personalized flavor recommendations based on past customer orders.
- Automated WhatsApp Cloud API order status updates and delivery notifications.
',
  ARRAY['Built with TanStack Start SSR & Nitro engine deployed on Cloudflare edge for sub-100ms global response times.', 'Dynamic bakery catalog with horizontal multi-row category lanes and GodUI smooth spring animations.', 'Bespoke product detail experience with multi-angle image gallery and tiered cake weight variant selectors.', '24-hour advance slot scheduling system (Morning, Midday, Afternoon, Evening) enforcing kitchen capacity limits.', 'Integrated Appwrite Cloud backend for real-time order tracking, customer authentication, and RBAC admin suite.', 'GodUI drag-and-drop media reordering atelier and instant newsletter broadcasting engine for admin operations.', 'Seamless Razorpay payment gateway integration with server-side HMAC SHA256 webhook verification.', 'Interactive customer engagement features including Cake Builder Customizer and gamified coupon scratch wheels.']::text[],
  ARRAY['React 19', 'TanStack Start', 'TanStack Router (SSR)', 'TypeScript', 'Vite', 'Nitro Server Engine', 'Appwrite Cloud (Auth & DB)', 'Razorpay API', 'Framer Motion', 'GodUI Design System', 'Tailwind CSS', 'Cloudflare Workers']::text[],
  'Web',
  '2025 Jul - Still on Devlopment',
  'Solo Dev',
  'https://www.anibakes.app',
  'https://github.com/Nivas001/Bakesite.git',
  'public',
  '[]'::jsonb,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY['a/1787589946915-hero-page.png', 'a/1787589944860-next-to-hero-section.png', 'a/1787589944543-homepage-section.png', 'a/1787589943930-review-section.png', 'a/1787589946047-products-section.png', 'a/1787589945196-orders-section.png', 'a/1787589945772-gallery-section.png', 'a/1787589946392-checkout-page.png', 'a/1787589945442-offers-section.png', 'a/1787589946632-account-details-page.png']::text[],
  ARRAY['a/designs/1787590023500-hero-page.png', 'a/designs/1787590022935-home.png', 'a/designs/1787590022643-shop.png', 'a/designs/1787590022028-about-page.png', 'a/designs/1787590021507-orders-page.png', 'a/designs/1787590021730-offers-page.png', 'a/designs/1787590021210-account-details-page.png', 'a/designs/1787590020996-checkout-page.png', 'a/designs/1787590017558-gallery-section.png', 'a/designs/1787590017082-review-section.png', 'a/designs/1787590020763-admin-orders-page.png', 'a/designs/1787590017877-admin-bake-sheet.png', 'a/designs/1787590020314-admin-catalog-page.png', 'a/designs/1787590018647-admin-analytics-page.png', 'a/designs/1787590018884-admin-closing-dates-page.png', 'a/designs/1787590019986-admin-edit-the-category-section.png', 'a/designs/1787590019103-admin-edit-review-page.png', 'a/designs/1787590019544-admin-newletter-edit-page.png', 'a/designs/1787590019756-admin-promo-codes-edit-page.png', 'a/designs/1787590018375-admin-gallery-edit-page.png', 'a/designs/1787590018111-admin-edit-text-page.png']::text[],
  true,
  1,
  '2026-08-24T16:51:00.882179+00:00',
  '2026-08-24T16:55:19.742041+00:00'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tech = EXCLUDED.tech,
  category = EXCLUDED.category,
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  live_url = EXCLUDED.live_url,
  github_url = EXCLUDED.github_url,
  github_visibility = EXCLUDED.github_visibility,
  downloads = EXCLUDED.downloads,
  video_url = EXCLUDED.video_url,
  doc_url = EXCLUDED.doc_url,
  doc_path = EXCLUDED.doc_path,
  slides_url = EXCLUDED.slides_url,
  slides_path = EXCLUDED.slides_path,
  screenshots = EXCLUDED.screenshots,
  designs = EXCLUDED.designs,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.projects (
  id, slug, title, summary, description, highlights, tech, category,
  period, role, live_url, github_url, github_visibility, downloads,
  video_url, doc_url, doc_path, slides_url, slides_path,
  screenshots, designs, featured, sort_order, created_at, updated_at
) VALUES (
  '5fcd643d-b7d6-4144-9be4-7458bfbff9c8',
  'centac-android-app',
  'Android App for CENTAC, Puducherry',
  'Flutter app for the Centralised Admission Committee with real-time data and authentication.',
  'A team-built Android application for the Centralised Admission Committee (CENTAC), Puducherry. Built with Flutter and Dart, integrated with Firebase for real-time data management and authentication so applicants could track admission information from their phones. Undergraduate main project.',
  ARRAY['Built with Flutter and Dart for Android', 'Firebase authentication and real-time data management', 'Delivered as a collaborative team project', 'UG main project for a live government admissions body']::text[],
  ARRAY['Flutter', 'Dart', 'Firebase', 'Android']::text[],
  'Mobile',
  'Jan 2023 – Jun 2023',
  'UG Main Project — Team leader',
  NULL,
  NULL,
  'none',
  '[]'::jsonb,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}'::text[],
  '{}'::text[],
  false,
  6,
  '2026-08-01T17:16:00.967994+00:00',
  '2026-08-24T16:52:08.084835+00:00'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tech = EXCLUDED.tech,
  category = EXCLUDED.category,
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  live_url = EXCLUDED.live_url,
  github_url = EXCLUDED.github_url,
  github_visibility = EXCLUDED.github_visibility,
  downloads = EXCLUDED.downloads,
  video_url = EXCLUDED.video_url,
  doc_url = EXCLUDED.doc_url,
  doc_path = EXCLUDED.doc_path,
  slides_url = EXCLUDED.slides_url,
  slides_path = EXCLUDED.slides_path,
  screenshots = EXCLUDED.screenshots,
  designs = EXCLUDED.designs,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.projects (
  id, slug, title, summary, description, highlights, tech, category,
  period, role, live_url, github_url, github_visibility, downloads,
  video_url, doc_url, doc_path, slides_url, slides_path,
  screenshots, designs, featured, sort_order, created_at, updated_at
) VALUES (
  'e19345cd-aa8e-409e-a242-26581b025e44',
  'aarrkkaa-international',
  'AARRKKAA - Website',
  'The AARRKKAA International web platform is a modern, high-performance industrial e-commerce and corporate showcase application. It is designed to serve as the global digital storefront for a supplier and distributor of industrial pumps, mechanical seals, elastomers, stainless steel components, and precision engineering equipment based in Hosur, Tamil Nadu.',
  'The primary goal of the platform is to digitize the traditional B2B industrial catalog experience. It provides potential clients with an interactive, lightning-fast interface to browse complex industrial products, view detailed specifications and applications, and seamlessly submit business inquiries directly to the sales team.',
  ARRAY['Core Features', '1. Public Storefront: A beautiful, animated UI showcasing product catalogs, industries served, and company information. It features a hero carousel, interactive product grids, and a direct PDF catalog download.', '2. Secure Admin Dashboard: A fully functional backend portal where administrators can perform CRUD operations on Products and Categories, manage incoming customer Inquiries via a Kanban-style interface, and track newsletter Subscribers.', '3. Custom Analytics Engine: A bespoke web traffic logger that tracks page views, referrers, and user engagement, visualizing the data in real-time charts within the admin dashboard.', '4. Easter Eggs / Viral Features: The application uniquely incorporates interactive mini-games and hidden developer jokes (e.g., Rogue AI, Flappy Pump, Matrix mode) to drive engagement and memorability in a traditionally dry industrial sector.']::text[],
  ARRAY['React', 'TypeScript', 'TanStack Start', 'TanStack Router', 'TanStack Query', 'Vite', 'Tailwind CSS', 'Radix UI', 'Prisma ORM', 'PostgreSQL', 'Supabase Auth', 'Vercel', 'Nitro']::text[],
  'Web',
  'June 2026 - August 2026',
  'Developer',
  'aarrkkaa.com',
  'https://github.com/Nivas001/Seals',
  'public',
  '[]'::jsonb,
  NULL,
  NULL,
  'aarrkkaa-international/docs/1786290548945-documentation.md',
  NULL,
  'aarrkkaa-international/slides/1786308818474-aarrkkaa-international-brand-book-by-pomelli.pptx',
  ARRAY['aarrkkaa-international/1786292620748-Homepage-visible.png', 'aarrkkaa-international/1786292665236-Products.png', 'aarrkkaa-international/1786292665029-Product-range-page.png', 'aarrkkaa-international/1786292664564-Product-spec-page.png', 'aarrkkaa-international/1786292664787-Product-spec2-page.png', 'aarrkkaa-international/1786292664197-Industries.png', 'aarrkkaa-international/1786292663919-About.png', 'aarrkkaa-international/1786292663703-Contact.png', 'aarrkkaa-international/1786292665562-Chatbot.png', 'aarrkkaa-international/1786292663336-Admin--Dashboard.png', 'aarrkkaa-international/1786292663054-Admin--analytics.png', 'aarrkkaa-international/1786292660360-Admin--Categories-edit-page.png', 'aarrkkaa-international/1786292660140-Admin--Inquery-page.png', 'aarrkkaa-international/1786292660808-Admin--Products-edit-page.png', 'aarrkkaa-international/1786292660571-Admin--Edit-Product-details-page.png', 'aarrkkaa-international/1786292659519-Admin--Contact-edit-page.png', 'aarrkkaa-international/1786292659745-Admin--Hero-Carousel-page.png', 'aarrkkaa-international/1786292659940-Admin--Subscribers-page.png', 'aarrkkaa-international/1786292663531-Choose-your-product-page.png', 'aarrkkaa-international/1786292659304-404-Page-not-found.png', 'aarrkkaa-international/1786292658874-Easter-egg-section.png']::text[],
  ARRAY['aarrkkaa-international/designs/1786292692800-Homepage-visible.png', 'aarrkkaa-international/designs/1786292700595-Homepage.png', 'aarrkkaa-international/designs/1786292699845-Products.png', 'aarrkkaa-international/designs/1786292699590-Product-range-page.png', 'aarrkkaa-international/designs/1786292698845-Product-spec-page.png', 'aarrkkaa-international/designs/1786292699217-Product-spec2-page.png', 'aarrkkaa-international/designs/1786292698490-Industries.png', 'aarrkkaa-international/designs/1786292698053-About.png', 'aarrkkaa-international/designs/1786292697632-Contact.png', 'aarrkkaa-international/designs/1786292697259-Admin--Dashboard.png', 'aarrkkaa-international/designs/1786292697095-Admin--analytics.png', 'aarrkkaa-international/designs/1786292694249-Admin--Inquery-page.png', 'aarrkkaa-international/designs/1786292693890-Admin--Hero-Carousel-page.png', 'aarrkkaa-international/designs/1786292694615-Admin--Edit-Product-details-page.png', 'aarrkkaa-international/designs/1786292694433-Admin--Categories-edit-page.png', 'aarrkkaa-international/designs/1786292694084-Admin--Subscribers-page.png', 'aarrkkaa-international/designs/1786292693690-Admin--Contact-edit-page.png', 'aarrkkaa-international/designs/1786292694828-Admin--Products-edit-page.png', 'aarrkkaa-international/designs/1786292693395-404-Page-not-found.png', 'aarrkkaa-international/designs/1786292697462-Choose-your-product-page.png', 'aarrkkaa-international/designs/1786292700441-Chatbot.png', 'aarrkkaa-international/designs/1786292693185-Easter-egg-section.png']::text[],
  true,
  2,
  '2026-08-01T17:16:00.967994+00:00',
  '2026-08-24T16:52:57.709769+00:00'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tech = EXCLUDED.tech,
  category = EXCLUDED.category,
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  live_url = EXCLUDED.live_url,
  github_url = EXCLUDED.github_url,
  github_visibility = EXCLUDED.github_visibility,
  downloads = EXCLUDED.downloads,
  video_url = EXCLUDED.video_url,
  doc_url = EXCLUDED.doc_url,
  doc_path = EXCLUDED.doc_path,
  slides_url = EXCLUDED.slides_url,
  slides_path = EXCLUDED.slides_path,
  screenshots = EXCLUDED.screenshots,
  designs = EXCLUDED.designs,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.projects (
  id, slug, title, summary, description, highlights, tech, category,
  period, role, live_url, github_url, github_visibility, downloads,
  video_url, doc_url, doc_path, slides_url, slides_path,
  screenshots, designs, featured, sort_order, created_at, updated_at
) VALUES (
  '13ae4d85-0db4-44cf-b9dd-9cfa4495ba2d',
  'tamil-ner-summarizer',
  'Tamil Text Summarization using NER',
  'Research-level NLP system that summarizes Tamil sports news while preserving key named entities.',
  'A Tamil sports news summarization system combining Named Entity Recognition with abstractive deep learning. The model preserves critical entities — players, scores, locations — that generic summarizers routinely drop, reducing information loss by roughly 30% against the baseline. Built as my postgraduate main project at Pondicherry University and deployed as a live Hugging Face Space.',
  ARRAY['Combined NER with abstractive deep learning to preserve players, scores and locations in generated summaries', 'Reduced information loss by ~30% compared to the baseline summarizer', 'Solved low-resource language challenges: Tamil-specific tokenization, normalization and preprocessing', 'Trained and evaluated on a curated Tamil sports news corpus', 'Live Hugging Face Space demo']::text[],
  ARRAY['Python', 'NLTK', 'SpaCy', 'TensorFlow', 'Deep Learning', 'NER', 'Streamlit', 'Hugging Face Transformers', 'mT5', 'PEFT']::text[],
  'Research',
  'Jan 2025 – Jun 2025',
  'PG Main Project — Sole developer',
  'https://huggingface.co/spaces/Nivas007/Tamil_txt_Summarisation_NER',
  'https://github.com/Nivas001/Tamil_text_Summary',
  'public',
  '[]'::jsonb,
  NULL,
  NULL,
  'tamil-ner-summarizer/docs/1785839578693-Documentation.pdf',
  NULL,
  'tamil-ner-summarizer/slides/1785839554005-Tamil-Text-Summarization.pptx',
  ARRAY['tamil-ner-summarizer.jpg']::text[],
  '{}'::text[],
  true,
  4,
  '2026-08-02T07:57:54.978953+00:00',
  '2026-08-24T16:52:18.258703+00:00'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tech = EXCLUDED.tech,
  category = EXCLUDED.category,
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  live_url = EXCLUDED.live_url,
  github_url = EXCLUDED.github_url,
  github_visibility = EXCLUDED.github_visibility,
  downloads = EXCLUDED.downloads,
  video_url = EXCLUDED.video_url,
  doc_url = EXCLUDED.doc_url,
  doc_path = EXCLUDED.doc_path,
  slides_url = EXCLUDED.slides_url,
  slides_path = EXCLUDED.slides_path,
  screenshots = EXCLUDED.screenshots,
  designs = EXCLUDED.designs,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.projects (
  id, slug, title, summary, description, highlights, tech, category,
  period, role, live_url, github_url, github_visibility, downloads,
  video_url, doc_url, doc_path, slides_url, slides_path,
  screenshots, designs, featured, sort_order, created_at, updated_at
) VALUES (
  '13fb2daa-0fcc-479b-8662-bfe0056540e4',
  'velocity',
  'Velocity',
  'It''s a open source prj.

Website under Maintenance, will be solved asap.

',
  'VelocityBox is a comprehensive media streaming and cloud storage ecosystem designed to bridge the gap between peer-to-peer torrent networks and seamless, high-performance playback. Built with a modern glassmorphic aesthetic, the platform integrates TorBox API for lightning-fast torrent caching and cloud storage management. It offers an ecosystem of applications including a highly optimized React web interface, alongside native Windows and Android applications built with Flutter. Users can search across multiple aggregated torrent indexers, instantly stream cached media in high definition without downloading, and manage their cloud storage. The native applications are optimized with local media players to handle high-bitrate streaming natively on user devices, bringing a premium media experience to any platform.',
  ARRAY['Instant Torrent Streaming: Integrates with TorBox API to instantly cache and stream torrents without requiring local downloads. Cross-Platform Ecosystem: Features a glassmorphic web platform alongside highly optimized native Flutter applications for Windows and Android. Native Local Playback: The desktop and mobile applications use native device media players to effortlessly decode and play high-bitrate audio/video formats locally. Aggregated Search Engine: Custom backend scrapers combine results from multiple top providers (YTS, 1TamilBlasters, TamilMV, 1337x) into a single search experience. Modern "Untitled UI" Design: A strictly dark-mode, premium glassmorphism design system built with Tailwind CSS v4 and animated using Framer Motion. Cloud Drive Management: A fully integrated cloud file explorer that allows users to manage their TorBox storage directly within the app.']::text[],
  ARRAY['React', 'Vite', 'TanStack Router', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Express', 'TorBox API', 'YTS API', 'Flutter', 'Dart.']::text[],
  'Web',
  '2026 - still onn',
  'Developer',
  'velocitybox.app',
  NULL,
  'private',
  '[{"url":"https://drive.usercontent.google.com/download?id=1y1AGWzqwMHQXbauB9J4JIwXmElvMJqH0&export=download&authuser=0","label":"Download our Windows application","platform":"Windows"},{"url":"https://drive.usercontent.google.com/download?id=1OYWc8xn2WLYlMv1oDmliw4BYY7MWnPJT&export=download&authuser=0","label":"Download our Android app","platform":"Android"}]'::jsonb,
  NULL,
  NULL,
  'velocity/docs/1785672384784-Untitled_Document.pdf',
  NULL,
  NULL,
  ARRAY['velocity/1785672615323-Home-page.png', 'velocity/1785672615042-Search-result.png', 'velocity/1785672613484-Expanded-card.png', 'velocity/1785672614855-Progress.png', 'velocity/1785672614681-Result-page.png', 'velocity/1785672612235-Video-player.png', 'velocity/1785672614203-Support-page.png', 'velocity/1785672614380-Why-Premium.png', 'velocity/1785672614003-Clerk-auth.png']::text[],
  ARRAY['velocity/designs/1785672577286-Home-page.png', 'velocity/designs/1785672514624-Expanded-card.png', 'velocity/designs/1785672514875-My-drive-.png', 'velocity/designs/1785672515933-Clerk-auth.png', 'velocity/designs/1785672513906-Video-player.png', 'velocity/designs/1785672516104-Support-page.png', 'velocity/designs/1785672516291-Why-Premium.png', 'velocity/designs/1785672516464-Changelog-page.png', 'velocity/designs/1785672516686-Security.png', 'velocity/designs/1785672516913-Architecture.png', 'velocity/designs/1785672576607-Result-page.png', 'velocity/designs/1785672576893-Progress.png', 'velocity/designs/1785672577060-Search-result.png']::text[],
  true,
  3,
  '2026-08-01T17:16:00.967994+00:00',
  '2026-08-24T16:53:59.927777+00:00'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tech = EXCLUDED.tech,
  category = EXCLUDED.category,
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  live_url = EXCLUDED.live_url,
  github_url = EXCLUDED.github_url,
  github_visibility = EXCLUDED.github_visibility,
  downloads = EXCLUDED.downloads,
  video_url = EXCLUDED.video_url,
  doc_url = EXCLUDED.doc_url,
  doc_path = EXCLUDED.doc_path,
  slides_url = EXCLUDED.slides_url,
  slides_path = EXCLUDED.slides_path,
  screenshots = EXCLUDED.screenshots,
  designs = EXCLUDED.designs,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;


-- 13. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
