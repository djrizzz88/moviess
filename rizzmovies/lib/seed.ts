import type { CmsPayload, MediaItem } from "./types";

const photos = {
  hero: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2200&q=88",
  city: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=84",
  desert: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=84",
  neon: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=84",
  space: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=84",
  ocean: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=84",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=84",
  road: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=84",
  snow: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=84",
  tech: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=84",
  portrait1: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=82",
  portrait2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=82",
  portrait3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=82",
};

const demoEmbed = "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ";
const now = "2026-08-30T12:00:00.000Z";

function item(input: Partial<MediaItem> & Pick<MediaItem, "id" | "title" | "slug">): MediaItem {
  return {
    id: input.id,
    title: input.title,
    slug: input.slug,
    type: input.type ?? "movie",
    status: input.status ?? "published",
    synopsis: input.synopsis ?? "A gripping original story where one decision changes everything.",
    year: input.year ?? 2026,
    runtime: input.runtime ?? "1h 48m",
    rating: input.rating ?? 8.1,
    language: input.language ?? "English",
    maturity: input.maturity ?? "16+",
    genres: input.genres ?? ["Drama", "Thriller"],
    posterUrl: input.posterUrl ?? photos.city,
    backdropUrl: input.backdropUrl ?? input.posterUrl ?? photos.city,
    trailerUrl: input.trailerUrl ?? "",
    embedUrl: input.embedUrl ?? demoEmbed,
    featured: input.featured ?? false,
    trending: input.trending ?? false,
    section: input.section ?? "New Releases",
    cast: input.cast ?? [
      { name: "Adrian Cole", role: "Elias Voss", image: photos.portrait1 },
      { name: "Maya Lin", role: "Nora Vale", image: photos.portrait2 },
      { name: "Jon Bell", role: "Marcus Grey", image: photos.portrait3 },
    ],
    episodes: input.episodes ?? [],
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    publishedAt: input.publishedAt ?? now,
  };
}

export const seedItems: MediaItem[] = [
  item({ id: "m1", title: "Shadow Protocol", slug: "shadow-protocol", featured: true, trending: true, posterUrl: photos.hero, backdropUrl: photos.hero, rating: 8.7, genres: ["Action", "Mystery", "Thriller"], synopsis: "When a vanished intelligence officer resurfaces, an analyst must expose a conspiracy before the city goes dark." }),
  item({ id: "m2", title: "Neon Horizon", slug: "neon-horizon", trending: true, posterUrl: photos.neon, backdropUrl: photos.neon, genres: ["Sci-Fi", "Thriller"], rating: 8.4 }),
  item({ id: "m3", title: "Last Signal", slug: "last-signal", trending: true, posterUrl: photos.space, backdropUrl: photos.space, genres: ["Sci-Fi", "Adventure"], rating: 8.2 }),
  item({ id: "m4", title: "Crimson Orbit", slug: "crimson-orbit", trending: true, posterUrl: photos.desert, backdropUrl: photos.desert, genres: ["Action", "Drama"], rating: 7.9 }),
  item({ id: "m5", title: "Silent Verdict", slug: "silent-verdict", posterUrl: photos.road, backdropUrl: photos.road, genres: ["Crime", "Drama"], rating: 8.3, section: "Top Rated" }),
  item({ id: "m6", title: "Afterlight", slug: "afterlight", posterUrl: photos.ocean, backdropUrl: photos.ocean, genres: ["Drama", "Romance"], rating: 8.0, section: "Top Rated" }),
  item({ id: "m7", title: "Arctic Zero", slug: "arctic-zero", posterUrl: photos.snow, backdropUrl: photos.snow, genres: ["Survival", "Thriller"], rating: 7.8 }),
  item({ id: "m8", title: "The Long Escape", slug: "the-long-escape", posterUrl: photos.forest, backdropUrl: photos.forest, genres: ["Adventure", "Mystery"], rating: 8.1 }),
  item({ id: "m9", title: "Rift", slug: "rift", posterUrl: photos.tech, backdropUrl: photos.tech, genres: ["Sci-Fi", "Mystery"], rating: 7.7 }),
  item({ id: "m10", title: "Midnight Courier", slug: "midnight-courier", posterUrl: photos.city, backdropUrl: photos.city, genres: ["Action", "Crime"], rating: 7.9 }),
  item({
    id: "s1", title: "City of Glass", slug: "city-of-glass", type: "series", posterUrl: photos.city, backdropUrl: photos.city,
    genres: ["Drama", "Mystery"], rating: 8.8, section: "Series", synopsis: "A journalist follows a trail of coded messages through a city built on secrets.",
    episodes: [
      { id: "e1", season: 1, number: 1, title: "The Message", synopsis: "A message arrives from an impossible sender.", embedUrl: demoEmbed, thumbnailUrl: photos.city },
      { id: "e2", season: 1, number: 2, title: "The Witness", synopsis: "A hidden witness changes the investigation.", embedUrl: demoEmbed, thumbnailUrl: photos.road },
      { id: "e3", season: 1, number: 3, title: "Reflections", synopsis: "The truth is closer than anyone expected.", embedUrl: demoEmbed, thumbnailUrl: photos.tech },
    ],
  }),
  item({ id: "s2", title: "Echo Valley", slug: "echo-valley", type: "series", posterUrl: photos.forest, backdropUrl: photos.forest, genres: ["Mystery", "Drama"], rating: 8.5, section: "Series" }),
];

export const seedPayload: CmsPayload = {
  items: seedItems,
  settings: {
    siteName: "RizzMovies",
    tagline: "Stories worth staying up for.",
    accent: "#ff3158",
    announcement: "Fresh premieres every Friday",
  },
};
