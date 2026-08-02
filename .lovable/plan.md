## Goal

Extend each project with optional, admin-managed extras that only appear on the project page when filled in: a website link, a demo video, a documentation PDF, and a zoomable "design board" of page mockups.

Editing existing projects already works in `/admin` (Edit button on each row) — the new fields simply join that same form.

## 0. Website link (optional)

- The project already has a live URL field in admin; it stays optional and keeps driving the "Live" badge on cards.
- On the project page the button gets clearer wording: **"Go to the site"** with an external-link icon, rendered only when a URL is given. No link = no button, nothing else changes.

## 1. Project video (optional)

- New `video_url` field. Paste a Google Drive, YouTube or direct MP4 link in admin.
- Project detail page renders a `// demo` section with an embedded player **only when the field is set**; nothing renders otherwise.
- Link normalising: a Drive `/view` link becomes `/preview`, a YouTube watch/short link becomes an `embed` URL, a direct `.mp4` uses a native `<video>` player.
- Screenshots stay unlimited — the upload control keeps appending.

## 2. Project documentation (PDF)

- Answer to your question: **yes**, a Google Drive PDF can be read inside the page — Drive's `/preview` URL works in an embedded frame as long as the file is shared as "Anyone with the link".
- Two ways to supply it, both optional:
  - **Drive/external link** — paste the share URL; renders as an inline reader plus an "Open in new tab" button.
  - **Direct upload** — upload the PDF into the existing private storage bucket; served through a temporary signed URL, same mechanism as screenshots.
- A `// documentation` section appears only when one of these is set.

## 3. Design board (Figma-style pages view)

- New optional list of "design" images per project (uploaded in admin, same bucket).
- When present, the project page shows a single bordered canvas holding all page designs side by side on a grid backdrop, with:
  - scroll-wheel / trackpad-pinch zoom anchored at the cursor,
  - drag to pan,
  - zoom in / out / reset controls and a zoom percentage readout,
  - a full-screen toggle.
- Nothing renders if no design images were uploaded for that project.

## Admin changes

Inside the existing project editor, add:
- `video url` text field
- `documentation` — URL field + "Upload PDF" button, with remove control
- `design pages` — multi-file upload with thumbnail list and per-item remove (mirrors the screenshots control)

## Technical notes

- Database migration on `projects`: add `video_url text`, `doc_url text`, `doc_path text`, `designs text[] default '{}'`. Existing rows keep working (all nullable/defaulted).
- Update `PROJECT_COLUMNS`, the `Project` type and `emptyProject` in `src/lib/projects.ts`.
- Extend signing in `src/lib/projects.server.ts` to cover `designs[]` and `doc_path` alongside `screenshots`.
- New components: `src/components/VideoEmbed.tsx`, `src/components/DocViewer.tsx`, `src/components/DesignBoard.tsx`.
- Design board zoom uses a native non-passive `wheel` listener with exponential, delta-scaled zoom and cursor-anchored pan offset (avoids runaway zoom and page-scroll capture).
- `src/routes/projects.$slug.tsx` gains the three conditional sections plus the reworded site button; `src/routes/_authenticated/admin.tsx` gains the matching form controls and upload handlers.
