/** Turn a share link from Drive / YouTube into something embeddable. */
export function toEmbedUrl(url: string): { kind: "iframe" | "video"; src: string } {
  const trimmed = url.trim();

  const drive = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return { kind: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview` };

  const driveOpen = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpen)
    return { kind: "iframe", src: `https://drive.google.com/file/d/${driveOpen[1]}/preview` };

  const youtube = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` };

  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(trimmed)) return { kind: "video", src: trimmed };

  return { kind: "iframe", src: trimmed };
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const embed = toEmbedUrl(url);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-raised">
      <div className="aspect-video w-full">
        {embed.kind === "video" ? (
          <video src={embed.src} controls className="h-full w-full" />
        ) : (
          <iframe
            src={embed.src}
            title={`${title} demo video`}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        )}
      </div>
    </div>
  );
}
