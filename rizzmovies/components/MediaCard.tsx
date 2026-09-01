import Link from "next/link";
import { Play, Star } from "lucide-react";
import type { MediaItem } from "@/lib/types";

export function MediaCard({ item, rank, wide = false }: { item: MediaItem; rank?: number; wide?: boolean }) {
  return (
    <Link href={`/watch/${item.slug}`} className={`media-card ${wide ? "media-card-wide" : ""} ${rank ? "ranked-card" : ""}`}>
      {rank ? <span className="rank-number">{rank}</span> : null}
      <div className="media-card-image">
        <img src={wide ? item.backdropUrl : item.posterUrl} alt={`${item.title} artwork`} loading="lazy" />
        <span className="card-play"><Play size={18} fill="currentColor" /></span>
        <span className="card-rating"><Star size={12} fill="currentColor" /> {item.rating.toFixed(1)}</span>
        {item.type === "series" && <span className="card-type">SERIES</span>}
      </div>
      <div className="media-card-copy">
        <strong>{item.title}</strong>
        <span>{item.year} · {item.genres[0] || item.type}</span>
      </div>
    </Link>
  );
}
