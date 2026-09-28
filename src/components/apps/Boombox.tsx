import { useState } from "react";
import { ExternalLink, Music4, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseSpotify, spotify, spotifyEmbed } from "@/lib/site";

/**
 * ============================================================================
 * BOOMBOX
 * ============================================================================
 *
 * Spotify's own embed player in a window, plus a box for pasting any link.
 *
 * Deliberately thin. An embed is one iframe and no credentials; the alternative
 * is the Web Playback SDK, which needs OAuth, a Premium account on the
 * visitor's side, a registered redirect URI and a token refresh loop — all so a
 * portfolio can play background music. The embed does the job.
 *
 * What the embed cannot do is autoplay, and nothing here tries: a site that
 * starts making noise on load is the single most reliable way to get a tab
 * closed. The visitor presses play, or nothing plays.
 */

type Station = { id: string; kind: string; name: string; blurb: string };

const SEEDED: Station[] = spotify.stations.map((s) => ({ ...s }));

export function Boombox() {
  const [station, setStation] = useState<Station>(SEEDED[0]!);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = (raw: string) => {
    const parsed = parseSpotify(raw);
    if (!parsed) {
      setError("That is not a Spotify link. Share → Copy link, then paste it here.");
      return;
    }
    setError(null);
    setStation({
      id: parsed.id,
      kind: parsed.kind,
      name: "Pasted link",
      blurb: `A ${parsed.kind} you brought yourself.`,
    });
    setPaste("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* ---- Stations ---- */}
      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/60 px-3 py-2">
        <Radio className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {SEEDED.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setStation(s);
              setError(null);
            }}
            aria-pressed={station.id === s.id}
            title={s.blurb}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[12px] transition-colors",
              station.id === s.id
                ? "text-[var(--os-accent-ink)]"
                : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground",
            )}
            style={station.id === s.id ? { background: "var(--os-accent)" } : undefined}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* ---- The player ----

           `key` forces a fresh iframe per station. Without it Spotify's embed
           keeps the previous queue playing underneath the new artwork, which
           looks exactly like a bug. */}
      <div className="min-h-0 flex-1 p-3">
        <iframe
          key={`${station.kind}:${station.id}`}
          title={`Spotify — ${station.name}`}
          src={spotifyEmbed(station.kind, station.id)}
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: "var(--os-radius-ctl)", minHeight: 360 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>

      {/* ---- Bring your own ---- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(paste);
        }}
        className="shrink-0 space-y-1.5 border-t border-border/60 px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <Music4 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setError(null);
            }}
            placeholder="Paste any Spotify link"
            aria-label="Paste a Spotify link"
            className="min-w-0 flex-1 rounded-[var(--os-radius-ctl)] border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground outline-none focus:border-[var(--os-accent)]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-[var(--os-radius-ctl)] px-3 py-1.5 text-[12.5px] font-semibold"
            style={{ background: "var(--os-accent)", color: "var(--os-accent-ink)" }}
          >
            Play
          </button>
        </div>

        {error ? (
          <p role="alert" className="text-[11.5px] text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Signed in to Spotify in this browser? You get whole songs. Otherwise Spotify gives you
            thirty seconds of each — that is their player, not mine.
          </p>
        )}

        {spotify.profileUrl ? (
          <a
            href={spotify.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11.5px] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            Follow me on Spotify <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </form>
    </div>
  );
}
