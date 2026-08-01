## On the palette

Wisteria bloom works, with one adjustment. Straight lavender-on-white reads soft/artistic — great for a creative portfolio, slightly under-powered for a Python/ML engineer. So I'll keep your exact hexes but anchor them on a deep violet-black canvas instead of white. That keeps the terminal/dev energy you picked earlier while making the violet the signature.

```text
Canvas    #0C0814  near-black with a violet cast
Surface   #16101F  cards, panels
Accent    #9400D3  primary violet — buttons, links, active states
Glow      #ED80E9  hover/highlight, "Live" badges
Text      #D3D3FF  body text on dark
Muted     #D8BFD8  captions, metadata
```

Type: JetBrains Mono for code/labels/tags, a clean geometric sans for headings and body. Sharp-ish corners, thin violet hairline borders, soft `#9400D3` glow on hover.

## Site structure

**Home (`/`)** — hero with your name, `Python Developer | Full Stack & Flutter Developer`, location and quick links (GitHub, LinkedIn, email, phone). Embedded video resume in a violet-framed player card. Stat strip: MCA 8.79 GPA, projects count, certifications.

**Projects index (`/projects`)** — the common selection place. A grid of project cards, each showing thumbnail, title, one-line summary, tech tags, period, and a "Live" badge where applicable. Filter chips by tech (Python, React, Flutter, NLP...) and by type (Live / Research / Mobile). Every card links to its own page.

**Project detail (`/projects/$slug`)** — a full dedicated page per project, generated from the database so admin-added ones get their own page automatically:
- Title, role, period, status
- Full description and highlights/bullets
- Tech stack rendered as syntax-highlighted import lines
- Screenshot gallery with lightbox
- "Visit live site" and "View GitHub repo" buttons
- Prev/next project navigation at the bottom
- Its own SEO title, description, and OG image from the first screenshot

Seeded pages: Tamil Text Summarization using NER, Clinical Assistance for Dental Care, CENTAC Android App, plus two entries for your live-hosted sites that you fill in from the admin panel.

**About (`/about`)** — professional summary, skills grouped as in your resume, education timeline, certifications, key strengths.

**Contact (`/contact`)** — email, phone, location, GitHub, LinkedIn, and a resume PDF download.

## Admin panel

- Email + password sign-in at `/auth`; only your account exists, public signup closed
- `/admin` — protected list of all projects with add / edit / delete
- Form covers every field a detail page needs: title, slug, summary, description, highlights, tech tags, period, role, live URL, GitHub URL, screenshots, featured flag, sort order
- Screenshot upload to cloud storage; public read, admin-only write
- Saving a project immediately publishes its detail page and card

## Innovative touches

- **Terminal boot intro** on the hero: types `> whoami` then resolves to your title, skippable, once per session
- **`Ctrl+K` command palette** to jump to any page or project — IDE-like, fits the dev framing
- **Live uptime badges** on the two hosted projects
- Subtle violet grain/scanline overlay and glow-on-hover cards

## Technical notes

- Lovable Cloud for database, auth, and screenshot storage
- `projects` table (public read, admin write) + `user_roles` with a `has_role()` check — role never stored on the profile
- Row-level security throughout; admin writes go through authenticated server functions
- Resume PDF hosted as a CDN asset
- Per-route SEO metadata and JSON-LD `Person` schema on home

## What I need from you after the first build

1. Video resume link (YouTube or Drive)
2. The two live project URLs + their GitHub repos
3. GitHub and LinkedIn profile URLs
4. Project screenshots (chat upload or admin panel)
5. The email you want for admin login

I'll build with placeholders so nothing blocks, then swap in real values.
