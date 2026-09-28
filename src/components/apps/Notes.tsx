import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pin, Plus, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { listNotes, saveNote } from "@/lib/notes.functions";
import {
  MAX_NOTE_BODY,
  MAX_NOTE_NAME,
  MAX_NOTE_TITLE,
  NOTE_TINTS,
  TINT_IDS,
  validateNote,
  type Note,
  type NoteTint,
} from "@/lib/notes";

/**
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * A two-pane notes app: the public board on the left, the note you are writing
 * on the right.
 *
 * The board is public and says so in three places, because a "notes app" on a
 * website sets an expectation of privacy that this cannot honour. Anything you
 * type here is visible to everyone; the email is collected only so a note has
 * an owner who can ask for it to come down, and the read path never selects it.
 *
 * A draft is mirrored to localStorage on every keystroke. Losing four
 * paragraphs because a window got closed is the fastest way to make somebody
 * never use a thing again.
 */

const DRAFT_KEY = "nivas.notes.draft.v1";

export const notesQuery = {
  queryKey: ["notes-board"] as const,
  queryFn: () => listNotes(),
};

export function Notes() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tint, setTint] = useState<NoteTint>("butter");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [filter, setFilter] = useState("");
  const [reading, setReading] = useState<Note | null>(null);

  const { data, isLoading } = useQuery(notesQuery);
  const queryClient = useQueryClient();

  /* ---- Draft and identity restore -------------------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as { title?: string; body?: string; tint?: string };
        if (draft.title) setTitle(draft.title);
        if (draft.body) setBody(draft.body);
        if (draft.tint && draft.tint in NOTE_TINTS) setTint(draft.tint as NoteTint);
      }
      setName(localStorage.getItem("nivas.guest.name") ?? "");
      setEmail(localStorage.getItem("nivas.guest.email") ?? "");
    } catch {
      /* storage blocked — start clean */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, tint }));
    } catch {
      /* storage blocked */
    }
  }, [title, body, tint]);

  const post = useMutation({
    mutationFn: async () => {
      const check = validateNote({ name, email, title, body });
      if (!check.ok) throw new Error(check.error);
      return saveNote({
        data: { name: name.trim(), email: email.trim(), title: title.trim(), body, tint },
      });
    },
    onSuccess: () => {
      try {
        localStorage.setItem("nivas.guest.name", name.trim());
        localStorage.setItem("nivas.guest.email", email.trim());
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* storage blocked */
      }
      setTitle("");
      setBody("");
      void queryClient.invalidateQueries({ queryKey: ["notes-board"] });
      toast.success("Pinned to the board.");
    },
    onError: (error: Error) => toast.error("Could not post", { description: error.message }),
  });

  // Memoised rather than `data?.notes ?? []` inline: the fallback allocated a
  // new array on every render, which changed the identity the filter below
  // depends on and made that memo recompute every single time.
  const notes = useMemo(() => data?.notes ?? [], [data]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.author_name.toLowerCase().includes(q),
    );
  }, [notes, filter]);

  const field =
    "w-full rounded-[var(--os-radius-ctl)] border border-border bg-card px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-[var(--os-accent)]";

  return (
    <div className="flex h-full min-h-0 bg-background">
      {/* ---- The board ---- */}
      <aside className="flex w-[42%] min-w-0 flex-col border-r border-border/60">
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Search ${notes.length} notes`}
            aria-label="Search notes"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
          {isLoading ? (
            <p className="micro px-1 py-4 text-muted-foreground">Reading the board…</p>
          ) : data?.pending ? (
            <p className="px-1 py-4 text-[12px] leading-relaxed text-muted-foreground">
              The board is not open yet — the database migration still has to run. Everything else
              in here works; posting will start the moment it does.
            </p>
          ) : visible.length === 0 ? (
            <p className="px-1 py-4 text-[12px] leading-relaxed text-muted-foreground">
              {notes.length === 0
                ? "Nothing on the board yet. Yours would be the first."
                : "Nothing matches that."}
            </p>
          ) : (
            visible.map((note) => {
              const swatch = NOTE_TINTS[note.tint] ?? NOTE_TINTS.butter;
              const active = reading?.id === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setReading(active ? null : note)}
                  className={cn(
                    "block w-full rounded-[var(--os-radius-ctl)] border p-2 text-left transition-transform hover:-translate-y-px",
                    active ? "border-[var(--os-accent)]" : "border-black/10",
                  )}
                  style={{ background: swatch.bg, color: swatch.ink }}
                >
                  <span className="flex items-start gap-1.5">
                    {note.pinned ? <Pin className="mt-0.5 h-3 w-3 shrink-0" /> : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold">
                        {note.title}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[11.5px] leading-snug opacity-80",
                          active ? "" : "line-clamp-2",
                        )}
                      >
                        {note.body}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-wide opacity-60">
                        {note.author_name} · {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ---- The composer ---- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          post.mutate();
        }}
        className="flex min-w-0 flex-1 flex-col"
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_NOTE_TITLE}
            placeholder="Title"
            aria-label="Note title"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
          />
          <div className="flex shrink-0 items-center gap-1">
            {TINT_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTint(id)}
                aria-label={NOTE_TINTS[id].label}
                aria-pressed={tint === id}
                className={cn(
                  "h-4 w-4 rounded-full border transition-transform hover:scale-110",
                  tint === id ? "scale-125 border-foreground" : "border-black/20",
                )}
                style={{ background: NOTE_TINTS[id].bg }}
              />
            ))}
          </div>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={MAX_NOTE_BODY}
          placeholder="Write something. It goes on a public board, so maybe not your PIN."
          aria-label="Note body"
          className="min-h-0 flex-1 resize-none px-4 py-3 text-[13.5px] leading-relaxed outline-none"
          style={{ background: NOTE_TINTS[tint].bg, color: NOTE_TINTS[tint].ink }}
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-3 py-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NOTE_NAME}
            placeholder="Your name"
            aria-label="Your name"
            className={cn(field, "w-32")}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Your email"
            aria-label="Your email"
            className={cn(field, "w-44")}
          />
          <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
            {body.length}/{MAX_NOTE_BODY}
          </span>
          <button
            type="submit"
            disabled={post.isPending}
            className="flex items-center gap-1.5 rounded-[var(--os-radius-ctl)] px-3 py-1.5 text-[13px] font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--os-accent)", color: "var(--os-accent-ink)" }}
          >
            <Save className="h-3.5 w-3.5" />
            {post.isPending ? "Pinning…" : "Pin it"}
          </button>
        </div>

        <p className="border-t border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground">
          Public board. Your name and note are visible to everyone; your email never is. Drafts save
          in this browser as you type.
        </p>
      </form>
    </div>
  );
}
