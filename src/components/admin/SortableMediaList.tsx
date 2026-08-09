import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";

type Props = {
  items: string[];
  onChange: (next: string[]) => void;
  labelPrefix: string;
};

/** Reorder helper: pull `from` out of the list and drop it at `to`. */
function reorder(list: string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved!);
  return next;
}

/** Drag-and-drop sortable list of storage paths used for screenshots and design pages. */
export function SortableMediaList({ items, onChange, labelPrefix }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {items.map((path, index) => (
        <div
          key={path}
          draggable
          onDragStart={(e) => {
            setDragIndex(index);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(index));
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (overIndex !== index) setOverIndex(index);
          }}
          onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
          onDrop={(e) => {
            e.preventDefault();
            const from = dragIndex ?? Number(e.dataTransfer.getData("text/plain"));
            if (!Number.isNaN(from)) onChange(reorder(items, from, index));
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={`flex items-center gap-2 rounded-sm bg-secondary px-2 py-1 font-mono text-[11px] transition-all ${
            dragIndex === index ? "opacity-40" : ""
          } ${overIndex === index && dragIndex !== index ? "ring-1 ring-primary" : ""}`}
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
          <span className="text-muted-foreground">{index + 1}.</span>
          <span className="flex-1 truncate">{path.split("/").pop()}</span>
          <button
            type="button"
            onClick={() => onChange(reorder(items, index, index - 1))}
            aria-label={`Move ${labelPrefix} up`}
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onChange(reorder(items, index, index + 1))}
            aria-label={`Move ${labelPrefix} down`}
          >
            <ArrowDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onChange(items.filter((p) => p !== path))}
            aria-label={`Remove ${labelPrefix}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
