/** A note as the public board sees it. No email — see notes.functions.ts. */
export type Note = {
  id: string;
  created_at: string;
  author_name: string;
  title: string;
  body: string;
  tint: NoteTint;
  pinned: boolean;
};

export type AdminNote = Note & { author_email: string; hidden: boolean };

/**
 * The sticky palette.
 *
 * Stored by name rather than by hex so the colours can be retuned — including
 * for the dark mode, where a real Post-it yellow is blinding — without a data
 * migration. Each tint carries its own ink so contrast is decided here once
 * instead of being guessed at every call site.
 */
export const NOTE_TINTS = {
  butter: { label: "Butter", bg: "oklch(0.92 0.13 96)", ink: "oklch(0.24 0.06 80)" },
  mint: { label: "Mint", bg: "oklch(0.89 0.11 165)", ink: "oklch(0.24 0.05 165)" },
  sky: { label: "Sky", bg: "oklch(0.87 0.09 235)", ink: "oklch(0.22 0.05 245)" },
  blush: { label: "Blush", bg: "oklch(0.88 0.09 20)", ink: "oklch(0.25 0.07 20)" },
  lilac: { label: "Lilac", bg: "oklch(0.87 0.08 305)", ink: "oklch(0.25 0.07 305)" },
  slate: { label: "Slate", bg: "oklch(0.82 0.02 250)", ink: "oklch(0.21 0.01 250)" },
} as const;

export type NoteTint = keyof typeof NOTE_TINTS;

export const TINT_IDS = Object.keys(NOTE_TINTS) as NoteTint[];

export function isTint(value: string): value is NoteTint {
  return value in NOTE_TINTS;
}

export const MAX_NOTE_TITLE = 80;
export const MAX_NOTE_BODY = 4000;
export const MAX_NOTE_NAME = 40;

export function validateNote(input: {
  name: string;
  email: string;
  title: string;
  body: string;
}): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim();
  const email = input.email.trim();
  const title = input.title.trim();
  const body = input.body;

  if (!name) return { ok: false, error: "Add your name." };
  if (name.length > MAX_NOTE_NAME)
    return { ok: false, error: `Name must be ${MAX_NOTE_NAME} characters or fewer.` };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: "That email does not look right." };
  if (!title) return { ok: false, error: "Every note needs a title." };
  if (title.length > MAX_NOTE_TITLE)
    return { ok: false, error: `Title must be ${MAX_NOTE_TITLE} characters or fewer.` };
  if (!body.trim()) return { ok: false, error: "The note is empty." };
  if (body.length > MAX_NOTE_BODY)
    return { ok: false, error: `Notes are capped at ${MAX_NOTE_BODY} characters.` };
  return { ok: true };
}
