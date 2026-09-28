-- ============================================================================
-- The paint wall and the notes board
-- ============================================================================
--
-- Two guest-book tables. Both are written by anyone who visits, which is the
-- whole point, and both are therefore treated as hostile input: every write
-- goes through a server function holding the service-role key, and RLS denies
-- the anon role outright rather than trying to express "insert but only these
-- columns, and only if the base64 is not enormous" as a policy.
--
-- Emails are collected so a piece of work has an owner who can ask for it to
-- be taken down. They are never selected by the public read path — see
-- `lib/paint.functions.ts` and `lib/notes.functions.ts`, which list columns
-- explicitly for exactly this reason.

-- ---------------------------------------------------------------------------
-- paintings
-- ---------------------------------------------------------------------------

create table if not exists public.paintings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  artist_name  text not null,
  artist_email text not null,
  title        text not null default 'Untitled',

  -- A PNG data URL. Kept in the row rather than a storage bucket: a painting
  -- is a single small immutable blob that is always read together with its
  -- metadata, so a second round trip to object storage would buy nothing. The
  -- size ceiling is enforced here as well as in the server function, because
  -- the constraint is the only one of the two that cannot be forgotten.
  image        text not null,

  width   integer not null default 0,
  height  integer not null default 0,
  strokes integer not null default 0,
  seconds integer not null default 0,

  -- Curation. `rating` is the admin's score out of five; null means unrated.
  rating      smallint,
  rating_note text,
  featured    boolean not null default false,
  hidden      boolean not null default false,

  constraint paintings_image_is_png_data_url
    check (image like 'data:image/png;base64,%'),
  -- ~2MB of base64, which is a little over 1.4MB of PNG.
  constraint paintings_image_size
    check (length(image) between 128 and 2800000),
  constraint paintings_rating_range
    check (rating is null or rating between 1 and 5),
  constraint paintings_name_length
    check (length(artist_name) between 1 and 40),
  constraint paintings_title_length
    check (length(title) between 1 and 60),
  constraint paintings_email_shape
    check (artist_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

-- The wall reads "newest first, nothing hidden"; the admin queue reads
-- "unrated first". One partial index serves the first, which is the hot path.
create index if not exists paintings_visible_recent_idx
  on public.paintings (created_at desc)
  where hidden = false;

create index if not exists paintings_unrated_idx
  on public.paintings (created_at desc)
  where rating is null and hidden = false;

comment on table public.paintings is
  'Guest paintings from the in-site Paint app. Written only via server functions.';
comment on column public.paintings.artist_email is
  'Never exposed by the public read path. Contact/takedown only.';

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  author_name  text not null,
  author_email text not null,
  title        text not null default 'Untitled note',
  body         text not null default '',

  -- One of the sticky colours offered by the app. Stored as a name rather than
  -- a hex value so a repaint of the palette does not require a data migration.
  tint    text not null default 'butter',
  pinned  boolean not null default false,
  hidden  boolean not null default false,

  constraint notes_name_length  check (length(author_name) between 1 and 40),
  constraint notes_title_length check (length(title) between 1 and 80),
  constraint notes_body_length  check (length(body) <= 4000),
  constraint notes_tint_known
    check (tint in ('butter', 'mint', 'sky', 'blush', 'lilac', 'slate')),
  constraint notes_email_shape
    check (author_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

create index if not exists notes_visible_recent_idx
  on public.notes (pinned desc, created_at desc)
  where hidden = false;

comment on table public.notes is
  'The public notes board. Anyone can post; the board is explicitly public in the UI.';
comment on column public.notes.author_email is
  'Never exposed by the public read path. Contact/takedown only.';

-- ---------------------------------------------------------------------------
-- RLS
--
-- Deny by default and add no policies. The service-role key used by the server
-- functions bypasses RLS; the anon key the browser holds therefore cannot read
-- or write either table directly, which is the intent.
-- ---------------------------------------------------------------------------

alter table public.paintings enable row level security;
alter table public.notes     enable row level security;

revoke all on public.paintings from anon, authenticated;
revoke all on public.notes     from anon, authenticated;
