import { useEffect, useState } from "react";
import { ExternalLink, Eye, FileText, Presentation } from "lucide-react";

type Resource = {
  kind: "pdf" | "slides";
  src: string;
  /** Office viewer needs an absolute URL, resolved on the client. */
  needsAbsolute: boolean;
};

const SLIDE_EXT = /(\.(ppt|pptx|key|odp)(\?|$)|[?&]ext=(ppt|pptx|key|odp)(&|$))/i;
const MARKDOWN_EXT = /(\.(md|markdown|txt)(\?|$)|[?&]ext=(md|markdown|txt)(&|$))/i;

/** Renders an uploaded markdown/plain-text document inline. */
function MarkdownDoc({ src }: { src: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ marked }, DOMPurify, response] = await Promise.all([
          import("marked"),
          import("dompurify").then((m) => m.default),
          fetch(src),
        ]);
        if (!response.ok) throw new Error(String(response.status));
        const text = await response.text();
        const rendered = await marked.parse(text, { async: true });
        if (!cancelled) setHtml(DOMPurify.sanitize(rendered));
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (failed)
    return (
      <p className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">
        {"// could not load this document"}
      </p>
    );
  if (html === null)
    return (
      <p className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">
        {"// loading document…"}
      </p>
    );

  return (
    <div
      className="markdown-doc max-h-[820px] overflow-auto px-5 py-6 text-sm leading-relaxed animate-in fade-in duration-300"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}


/** Work out how a documentation link should be embedded (PDF reader vs slide deck). */
export function toResource(url: string): Resource {
  const trimmed = url.trim();

  const slides = trimmed.match(/docs\.google\.com\/presentation\/d\/([^/]+)/);
  if (slides)
    return {
      kind: "slides",
      src: `https://docs.google.com/presentation/d/${slides[1]}/embed?start=false&loop=false`,
      needsAbsolute: false,
    };

  const drive = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive)
    return { kind: "pdf", src: `https://drive.google.com/file/d/${drive[1]}/preview`, needsAbsolute: false };

  const driveOpen = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpen)
    return { kind: "pdf", src: `https://drive.google.com/file/d/${driveOpen[1]}/preview`, needsAbsolute: false };

  const docs = trimmed.match(/docs\.google\.com\/document\/d\/([^/]+)/);
  if (docs)
    return { kind: "pdf", src: `https://docs.google.com/document/d/${docs[1]}/preview`, needsAbsolute: false };

  if (SLIDE_EXT.test(trimmed))
    return {
      kind: "slides",
      src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(trimmed)}`,
      needsAbsolute: !/^https?:\/\//i.test(trimmed),
    };

  return { kind: "pdf", src: trimmed, needsAbsolute: false };
}

const officeSrc = (url: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
const googleSrc = (url: string) =>
  `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

export function DocViewer({
  url,
  title,
  kind,
}: {
  url: string;
  title: string;
  /** Force the viewer type — documentation and slides are separate resources. */
  kind?: "pdf" | "slides";
}) {
  const [provider, setProvider] = useState<"office" | "google">("office");
  const [open, setOpen] = useState(false);

  // Remote renderers (Office Online / Google) fetch the file from the public
  // internet, so the editor's *.lovableproject.com sandbox host will not work.
  // Map it to the equivalent public preview host.
  const publicOrigin = () => {
    if (typeof window === "undefined") return "";
    const { origin, hostname } = window.location;
    const sandbox = hostname.match(/^([0-9a-f-]{36})\.lovableproject\.com$/i);
    if (sandbox) return `https://id-preview--${sandbox[1]}.lovable.app`;
    return origin;
  };

  const absolute =
    typeof window !== "undefined" && !/^https?:\/\//i.test(url.trim())
      ? new URL(url, publicOrigin()).toString()
      : url;
  const detected = toResource(absolute);
  const isMarkdown = MARKDOWN_EXT.test(url.trim());
  const resolvedKind = kind ?? detected.kind;
  const isSlides = !isMarkdown && resolvedKind === "slides";
  // A Google Slides / Drive embed is already an iframe-ready URL; only raw
  // office files need to go through a remote rendering service.
  const isHostedEmbed = /docs\.google\.com|drive\.google\.com/.test(detected.src);
  const src = isSlides
    ? isHostedEmbed
      ? detected.src
      : provider === "office"
        ? officeSrc(absolute)
        : googleSrc(absolute)
    : detected.src;

  const isLocal =
    typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname);
  const label = isSlides ? "slide deck" : "documentation";
  const Icon = isSlides ? Presentation : FileText;

  return (
    <div className="rounded-md border border-border bg-surface-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-accent" /> {title} — {label}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {open && isSlides && !isHostedEmbed ? (
            <div className="inline-flex overflow-hidden rounded-sm border border-border font-mono text-[11px]">
              {(["office", "google"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setProvider(option)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    provider === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
          {open ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 font-mono text-[11px] transition-colors hover:border-primary"
            >
              hide
            </button>
          ) : null}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 font-mono text-[11px] transition-colors hover:border-primary"
          >
            <ExternalLink className="h-3 w-3" /> open in new tab
          </a>
        </div>
      </div>

      {!open ? (
        <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-4 overflow-hidden px-6 py-12 text-center sm:min-h-[280px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <p className="relative max-w-sm font-mono text-[11px] text-muted-foreground">
            // {label} is hidden by default to keep the page light
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-sm border border-primary/60 bg-primary/10 px-4 py-2 font-mono text-xs text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="h-3.5 w-3.5" /> show {label}
          </button>
        </div>
      ) : isMarkdown ? (
        <MarkdownDoc src={url} />
      ) : isSlides ? (
        <>
          <div className="aspect-video w-full animate-in fade-in duration-300">
            <iframe
              key={src}
              src={src}
              title={`${title} slide deck`}
              allowFullScreen
              className="h-full w-full border-0 bg-background"
            />
          </div>
          <p className="border-t border-border/70 px-4 py-2 font-mono text-[11px] text-muted-foreground">
            {isHostedEmbed
              ? "rendered by google slides"
              : isLocal
                ? "// preview only: the remote slide renderer cannot reach a local URL — publish to view the deck inline"
                : "// deck rendered remotely — switch viewer if it fails to load"}
          </p>
        </>
      ) : (
        <iframe
          src={src}
          title={`${title} documentation`}
          className="h-[70vh] max-h-[820px] w-full animate-in fade-in border-0 bg-background duration-300"
          allow="autoplay"
        />
      )}
    </div>
  );
}
