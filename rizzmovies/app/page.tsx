"use client";

import Link from "next/link";
import { ArrowRight, Clapperboard, Film, Play, Search, Sparkles, Star, Tv } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { MediaCard } from "@/components/MediaCard";
import { MediaRow } from "@/components/MediaRow";
import { PublicHeader } from "@/components/PublicHeader";
import { loadPublicContent } from "@/lib/client-cms";
import { seedPayload } from "@/lib/seed";
import type { CmsPayload } from "@/lib/types";

const genreArt: Record<string, string> = {
  Action: "linear-gradient(135deg, rgba(255,49,88,.82), rgba(38,8,21,.78))",
  Drama: "linear-gradient(135deg, rgba(124,70,255,.85), rgba(17,12,38,.84))",
  "Sci-Fi": "linear-gradient(135deg, rgba(0,196,255,.78), rgba(7,22,48,.88))",
  Mystery: "linear-gradient(135deg, rgba(18,185,129,.72), rgba(5,29,31,.9))",
  Romance: "linear-gradient(135deg, rgba(245,92,154,.8), rgba(51,14,40,.86))",
  Thriller: "linear-gradient(135deg, rgba(239,151,41,.8), rgba(48,24,8,.9))",
};

export default function HomePage() {
  const [data, setData] = useState<CmsPayload>(seedPayload);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadPublicContent().then(setData);
    const refresh = () => loadPublicContent().then(setData);
    window.addEventListener("rizzmovies:data", refresh);
    return () => window.removeEventListener("rizzmovies:data", refresh);
  }, []);

  const published = data.items.filter((item) => item.status === "published");
  const featured = published.find((item) => item.featured) ?? published[0];
  const trending = published.filter((item) => item.trending).concat(published).filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index).slice(0, 10);
  const movies = published.filter((item) => item.type === "movie");
  const series = published.filter((item) => item.type === "series");
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return published.filter((item) => `${item.title} ${item.genres.join(" ")} ${item.synopsis}`.toLowerCase().includes(term));
  }, [query, published]);

  if (!featured) return <main className="empty-state">No published content yet. <Link href="/admin/login">Open the admin panel</Link>.</main>;

  return (
    <div className="public-shell" style={{ "--accent": data.settings.accent } as React.CSSProperties}>
      <PublicHeader onSearch={setQuery} />
      <main>
        <section className="home-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,7,12,.98) 0%, rgba(5,7,12,.58) 46%, rgba(5,7,12,.08) 72%), linear-gradient(0deg, #07090d 0%, transparent 45%), url("${featured.backdropUrl}")` }}>
          <div className="hero-noise" />
          <div className="hero-copy">
            <span className="hero-kicker"><Sparkles size={14} /> {data.settings.announcement || "RizzMovies Original"}</span>
            <h1>{featured.title}</h1>
            <div className="hero-meta"><span className="match">98% match</span><span>{featured.year}</span><span>{featured.maturity}</span><span>{featured.runtime}</span><span><Star size={13} fill="currentColor" /> {featured.rating}</span></div>
            <p>{featured.synopsis}</p>
            <div className="hero-actions">
              <Link href={`/watch/${featured.slug}`} className="primary-button"><Play fill="currentColor" size={19} /> Watch now</Link>
              <Link href={`/watch/${featured.slug}`} className="glass-button">View details <ArrowRight size={18} /></Link>
            </div>
          </div>
          <div className="hero-side-card"><Clapperboard size={20} /><span>Featured tonight</span><strong>{featured.genres.slice(0, 2).join(" · ")}</strong></div>
        </section>

        <div className="content-wrap">
          {query && (
            <section className="search-results" id="browse">
              <div className="section-heading"><div><span>SEARCH</span><h2>{results.length} result{results.length === 1 ? "" : "s"} for “{query}”</h2></div></div>
              {results.length ? <div className="media-grid">{results.map((item) => <MediaCard key={item.id} item={item} />)}</div> : <div className="no-results"><Search /><p>No titles matched your search.</p></div>}
            </section>
          )}

          <MediaRow id="new" title="Trending now" eyebrow="WHAT EVERYONE IS WATCHING" items={trending} wide />
          <MediaRow title="Today’s top 10" items={published.slice(0, 10)} ranked />

          <section className="platform-banner">
            <div><span className="mini-label">CURATED FOR YOU</span><h2>One screen. Endless stories.</h2><p>Explore cinema, binge-worthy series and hidden gems in one glossy experience.</p></div>
            <div className="platform-pills"><span>4K Ready</span><span>Subtitles</span><span>Multi-device</span></div>
          </section>

          <MediaRow id="movies" title="Popular movies" eyebrow="BIG SCREEN ENERGY" items={movies.slice(0, 10)} wide />
          <MediaRow id="series" title="Binge-worthy series" eyebrow="NEXT EPISODE AWAITS" items={series.length ? series : published.slice(2, 8)} wide />

          <section className="genre-section" id="genres">
            <div className="section-heading"><div><span>FIND YOUR MOOD</span><h2>Pick a genre</h2></div></div>
            <div className="genre-grid">
              {Object.entries(genreArt).map(([genre, background], index) => (
                <button key={genre} style={{ background }} onClick={() => setQuery(genre)}>
                  {index % 3 === 0 ? <Film /> : index % 3 === 1 ? <Tv /> : <Clapperboard />}
                  <span>{genre}</span><ArrowRight />
                </button>
              ))}
            </div>
          </section>

          <MediaRow title="Hidden gems" items={[...published].reverse().slice(0, 10)} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
