import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { EyeOff, Pin, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deletePainting, listPaintingsForAdmin, ratePainting } from "@/lib/paint.functions";
import { deleteNote, listNotesForAdmin, moderateNote } from "@/lib/notes.functions";
import { RATING_WORDS, type AdminPainting } from "@/lib/paint";
import { NOTE_TINTS, type AdminNote } from "@/lib/notes";

/**
 * ============================================================================
 * THE GUESTBOOK QUEUES
 * ============================================================================
 *
 * Two moderation surfaces for the two things visitors can leave behind: the
 * paint wall and the notes board.
 *
 * Both are anonymous-write, so both need the same three controls — rate or
 * pin, hide, delete — and both surface the contact address, which is the only
 * place on the site that column is ever read. Hiding is soft and reversible;
 * deleting is not, so it asks first.
 */

export const adminPaintingsQuery = queryOptions({
  queryKey: ["admin", "paintings"],
  queryFn: () => listPaintingsForAdmin(),
});

export const adminNotesQuery = queryOptions({
  queryKey: ["admin", "notes"],
  queryFn: () => listNotesForAdmin(),
});

const heading = "font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground";
const chip =
  "inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 font-mono text-[11px] transition-colors hover:border-primary";

/* ==========================================================================
 * Paint wall
 * ======================================================================== */

export function PaintWallAdmin() {
  const { data, isLoading } = useQuery(adminPaintingsQuery);
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "paintings"] });
    void queryClient.invalidateQueries({ queryKey: ["paint-wall"] });
  };

  const rate = useMutation({
    mutationFn: (input: {
      id: string;
      rating: number | null;
      note?: string;
      featured?: boolean;
      hidden?: boolean;
    }) => ratePainting({ data: input }),
    onSuccess: refresh,
    onError: (error: Error) => toast.error("Could not save", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePainting({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast("Deleted.");
    },
    onError: (error: Error) => toast.error("Could not delete", { description: error.message }),
  });

  const paintings = data?.paintings ?? [];
  const unrated = paintings.filter((p) => p.rating === null && !p.hidden).length;

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={heading}>// paint wall</h2>
        <p className="font-mono text-[11px] text-muted-foreground">
          {paintings.length} total · {unrated} waiting on you
        </p>
      </div>

      {isLoading ? (
        <p className="mt-5 font-mono text-sm text-muted-foreground">Loading…</p>
      ) : data?.pending ? (
        <p className="mt-5 font-mono text-sm text-muted-foreground">
          The table does not exist yet. Apply the paint-wall migration and this fills in.
        </p>
      ) : paintings.length === 0 ? (
        <p className="mt-5 font-mono text-sm text-muted-foreground">Nobody has drawn anything.</p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paintings.map((painting) => (
            <PaintingCard
              key={painting.id}
              painting={painting}
              note={notes[painting.id] ?? painting.rating_note ?? ""}
              onNote={(value) => setNotes((n) => ({ ...n, [painting.id]: value }))}
              onRate={(rating) =>
                rate.mutate({
                  id: painting.id,
                  rating,
                  note: notes[painting.id] ?? painting.rating_note ?? "",
                })
              }
              onToggleFeatured={() =>
                rate.mutate({
                  id: painting.id,
                  rating: painting.rating,
                  featured: !painting.featured,
                })
              }
              onToggleHidden={() =>
                rate.mutate({ id: painting.id, rating: painting.rating, hidden: !painting.hidden })
              }
              onDelete={() => {
                if (!window.confirm(`Delete "${painting.title}" permanently?`)) return;
                remove.mutate(painting.id);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PaintingCard({
  painting,
  note,
  onNote,
  onRate,
  onToggleFeatured,
  onToggleHidden,
  onDelete,
}: {
  painting: AdminPainting;
  note: string;
  onNote: (value: string) => void;
  onRate: (rating: number | null) => void;
  onToggleFeatured: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-md border bg-card",
        painting.hidden ? "border-destructive/50 opacity-60" : "border-border",
      )}
    >
      <img
        src={painting.image}
        alt={`${painting.title} by ${painting.artist_name}`}
        loading="lazy"
        className="h-auto w-full bg-white"
      />

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className="truncate text-sm font-bold text-foreground">{painting.title}</h3>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {painting.artist_name} ·{" "}
            <a href={`mailto:${painting.artist_email}`} className="underline underline-offset-2">
              {painting.artist_email}
            </a>
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {new Date(painting.created_at).toLocaleString()} · {painting.strokes} strokes ·{" "}
            {painting.seconds}s
          </p>
        </div>

        {/* Rating. Clicking the current score clears it, which is the only way
            to un-rate something without a separate control. */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRate(painting.rating === n ? null : n)}
              title={RATING_WORDS[n]}
              aria-label={`${n} of 5 — ${RATING_WORDS[n]}`}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  painting.rating !== null && n <= painting.rating
                    ? "fill-hog-yellow text-hog-yellow"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
          <span className="ml-1 font-mono text-[11px] text-muted-foreground">
            {painting.rating !== null ? RATING_WORDS[painting.rating] : "unrated"}
          </span>
        </div>

        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value)}
          onBlur={() => onRate(painting.rating)}
          rows={2}
          maxLength={240}
          placeholder="A line about it, shown on the wall"
          className="w-full resize-none rounded-sm border border-border bg-background px-2 py-1.5 text-[12px] text-foreground outline-none focus:border-primary"
        />

        <div className="mt-auto flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onToggleFeatured}
            className={cn(chip, painting.featured && "border-hog-yellow text-hog-yellow")}
          >
            <Pin className="h-3 w-3" />
            {painting.featured ? "framed" : "frame it"}
          </button>
          <button
            type="button"
            onClick={onToggleHidden}
            className={cn(chip, painting.hidden && "border-destructive text-destructive")}
          >
            <EyeOff className="h-3 w-3" />
            {painting.hidden ? "hidden" : "hide"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={cn(chip, "hover:border-destructive hover:text-destructive")}
          >
            <Trash2 className="h-3 w-3" />
            delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================================
 * Notes board
 * ======================================================================== */

export function NotesBoardAdmin() {
  const { data, isLoading } = useQuery(adminNotesQuery);
  const queryClient = useQueryClient();

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "notes"] });
    void queryClient.invalidateQueries({ queryKey: ["notes-board"] });
  };

  const moderate = useMutation({
    mutationFn: (input: { id: string; hidden?: boolean; pinned?: boolean }) =>
      moderateNote({ data: input }),
    onSuccess: refresh,
    onError: (error: Error) => toast.error("Could not save", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteNote({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast("Deleted.");
    },
    onError: (error: Error) => toast.error("Could not delete", { description: error.message }),
  });

  const notes = data?.notes ?? [];

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={heading}>// notes board</h2>
        <p className="font-mono text-[11px] text-muted-foreground">{notes.length} posted</p>
      </div>

      {isLoading ? (
        <p className="mt-5 font-mono text-sm text-muted-foreground">Loading…</p>
      ) : data?.pending ? (
        <p className="mt-5 font-mono text-sm text-muted-foreground">
          The table does not exist yet. Apply the notes migration and this fills in.
        </p>
      ) : notes.length === 0 ? (
        <p className="mt-5 font-mono text-sm text-muted-foreground">Nothing posted yet.</p>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onTogglePinned={() => moderate.mutate({ id: note.id, pinned: !note.pinned })}
              onToggleHidden={() => moderate.mutate({ id: note.id, hidden: !note.hidden })}
              onDelete={() => {
                if (!window.confirm(`Delete "${note.title}" permanently?`)) return;
                remove.mutate(note.id);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NoteCard({
  note,
  onTogglePinned,
  onToggleHidden,
  onDelete,
}: {
  note: AdminNote;
  onTogglePinned: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}) {
  const tint = NOTE_TINTS[note.tint] ?? NOTE_TINTS.butter;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-md border",
        note.hidden ? "border-destructive/50 opacity-60" : "border-border",
      )}
    >
      <div className="p-3" style={{ background: tint.bg, color: tint.ink }}>
        <h3 className="truncate text-sm font-bold">{note.title}</h3>
        <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap text-[12.5px] leading-snug">
          {note.body}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-2 bg-card p-3">
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {note.author_name} ·{" "}
          <a href={`mailto:${note.author_email}`} className="underline underline-offset-2">
            {note.author_email}
          </a>
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {new Date(note.created_at).toLocaleString()}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onTogglePinned}
            className={cn(chip, note.pinned && "border-hog-yellow text-hog-yellow")}
          >
            <Pin className="h-3 w-3" />
            {note.pinned ? "pinned" : "pin"}
          </button>
          <button
            type="button"
            onClick={onToggleHidden}
            className={cn(chip, note.hidden && "border-destructive text-destructive")}
          >
            <EyeOff className="h-3 w-3" />
            {note.hidden ? "hidden" : "hide"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={cn(chip, "hover:border-destructive hover:text-destructive")}
          >
            <Trash2 className="h-3 w-3" />
            delete
          </button>
        </div>
      </div>
    </article>
  );
}
