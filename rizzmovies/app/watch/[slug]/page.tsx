"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Clock3, Globe2, Heart, Home, Play, Share2, Star, Tv2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import { MediaCard } from "@/components/MediaCard";
import { PublicHeader } from "@/components/PublicHeader";
import { loadPublicContent } from "@/lib/client-cms";
import { seedPayload } from "@/lib/seed";
import type { CmsPayload, Episode, MediaItem } from "@/lib/types";

export default function WatchPage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params?.slug ?? "");
  const [data, setData] = useState<CmsPayload>(seedPayload);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLElement | null>(null);

  useEffect(() => { loadPublicContent().then(setData); }, []);
  const item = useMemo(() => data.items.find((entry) => entry.slug === slug), [data, slug]);
  useEffect(() => { if (item?.episodes.length) setEpisode(item.episodes[0]); }, [item?.id]);

  if (!item) {
    return <div className="not-found"><span>404</span><h1>That title slipped out of frame.</h1><Link href="/">Return home</Link></div>;
  }

  const playerUrl = episode?.embedUrl || item.embedUrl;
  const related = data.items.filter((entry) => entry.id !== item.id && entry.status === "published" && entry.genres.some((genre) => item.genres.includes(genre))).slice(0, 6);

  function startWatching() {
    setPlaying(true);
    window.setTimeout(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  async function share() {
    if (navigator.share) await navigator.share({ title: item?.title ?? "RizzMovies", url: location.href }).catch(() => undefined);
    else await navigator.clipboard.writeText(location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="public-shell detail-shell" style={{ "--accent": data.settings.accent } as React.CSSProperties}>
      <PublicHeader />
      <main>
        <section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,7,12,.98) 0%, rgba(5,7,12,.52) 52%, rgba(5,7,12,.13) 78%), linear-gradient(0deg, #07090d 0%, transparent 45%), url("${item.backdropUrl}")` }}>
          <div className="detail-top-links"><button onClick={() => history.back()}><ArrowLeft /></button><Link href="/"><Home /></Link></div>
          <div className="detail-copy">
            <span className="hero-kicker">{item.type === "series" ? <Tv2 size={14} /> : <Play size={14} />} {item.type === "series" ? "RIZZ SERIES" : "NOW SHOWING"}</span>
            <h1>{item.title}</h1>
            <div className="genre-pills">{item.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
            <p>{item.synopsis}</p>
            <div className="detail-actions">
              <button className="primary-button" onClick={startWatching}><Play fill="currentColor" /> Watch {item.type === "series" ? "S1 E1" : "now"}</button>
              <button className={liked ? "round-action active" : "round-action"} onClick={() => setLiked((value) => !value)} aria-label="Add to watchlist"><Heart fill={liked ? "currentColor" : "none"} /></button>
              <button className="round-action" onClick={share} aria-label="Share">{copied ? <Check /> : <Share2 />}</button>
            </div>
          </div>
        </section>

        <div className="detail-content">
          <section className="player-panel" ref={playerRef}>
            <div className="player-heading"><div><span>NOW PLAYING</span><h2>{episode ? `${item.title} · S${episode.season} E${episode.number}` : item.title}</h2></div><span className="quality-badge">HD</span></div>
            <div className="video-frame">
              {playing && playerUrl ? (
                <iframe src={playerUrl} title={`${item.title} player`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-forms" />
              ) : (
                <button className="video-poster" style={{ backgroundImage: `linear-gradient(rgba(4,7,11,.42), rgba(4,7,11,.62)), url("${item.backdropUrl}")` }} onClick={startWatching}>
                  <span><Play fill="currentColor" /></span><strong>Play {episode?.title || item.title}</strong>
                </button>
              )}
            </div>
            {!playerUrl && <p className="player-note">No player has been added to this post yet.</p>}
          </section>

          <div className="details-grid">
            <section className="story-panel">
              <span className="mini-label">THE STORY</span><h2>About {item.title}</h2><p>{item.synopsis}</p>
              <div className="details-facts">
                <span><Clock3 /><small>Runtime</small><strong>{item.runtime || "—"}</strong></span>
                <span><CalendarDays /><small>Released</small><strong>{item.year}</strong></span>
                <span><Globe2 /><small>Language</small><strong>{item.language}</strong></span>
                <span><Star /><small>Rizz score</small><strong>{item.rating}/10</strong></span>
              </div>
            </section>
            <aside className="rating-panel"><div className="rating-orb"><strong>{item.rating}</strong><span>/10</span></div><div><span>VIEWER RATING</span><div className="stars">★★★★★</div><p>{item.maturity} · {item.genres.join(" · ")}</p></div></aside>
          </div>

          {item.type === "series" && item.episodes.length > 0 && (
            <section className="episodes-panel">
              <div className="section-heading"><div><span>SEASON 1</span><h2>Episodes</h2></div><span>{item.episodes.length} episodes</span></div>
              <div className="episode-list">
                {item.episodes.map((entry) => (
                  <button key={entry.id} className={episode?.id === entry.id ? "episode-card active" : "episode-card"} onClick={() => { setEpisode(entry); setPlaying(false); }}>
                    <span className="episode-thumb" style={{ backgroundImage: `url("${entry.thumbnailUrl || item.backdropUrl}")` }}><i>{entry.number}</i><Play fill="currentColor" /></span>
                    <span className="episode-copy"><small>S{entry.season} E{entry.number}</small><strong>{entry.title}</strong><p>{entry.synopsis}</p></span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {item.cast.length > 0 && (
            <section className="cast-section"><div className="section-heading"><div><span>MEET THE CAST</span><h2>Cast & characters</h2></div></div><div className="cast-row">{item.cast.map((member, index) => <div className="cast-card" key={`${member.name}-${index}`}><img src={member.image || item.posterUrl} alt={member.name} /><strong>{member.name}</strong><span>{member.role}</span></div>)}</div></section>
          )}

          <section className="recommend-section"><div className="section-heading"><div><span>YOU MAY ALSO LIKE</span><h2>More like this</h2></div></div><div className="media-grid wide-grid">{(related.length ? related : data.items.filter((entry) => entry.id !== item.id).slice(0, 6)).map((entry) => <MediaCard key={entry.id} item={entry} wide />)}</div></section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
