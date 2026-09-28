/** A painting as the public wall sees it. No email — see paint.functions.ts. */
export type Painting = {
  id: string;
  created_at: string;
  artist_name: string;
  title: string;
  image: string;
  width: number;
  height: number;
  strokes: number;
  seconds: number;
  rating: number | null;
  rating_note: string | null;
  featured: boolean;
};

/** The admin queue adds the contact address and the hidden flag. */
export type AdminPainting = Painting & {
  artist_email: string;
  hidden: boolean;
};

export const MAX_TITLE = 60;
export const MAX_NAME = 40;
/** ~1.4MB of PNG once base64 is unwound. Mirrors the CHECK on the table. */
export const MAX_IMAGE_CHARS = 2_800_000;

/**
 * The rating vocabulary.
 *
 * A bare number out of five tells an artist nothing, and "3/5" on a drawing
 * somebody made for fun reads as a grade. Each score carries a word so the
 * wall says something rather than scoring something.
 */
export const RATING_WORDS: Record<number, string> = {
  1: "Brave",
  2: "Committed",
  3: "Genuinely good",
  4: "Better than mine",
  5: "Framed it",
};

export function ratingWord(rating: number | null): string | null {
  if (rating === null) return null;
  return RATING_WORDS[rating] ?? null;
}

/** Shared by the client form and the server, so the two never disagree. */
export function validatePainting(input: {
  name: string;
  email: string;
  title: string;
}): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim();
  const email = input.email.trim();
  const title = input.title.trim();

  if (name.length < 1) return { ok: false, error: "Add your name so the wall knows who drew it." };
  if (name.length > MAX_NAME)
    return { ok: false, error: `Name must be ${MAX_NAME} characters or fewer.` };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: "That email does not look right." };
  if (title.length < 1) return { ok: false, error: "Give it a title. Even a bad one." };
  if (title.length > MAX_TITLE)
    return { ok: false, error: `Title must be ${MAX_TITLE} characters or fewer.` };
  return { ok: true };
}
