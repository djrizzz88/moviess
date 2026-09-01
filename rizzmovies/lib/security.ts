import type { Episode, MediaItem } from "./types";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function extractEmbedUrl(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const iframeMatch = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = (iframeMatch?.[1] ?? raw).replace(/&amp;/g, "&").trim();
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function cleanText(value: unknown, max = 500): string {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

function cleanImageUrl(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function sanitizeMediaItem(value: Partial<MediaItem>, previous?: MediaItem): MediaItem {
  const timestamp = new Date().toISOString();
  const title = cleanText(value.title, 120) || "Untitled";
  const requestedSlug = slugify(cleanText(value.slug, 100));
  const episodes: Episode[] = Array.isArray(value.episodes)
    ? value.episodes.slice(0, 500).map((episode, index) => ({
        id: cleanText(episode.id, 80) || crypto.randomUUID(),
        season: Math.max(1, Number(episode.season) || 1),
        number: Math.max(1, Number(episode.number) || index + 1),
        title: cleanText(episode.title, 120) || `Episode ${index + 1}`,
        synopsis: cleanText(episode.synopsis, 1200),
        embedUrl: extractEmbedUrl(episode.embedUrl),
        thumbnailUrl: cleanImageUrl(episode.thumbnailUrl),
      }))
    : [];

  return {
    id: cleanText(value.id, 80) || crypto.randomUUID(),
    title,
    slug: requestedSlug || slugify(title),
    type: value.type === "series" ? "series" : "movie",
    status: value.status === "published" ? "published" : "draft",
    synopsis: cleanText(value.synopsis, 5000),
    year: Math.min(2100, Math.max(1888, Number(value.year) || new Date().getFullYear())),
    runtime: cleanText(value.runtime, 30),
    rating: Math.min(10, Math.max(0, Number(value.rating) || 0)),
    language: cleanText(value.language, 50),
    maturity: cleanText(value.maturity, 20),
    genres: Array.isArray(value.genres) ? value.genres.slice(0, 12).map((v) => cleanText(v, 30)).filter(Boolean) : [],
    posterUrl: cleanImageUrl(value.posterUrl),
    backdropUrl: cleanImageUrl(value.backdropUrl),
    trailerUrl: extractEmbedUrl(value.trailerUrl),
    embedUrl: extractEmbedUrl(value.embedUrl),
    featured: Boolean(value.featured),
    trending: Boolean(value.trending),
    section: cleanText(value.section, 60) || "New Releases",
    cast: Array.isArray(value.cast) ? value.cast.slice(0, 30).map((member) => ({
      name: cleanText(member.name, 80),
      role: cleanText(member.role, 80),
      image: cleanImageUrl(member.image),
    })).filter((member) => member.name) : [],
    episodes,
    createdAt: previous?.createdAt ?? timestamp,
    updatedAt: timestamp,
    publishedAt: value.status === "published" ? (previous?.publishedAt ?? timestamp) : null,
  };
}
