import { ExternalLink, FileText, Presentation } from "lucide-react";

type Resource = {
  kind: "pdf" | "slides";
  src: string;
  /** Office viewer needs an absolute URL, resolved on the client. */
  needsAbsolute: boolean;
};

const SLIDE_EXT = /(\.(ppt|pptx|key|odp)(\?|$)|[?&]ext=(ppt|pptx|key|odp)(&|$))/i;

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
  const absolute =
    typeof window !== "undefined" && !/^https?:\/\//i.test(url.trim())
      ? new URL(url, window.location.origin).toString()
      : url;
  const detected = toResource(absolute);
  const resolvedKind = kind ?? detected.kind;
  const resource: Resource =
    kind === "slides" && detected.kind !== "slides"
      ? {
          kind: "slides",
          src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absolute)}`,
          needsAbsolute: false,
        }
      : { ...detected, kind: resolvedKind };
  const isSlides = resource.kind === "slides";
  const label = isSlides ? "slide deck" : "documentation";
  const Icon = isSlides ? Presentation : FileText;

  return (
    <div className="rounded-md border border-border bg-surface-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-accent" /> {title} — {label}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 font-mono text-[11px] transition-colors hover:border-primary"
        >
          <ExternalLink className="h-3 w-3" /> open in new tab
        </a>
      </div>
      {resource.kind === "slides" ? (
        <div className="aspect-video w-full">
          <iframe
            src={resource.src}
            title={`${title} slide deck`}
            allowFullScreen
            className="h-full w-full border-0 bg-background"
          />
        </div>
      ) : (
        <iframe
          src={resource.src}
          title={`${title} documentation`}
          className="h-[70vh] max-h-[820px] w-full border-0 bg-background"
          allow="autoplay"
        />
      )}
    </div>
  );
}
