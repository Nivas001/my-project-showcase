import { ExternalLink, FileText } from "lucide-react";

/** Drive PDFs render inline through their /preview URL; direct PDFs use an object frame. */
function toReaderUrl(url: string): string {
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`;
  const docs = url.match(/docs\.google\.com\/document\/d\/([^/]+)/);
  if (docs) return `https://docs.google.com/document/d/${docs[1]}/preview`;
  return url;
}

export function DocViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5 text-accent" /> {title} — documentation
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
      <iframe
        src={toReaderUrl(url)}
        title={`${title} documentation`}
        className="h-[70vh] max-h-[820px] w-full border-0 bg-background"
        allow="autoplay"
      />
    </div>
  );
}
