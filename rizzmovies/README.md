# RizzMovies

RizzMovies is a glossy movie and series catalogue with a WordPress-style publishing dashboard. It is designed for authorised third-party HTTPS video players; the website does not store video files.

## Included

- Responsive cinematic homepage and title detail/player pages
- Movie and series posts, including seasons and episodes
- Search, genres, recommendations, trending and featured content
- Admin authentication, dashboard, drafts, publishing and site settings
- Paste an iframe or player URL; only the extracted HTTPS URL is stored
- Cloudflare D1-ready CMS API with an automatic browser-storage fallback for demonstrations
- Test content and a legal public-domain demonstration player

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The admin panel is at `/admin/login`.

## Environment variables

Copy `.env.example` to `.env` and replace every placeholder before production use. The default credentials exist only for the private demonstration build.

## Production database

The API expects a Cloudflare D1 binding called `DB`. Tables and seed data are created automatically on first use. Without this binding, the browser demonstration remains functional on the same device through local storage. Configure D1 before making the site public so published content is shared with every visitor.

## Content rights

Only embed movies or series that you own, are licensed to distribute, or are explicitly authorised to embed by the provider.
