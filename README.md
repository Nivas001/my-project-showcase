# nivas.tech — Srinivas M's portfolio

The source of **[nivas.tech](https://nivas.tech)**: my work as a website and mobile app developer, with a full case study for every project, plus the parts of a portfolio nobody asked for (an arcade, a horror room, a fake desktop OS).

Built with TanStack Start (React 19, SSR) and Supabase, styled with Tailwind CSS 4, animated with Motion. Connected to [Lovable](https://lovable.dev/projects/6307a852-b20a-4277-b229-dbceb744db18), so commits to `main` sync back to the editor.

## What's on the site

| Page          | Route              | What it is                                                                                                                                                      |
| ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home          | `/`                | A desktop-style landing page: the lead project running in a browser frame, selected work, skills, a dock                                                        |
| Work          | `/projects`        | The pinned project, the toolbelt, a scroll-driven 3D “how a project ships” story, then every project, filterable and searchable                                 |
| Case study    | `/projects/<slug>` | The full write-up for one project: overview, how it works, what it does, the decision log (“Calls I made”), screens, the zoomable design board, docs and slides |
| About         | `/about`           | Story, a 75-second showreel (Remotion source in the repo), a 3D studio scene, experience and certificates                                                       |
| Contact       | `/contact`         | Contact form and details                                                                                                                                        |
| Arcade        | `/fun`             | Seven browser mini-games with synthesised sound and a public leaderboard                                                                                        |
| Apps          | `/apps`            | Paint, Notes, a tycoon game, a terminal, a music player and other in-browser toys                                                                               |
| Paint wall    | `/wall`            | Everything visitors drew in Paint, with ratings                                                                                                                 |
| The Dark Room | `/horror`          | Branching and narrated horror stories in English, Tamil and Tanglish                                                                                            |
| Admin         | `/admin`           | Sign-in-protected editor for projects, media, decisions and the guestbook                                                                                       |

## Projects and how they're stored

Most projects are rows in the Supabase `projects` table, edited from `/admin`. Each row holds the summary, description, highlights, tech, links, GitHub visibility (`public` / `private` / `none`), downloads, and a **decision log**: what had to be chosen, what lost, why, and what it cost.

Two files in `src/content/` sit on top of the database:

- **`project-media.ts`** — curated screenshots and full-page design captures served from `public/media/<slug>/`, each with its real size so frames match the image. For a slug listed here, these replace the database's media.
- **`static-projects.ts`** — projects defined in code (currently Suganniya Construction, Jobtrail, Miss Minutes and JLab Buds for Linux), plus the step-by-step **“How it works”** flows. They merge into the list by slug, and a database row with the same slug always wins. Saving one of them from `/admin` inserts a real row, and from then on the admin owns it.

### Project case studies at a glance

| Project                             | Kind                                                             | Links                                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Estate Ulagam                       | Property discovery platform                                      | [live](https://estate-ulagam.vercel.app)                                                                                              |
| Vaaram Magazine                     | Weekly publication                                               | [live](https://vaaram.ca)                                                                                                             |
| Ani Bakes                           | Bakery e-commerce                                                | [live](https://anibakes.app)                                                                                                          |
| AARRKKAA International              | Industrial supplier site                                         | [live](https://aarrkkaa.com)                                                                                                          |
| Suganniya Construction              | Builder website with a 3D build story and a code-generated video | [live](https://suganniya-construction-nivas01.vercel.app) · private repo                                                              |
| Velocity                            | Streaming web + Flutter app                                      | [live](https://velocitybox.app)                                                                                                       |
| Jobtrail                            | AI job application tracker with a local AI helper                | [GitHub](https://github.com/Nivas001/jobtrail)                                                                                        |
| Miss Minutes                        | KDE desktop voice assistant with an animated character           | case study                                                                                                                            |
| JLab Buds for Linux                 | Reverse-engineered headphone control (JieLi RCSP)                | case study                                                                                                                            |
| Tamil text summarisation (NER)      | Research, PG main project                                        | [demo](https://huggingface.co/spaces/Nivas007/Tamil_txt_Summarisation_NER) · [GitHub](https://github.com/Nivas001/Tamil_text_Summary) |
| CENTAC Android app                  | Flutter app, UG main project                                     | case study                                                                                                                            |
| Clinical Assistance for Dental Care | React + Firebase                                                 | case study                                                                                                                            |

**Miss Minutes** has a page of its own design. A time door opens in the title card and she steps out, an exact SVG port of her QML character with all eight moods. “Talk to her” walks a request through her wake word, transcription, three brains and skills while she acts it out. She also follows you down the page from the corner, commenting on each section. The code is in `src/components/projects/miss-minutes/`.

### Adding a project

- **From the admin** (normal case): sign in at `/admin`, add the project, upload screenshots, write the decision log.
- **From code**: add an entry to `STATIC_PROJECTS` in `src/content/static-projects.ts`, put its images in `public/media/<slug>/` (WebP, `screen-NN-name.webp` at 1440 px wide, `design-NN-name.webp` for full pages at 1200 px wide), list them in `project-media.ts` with their sizes, and optionally add a `PROJECT_FLOWS` entry.

## Stack

|           |                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------- |
| Framework | TanStack Start + TanStack Router (file-based routes, SSR, server functions), React 19, TypeScript |
| Data      | Supabase: Postgres with row-level security, Auth, Storage; TanStack Query on the client           |
| UI        | Tailwind CSS 4, Radix UI, lucide, Motion, Three.js scenes                                         |
| Build     | Vite via `@lovable.dev/vite-tanstack-config` (Nitro server build)                                 |

## Development

Requires Node.js 20+.

```sh
npm install
npm run dev       # http://localhost:8080
npm run build     # production build
npm run lint
npm run format
```

`.env` holds the public Supabase URL and publishable key (safe to commit). Server-only secrets such as `SUPABASE_SERVICE_ROLE_KEY` and `LOVABLE_API_KEY` belong in `.env.local`, which is gitignored and must never be committed.

Database changes live in `supabase/migrations/`. Code that depends on a newer column falls back gracefully when a migration hasn't been applied yet (see `selectAllProjects` in `src/lib/projects.server.ts`).

## Working with Lovable

This repository syncs both ways with the Lovable project. Keep `main` in a working state, and **never rewrite pushed history** (no force-push, rebase, amend or squash of pushed commits): Lovable would lose its project history.
