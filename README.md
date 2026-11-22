# www.i18next.com

The site at [www.i18next.com](https://www.i18next.com): the docs of i18next, react-i18next, next-i18next, i18next-cli
and Astro, the pages for working with a coding agent, and the blog. Markdown and HTML in `content/`, built into one
static site with Vike and Pagefind (a `.md` copy of every page, an `llms.txt` per section) and served by Cloudflare Workers
static assets. In the code, "G" (and its predecessor "E") is the name of the design the site's look comes from.

## Run it

```bash
npm install
npm start                        # vike dev (same as npm run dev); an edit in content/ reloads the page
npm run build                    # vike build, then scripts/postbuild.js, then pagefind
npm run preview                  # build, then wrangler dev on :8790 with _headers and _redirects
npm run check                    # against :8790: old URLs, GitBook heading ids, every link and image, llms.txt, search
node scripts/check.js http://127.0.0.1:3457 --dev   # the same against npm start, without old URLs (no _redirects there)
npm test                         # lint (neostandard, as on locize.com's site) and the GitBook converter tests
npm run lint:fix
```

What postbuild writes (the `.md` copies, llms.txt, sitemap, feed, GitBook images, preview cards) comes from
`scripts/outputs.js`; in `npm start` a middleware in `vite.config.js` serves the same, so "View as Markdown", "Copy page
for your agent" and the docs images work there too. Search in `npm start` uses the index of the last build
(`dist/client/pagefind`); without one it finds nothing.

`vike preview` does not apply `_headers`, so it cannot test the CSP (Pagefind needs `'wasm-unsafe-eval'`); use
`wrangler dev`.

## Deploy

A push to `main` publishes the site: Cloudflare Workers Builds runs `git fetch --unshallow && npm run build` (the
sitemap's `lastmod` comes from the git history) and `npx wrangler deploy`. A Deploy Hook rebuilds it every morning,
called by the cron of the old hosts' Worker, so the figures read at build stay current. By hand: `npm run deploy` (the
site, from the last build) and `npm run deploy:redirects` (the old hosts' Worker; it changes only with `redirects/`).

## What is where

| Path | What |
| --- | --- |
| `content/core`, `content/react` | The core and React docs, edited here since the last GitBook import (2026-11-21: `SUMMARY.md`, the pages it lists and the images they use, from i18next-gitbook `4c4fcd5` and react-i18next-gitbook `29ba6f7`) |
| `content/next`, `content/cli` | The next-i18next and i18next-cli docs, written in this repo: split from their READMEs (next-i18next 16.5.1, i18next-cli 1.91.3, 2026-11-20; i18next-cli's changes up to 1.93.0 carried over) into pages with a `SUMMARY.md` each. The next-i18next and i18next-cli READMEs carry part of this text; a change in one is carried over to the other |
| `content/home.html` | The home page: G's markup, links pointed at this site's pages |
| `content/astro/` | The Astro docs, written in this repo |
| `content/with-your-agent.html`, `content/agent/` | G's "With your agent" page; the five pages below it (`pages.json` lists them, one HTML file each, G's markup) |
| `public/assets/agent/`, `public/assets/fonts/` | G's preview scripts (bakery, story; they get i18next from this site's npm dependency, not a CDN) and G's font (Newsreader; SIL Open Font License), self-hosted |
| `content/usage.json`, `public/img/logos/` | The scan behind "Who uses i18next?" and its 60 browser-checked logos (own copies); the home page's logo band and count, and the post's figures, charts and list come from here (`src/usageWidgets.js`) |
| `src/facts.js`, `content/facts.json` | The start page's figures read at build: from npm (downloads of the named week, latest release and its date, i18next-cli version) and from GitHub (the repository's security advisories of the last twelve months); the snapshot without network, refreshed by `npm run facts` |
| `content/core/external.json` | Images the docs load from other hosts, copied in by `scripts/import-images.js` (run it when a page gets one); badges are dropped at build |
| `content/blog/<name>.md` | Blog posts (front matter plus Markdown, optional `tags`, `image`, `imageAlt`) (title and date required) |
| `content/privacy.md` | The privacy notice |
| `src/gitbook.js` | GitBook Markdown to CommonMark + GFM: every GitBook-only construct still in `content/` is handled here |
| `src/content.js` | Reads the sections, resolves links, renders HTML (remark/rehype), sets GitBook's heading ids |
| `src/sections.js` | The five sections (core, React, Next, CLI, Astro): path, title, old host, source repository |
| `src/blog.js` | Reads the blog posts, newest first |
| `src/YouTubeEmbed.jsx` | YouTube player behind consent: a link until the visitor accepts YouTube |
| `src/ogImage.js`, `src/og-fonts/` | Link preview images: a card per page in G's colours, rendered at build into `/og/` (a post uses its cover), with the Liberation fonts in `og-fonts/` only |
| `src/searchPages.js`, `src/CopyPage.jsx` | Pagefind lookup (search field and 404 page); "Copy page for your agent" |
| `pages/` | Vike: the home page (`index`), one catch-all docs page (`docs`), `with-your-agent` and `with-your-agent/@slug`, `blog` and `blog/@slug`, `privacy`, the 404 page, a thin layout |
| `scripts/postbuild.js` | `.md` per page, `llms.txt` and `llms-full.txt` (site and per section), `sitemap.xml`, `_redirects`, images |
| `scripts/downloads-chart.js` | Draws the chart of npm downloads per week (i18next, react-i18next) from the npm API: the history post's cover |
| `redirects/map.json` | Every page GitBook served (old URL), and paths of this site that moved, with their path here; its old URLs frozen at the last import, the paths follow when pages move |
| `redirects/anchors.json` | GitBook's heading ids per page, frozen at the last import; `old:<id>` where a section moved, also to pages GitBook never had |
| `redirects/worker.js` | The redirect Worker for the old hosts (react.i18next.com, i18next.com); its cron calls the site's Deploy Hook every morning |
| `src/cookieConsent.js` | The consent banner (vanilla-cookieconsent) as a bottom bar, `equalWeightButtons: true`, GA4 (`G-EHMLRHM6N4`, the existing i18next.com stream) |
| `public/assets/site.css`, `site.js` | G's CSS and script (theme, copy buttons, tabs) |

## URLs

| Before (GitBook) | Now |
| --- | --- |
| `www.i18next.com/` (the core Introduction) | `/` is the home page now; the Introduction is at `/introduction` (`/readme` and `/readme.md` redirect there) |
| `www.i18next.com/<path>` | `www.i18next.com/<path>`, except pages merged or dropped, which redirect (`redirects/map.json`) |
| `react.i18next.com/<path>` | `www.i18next.com/react/<path>` |
| next-i18next README on GitHub | `www.i18next.com/next` and the pages below it (`/next/app-router/setup`, ...) |
| i18next-cli README on GitHub | `www.i18next.com/cli` and the pages below it (`/cli/commands/extract`, ...) |
| `<page>.md` (GitBook) | `<page>.md`; section starts at `/introduction.md`, `/react.md`, `/next.md`, `/cli.md`, `/astro.md` |
| | new: `/with-your-agent` and its five pages, `/astro`, `/blog` with `/blog/<name>`, `/blog/feed.xml`, `/privacy`; `.md` for each (the home at `/index.md`), converted from G's HTML for G's pages |
| `llms.txt`, `llms-full.txt` per GitBook site | `/llms.txt` and `/llms-full.txt` for the whole site, plus `/react/`, `/next/`, `/cli/`, `/astro/llms.txt` and `llms-full.txt` |

Note: GitBook's `www.i18next.com/llms.txt` listed only the core docs; this one starts with the home page, With your agent and
its five pages, then the five docs sections, the blog and the privacy notice. There is no core-only file.

## Redirects

- **Data:** `redirects/map.json`, 64 old URLs: the 35 core and 20 react pages from both `SUMMARY.md` files, the four
  `llms.txt` / `llms-full.txt` files of the two GitBook hosts, and three redirects GitBook itself serves (`/readme` on
  both hosts and `/configuration-options`, found by the link check; GitBook sets these in its UI, they are not in the
  repositories), plus two paths of this site that moved. `.md` variants are derived, not listed.
- **Old hosts:** `redirects/worker.js`, a Worker of its own for `react.i18next.com/*` (and the bare `i18next.com/*`), so
  www's static assets never run Worker code. It looks the path up in the map, keeps `.md` and the query string, accepts
  GitBook's `.html` variant, sends files such as `/sitemap.xml` to the same path on www, and sends unknown paths to the
  section start with a 302, since that target is a guess. `_redirects` cannot do this: its sources are paths on the
  host that serves the assets.
- **This host:** `dist/client/_redirects`, written from the map: every www.i18next.com path that moved, with its `.md`, plus
  GitBook's old `/sitemap-pages.xml`. When pages move, the new paths go into the map's values; `npm run check` fails until every old URL ends on a page again.
