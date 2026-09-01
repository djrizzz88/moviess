import { ChevronRight } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { MediaCard } from "./MediaCard";

export function MediaRow({ id, title, eyebrow, items, ranked = false, wide = false }: { id?: string; title: string; eyebrow?: string; items: MediaItem[]; ranked?: boolean; wide?: boolean }) {
  if (!items.length) return null;
  return (
    <section className="media-section" id={id}>
      <div className="section-heading">
        <div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>
        <a href="#browse">Browse all <ChevronRight size={16} /></a>
      </div>
      <div className={`media-row ${ranked ? "ranked-row" : ""}`}>
        {items.map((item, index) => <MediaCard key={item.id} item={item} rank={ranked ? index + 1 : undefined} wide={wide} />)}
      </div>
    </section>
  );
}
