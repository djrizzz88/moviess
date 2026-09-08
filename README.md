# Rizwan Ali — animated portfolio

A static, responsive portfolio for rizwanali.uk. Upload-ready for GitHub Pages. No npm, paid API, database, Cloudflare Worker or build step is needed.

## Publish on your existing GitHub Pages repository

1. Back up your existing repository before replacing its website files.
2. Extract this ZIP. Upload the CONTENTS of the extracted folder to your repository root, including index.html, styles.css, app.js and the assets folder. Do not upload only the ZIP or put the website inside another folder.
3. Keep the included CNAME file containing rizwanali.uk. Preserve your existing domain DNS configuration. The .nojekyll file is included; enable hidden-file visibility if needed when uploading.
4. In the repository, open Settings → Pages. Choose Deploy from a branch, select main (or your existing publishing branch), and choose / (root). Save. If an existing GitHub Actions workflow publishes the old site, disable or update it before switching to branch publishing.
5. Wait for GitHub Pages to finish deploying. Confirm the custom domain remains rizwanali.uk and enable Enforce HTTPS once available. If both apex and www already work, preserve those DNS records.
6. Open the site and check the project links. Select both services, open Your brief, remove and re-add a service, then try WhatsApp checkout. Review the recipient and message before sending.

GitHub documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Included features

- Cloud-backed hero with rotating text arrangement and scroll parallax.
- Supplied portrait with scroll-linked scale and word-by-word text illumination.
- Floating publication cards and dedicated Google Scholar, GitHub, Email and ORCID section.
- Section reveals, curved project carousel with touch gestures, tilted service cards and pause-animation control.
- Tilted project carousel: EduToolKit, B&M Pro Roofing and UXK Meat Trader.
- New supplied portrait, skills and two publications.
- SEO and Web Development service selection with a cart, removal controls and selection saved in the visitor's browser.
- Optional name, website and project brief. Checkout opens WhatsApp with a composed order request to +44 7404 303928 (wa.me/447404303928).
- No prices or online payment. Visitors must press Send inside WhatsApp. An enquiry is not a confirmed booking.
- Mobile layouts, keyboard focus, native modal dialog and reduced-motion support.

## Editing

- Content and project links: index.html.
- Colours and layout: styles.css, including CSS variables at the beginning.
- WhatsApp recipient: search for 447404303928 in app.js. Use international digits without + or the UK domestic leading 0.
- Portrait: replace assets/portrait.jpeg.
- Service names: update the HTML data-service values and the services array in app.js together.
- Domain: update CNAME and the canonical URL in index.html if you change domain.

## Hosting and privacy

Files are static. Graphics run in the visitor's browser. Only selected service names are saved in localStorage; name, website and brief are not persisted by the site. Details are passed to WhatsApp when the visitor checks out. There is no analytics or tracking script.

Fonts load from Google Fonts with local fallback fonts. The site still works if that request is blocked. The portrait and sky background are bundled locally. No additional generated icons or background assets are needed.

## Local preview

Open index.html directly for a quick look. For a local server, run `python3 -m http.server 8000` in this folder and visit http://localhost:8000.

## Validation performed

JavaScript syntax, local asset paths, anchor targets, portrait decoding, and WhatsApp URL generation for both services, special characters and multiline briefs passed. Live browser visual testing and sending a WhatsApp message were not performed. UXK's page content was unavailable during the build; its entry uses the supplied project name and link without additional claims.


## Add your project screenshots

The three screenshot areas are intentional placeholders requested for later replacement. They do not claim to show the live websites.

1. Take desktop screenshots, ideally landscape, approximately 1200 × 750 pixels.
2. Upload your screenshots into the assets folder in GitHub, using edutoolkit.jpg, bm-roofing.jpg and uxk-meat-trader.jpg.
3. Edit index.html. Replace assets/edutoolkit-placeholder.svg with assets/edutoolkit.jpg, assets/bm-roofing-placeholder.svg with assets/bm-roofing.jpg, and assets/uxk-meat-trader-placeholder.svg with assets/uxk-meat-trader.jpg. Use .png instead if that is your actual image type.
4. Change the corresponding alt text from “screenshot placeholder” to a short description of the screenshot. Commit the changes.

This is a static website: replacing files in GitHub publishes screenshots for everyone. There is no public upload control or admin server. You can also send the screenshots to the assistant for insertion.

## Image credit

Sky photograph: CHUTTERSNAP, Unsplash — https://unsplash.com/photos/white-clouds-aUicO5lYEF4 . Portrait supplied by the owner.

## Revision validation

HTML nesting, section anchors, local images, JavaScript syntax, email destination, three project placeholders and two publication cards were checked. Browser visual testing was not performed. Motion is an adaptation of the supplied reference, not an exact reproduction of its 3D models or timing.
