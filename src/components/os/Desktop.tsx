import { DESKTOP_FILES } from "@/lib/os-apps";
import { Annotation, DoodleArrow } from "@/components/kit";
import { AppIcon, AppTarget } from "./AppIcon";

/**
 * The desktop layer: files and applications sitting on the wallpaper.
 *
 * This used to own the windows too — a local `open` array, a title table and an
 * offset table, all keyed by a union it maintained by hand. The window manager
 * owns all of that now, which is what lets the dock, the menu bar, the terminal
 * and a link inside a paragraph all open the same window. `AppTarget` reaches
 * the manager directly, so this component is back to what it should always have
 * been: icons on a wallpaper.
 *
 * Large screens only — phones get the home screen in `MobileShell` instead.
 */
export function Desktop() {
  return (
    <div className="pointer-events-none absolute right-6 top-24 z-20 hidden flex-col items-end gap-1 lg:flex">
      {/* Two columns, filled top-to-bottom then right-to-left, the way macOS
          wraps a full desktop. One column ran off the bottom of the screen and
          behind the dock. */}
      <div className="pointer-events-auto grid grid-flow-col grid-rows-6 gap-x-1 gap-y-1">
        {DESKTOP_FILES.map((file) => (
          <AppTarget
            key={file.id}
            app={file}
            aria-label={`Open ${file.label}`}
            className="desktop-icon group flex w-24 flex-col items-center gap-1.5 rounded-lg p-2 text-center"
          >
            <AppIcon app={file} size={46} />
            <span className="desktop-icon-label rounded px-1.5 py-0.5 text-[11px] leading-tight text-foreground transition-colors">
              {file.label}
            </span>
          </AppTarget>
        ))}
      </div>

      {/* A nudge, in the margin. */}
      <div className="pointer-events-none mt-1 flex -translate-x-6 items-start gap-1">
        <DoodleArrow tone="hog-red" className="h-11 w-12 -scale-x-100 -scale-y-100" />
        <Annotation tone="hog-red" rotate={-6} className="pt-5 text-lg">
          open these
        </Annotation>
      </div>
    </div>
  );
}
