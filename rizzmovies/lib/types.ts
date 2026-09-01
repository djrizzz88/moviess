export type ContentType = "movie" | "series";
export type ContentStatus = "draft" | "published";

export interface Episode {
  id: string;
  season: number;
  number: number;
  title: string;
  synopsis: string;
  embedUrl: string;
  thumbnailUrl: string;
}

export interface CastMember {
  name: string;
  role: string;
  image: string;
}

export interface MediaItem {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;
  synopsis: string;
  year: number;
  runtime: string;
  rating: number;
  language: string;
  maturity: string;
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  embedUrl: string;
  featured: boolean;
  trending: boolean;
  section: string;
  cast: CastMember[];
  episodes: Episode[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  accent: string;
  announcement: string;
}

export interface CmsPayload {
  items: MediaItem[];
  settings: SiteSettings;
}
