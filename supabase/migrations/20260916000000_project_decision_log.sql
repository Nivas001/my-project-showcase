-- Decision log: why each project is built the way it is.
--
-- `highlights` already says what a project does. This says what had to be
-- chosen, what lost, and what the choice cost — the part a reader can't infer
-- from a feature list.
--
-- Shape of each element:
--   { "problem": text, "options": text[], "chose": text,
--     "because": text, "cost": text }

alter table public.projects
  add column if not exists decisions jsonb not null default '[]'::jsonb;

comment on column public.projects.decisions is
  'Decision log entries: {problem, options[], chose, because, cost}. Rendered on the project page under "Calls I made".';

-- Reject anything that is not a JSON array, so a bad write from a future
-- client surfaces here rather than as an empty section on the page.
alter table public.projects
  drop constraint if exists projects_decisions_is_array;

alter table public.projects
  add constraint projects_decisions_is_array
  check (jsonb_typeof(decisions) = 'array');
