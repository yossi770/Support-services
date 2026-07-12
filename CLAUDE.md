# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Locked brand decisions

These were confirmed with the user and are baked into the build — keep them consistent:

- **Brand name:** Houston Home Tech Help · **Domain:** `houstonhometechhelp.com`
- **Owner:** Yosef — a software-systems builder/designer. Positioning (his words): *"My background is in building and designing software systems. Because I know exactly how these devices and apps are built under the hood, I know how to make them work smoothly for you. I take the frustration out of technology, so you can just enjoy using it."* Use this "under the hood → makes tech work smoothly for you" angle rather than dry "software architect" language.
- **Contact details & integration keys are placeholders** (phone, email, GA4 `G-XXXXXXXXXX`, Web3Forms key) — clearly marked for find-and-replace before launch. See README's "Before you launch" section.
- **Blog subsystem is included** (Blueprint §10): `content/blog/`, `scripts/build_blog.js`, `templates/`, `admin/`.
- **Testimonials/reviews are sample copy** and the homepage `AggregateRating`/`Review` JSON-LD is intentionally omitted until real reviews exist (fabricated review schema violates Google policy). Add it back once genuine reviews are collected.

## Project status

This repo currently contains the two planning documents plus the built static site. The build follows the blueprint with the brand decisions above.

- `goal.md` — the **specific business** to build for: *"Support Area / Technology Made Simple"*, an in-home + remote tech-support service for adults and individuals in the greater Houston, TX area (device setup, Wi-Fi/printers, app training, ongoing troubleshooting). The owner is a software architect; the brand promise is "technological peace of mind" in patient, plain language. `goal.md` also contains the finalized **`areaServed` geo data** (a GeoCircle + ~40 ZIP codes + a long list of Houston subdivisions) to drop into the homepage schema and service-area content. Open naming/branding questions in that file (e.g. domain name, page title) are still undecided — confirm with the user before hard-coding them.
- `WEBSITE_BLUEPRINT.md` — the **build specification and reference implementation** to follow. It is self-contained (spec in §1–§12, complete copy-paste-then-parameterize reference files in Appendix A). Read it before writing any page. `goal.md` supplies the §2 Project Intake values; the blueprint fixes the structure and engineering.

When these two disagree, `goal.md` (the actual client) wins on business facts; the blueprint wins on architecture and conventions.

## Architecture (non-negotiable constraints from the blueprint)

- **Framework-free static site**: hand-written HTML5 + CSS3 + a little vanilla ES6. No React/Vue, no SPA routing, no bundler, **no runtime server, no database.** The public site is always 100% static HTML. These are deliberate SEO/speed decisions — don't "modernize" them.
- **Hosting**: **Cloudflare Pages** (deploys to a `*.pages.dev` URL) behind a custom domain, with the **code hosted on GitHub** (Cloudflare Pages watches the GitHub repo and deploys on push). Note this **overrides the blueprint**, which assumes GitHub Pages: the GitHub-Pages-specific artifacts it prescribes (`CNAME`, `.nojekyll`) are not used here — the custom domain is configured in the Cloudflare dashboard, and Cloudflare needs no Jekyll opt-out. The two template sites named in `goal.md` (`thefriendlymortgagebroker.pages.dev`, `garageexperttx.pages.dev`) are Cloudflare Pages deployments.
- **Shared chrome**: every page is a complete `.html` document that links three shared assets — `assets/styles.css`, `assets/shared.js`, `assets/analytics.js` — and repeats the same `<nav>`/`<footer>`. `assets/shared.js` (nav drawer, Services dropdown, accessibility widget, scroll-to-top) is already business-agnostic; reproduce it as-is from Appendix A.5.
- **URL model**: homepage + **one folder per service** → clean directory URLs like `/service-name/index.html` served as `/service-name/`. Slugs are lowercase-hyphenated and keyword-bearing. One `<h1>` per page; canonical URL on every page.
- **SEO is first-class on every page**, not an afterthought: unique title/description, canonical, Open Graph + Twitter cards, and **JSON-LD** (business schema on the homepage using the right schema.org type for a local tech-support/`LocalBusiness`-style entity, `FAQPage` on FAQ sections, `BreadcrumbList` on sub-pages). Validate JSON-LD with Google's Rich Results Test before launch. Plus `sitemap.xml`, `robots.txt`, GA4.
- **Accessibility baseline** (§8) and the **serverless Web3Forms contact form** (§7) are part of the standard build, not optional extras. A privacy page is required because analytics + a form are present.
- **RTL safeguard**: the nav is pinned `direction: ltr` so a browser "translate to Hebrew/Arabic" pass can't break the menu. Keep this — it fixed a real bug.

### This site is local, not nationwide

The blueprint's reference implementation (Reizes Law) is a *nationwide* business. This one is **local to Houston**, so adapt accordingly: use the `areaServed` block from `goal.md`, set geo meta tags (`geo.region`/`geo.placename`) to the Houston area, and pick a `LocalBusiness`-appropriate schema type rather than the nationwide `Country` example. Also: the reference is a law firm with a navy/gold serif aesthetic — `goal.md` explicitly requires this site look **distinct and unique**, not like the referenced template sites. Treat the blueprint's palette/typography/copy as *slots to fill*, not values to copy.

## Commands

The **core site has no build step** — it is static files opened directly or served with any static server (e.g. `python -m http.server`). There is nothing to compile, lint, or test for the core pages.

The only build tooling exists for the **optional SEO blog subsystem** (Blueprint §10 / Appendix A.8), and only if it is added:

```bash
npm ci            # install gray-matter + marked (Node >= 20)
npm run build     # node scripts/build_blog.js — renders content/blog/*.md into blog/**
```

`scripts/build_blog.js` is a **reconciler**, not append-only: each run treats non-`draft` `content/blog/*.md` as the source of truth and regenerates every derived surface (post pages, index, `posts.json`, and the `/blog/**` entries of `sitemap.xml` while preserving non-blog URLs). Posts with `draft: true` are never rendered. The generated `blog/**` is build output — never hand-edit it.

For deployment, the blog build runs in **Cloudflare Pages' build pipeline**, not GitHub Actions: set the Cloudflare Pages project's build command to `npm run build` and the output directory to the repo root (`.`). This replaces the blueprint's `.github/workflows/build-blog.yml` (Appendix A.10), which targets GitHub Pages. The core site needs no build.
