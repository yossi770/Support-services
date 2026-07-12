# Website Blueprint — Reusable Spec for Small-Business Static Sites

**Purpose.** This is a build specification an AI agent (or developer) can follow to stand up a new
small-business marketing website from a single instruction like *"I want a website for X."* It captures
the **architecture, technology, SEO, design system, and conventions** that the Reizes Law site
(`reizeslaw.com`) is built on, generalized so the same recipe applies to any business.

**How to use it.**
1. Read **§1 Quick Start** for the one-paragraph mental model.
2. Fill in the **§2 Project Intake** parameters for the specific business (the agent infers most of these
   from the user's request; it asks only when a choice is genuinely ambiguous).
3. Build the site following **§3–§9**. Everything not specified by intake should match the patterns in
   those sections exactly.
4. The **blog + CMS + AI-drafting subsystem (§10)** is *optional* — include it only when the business
   wants ongoing content/SEO. It can always be added later without touching the core site.

> Reizes Law is the **reference implementation** throughout. Where you see a Reizes-specific value
> (a law firm, navy/gold palette, federal-employment practice areas), treat it as *an example of the
> slot*, not a requirement.

---

## 1. Quick Start (the mental model)

A **hand-built, framework-free static website**: vanilla HTML5 + CSS3 + a little ES6 JavaScript, hosted
free on **GitHub Pages** behind a custom domain. No build step for the core site, no server, no database,
no monthly cost. Every page is a complete `.html` document that shares three asset files
(`styles.css`, `shared.js`, `analytics.js`) and a consistent `<nav>`/`<footer>` chrome.

The site is engineered to **rank and convert**: rich JSON-LD structured data, Open Graph/Twitter cards,
canonical URLs, a sitemap, GA4 analytics, a serverless contact form, and strong accessibility. Content is
organized as a **homepage + one folder per "service/practice area"** (clean directory URLs like
`/service-name/`).

Optionally, an **SEO blog** can be layered on: Markdown content rendered to static HTML by a tiny Node
build script in CI, edited through a **git-based visual CMS (Sveltia)**, and fed by a **scheduled AI
drafting agent** whose output always lands as a human-reviewed draft (never auto-published).

**Guiding values:** static output · no runtime server · no lock-in (content is plain files in the repo) ·
SEO as a first-class concern on every page · accessibility built in · conversion paths everywhere.

---

## 2. Project Intake (fill these in per business)

These are the only things that change between projects. The agent should derive them from the user's
request and stated brand; ask the user only where a decision materially changes the build and can't be
inferred.

| # | Parameter | Example (Reizes Law) | Notes |
|---|---|---|---|
| 2.1 | **Business name** | Reizes Law | Used in titles, schema, footer, byline. |
| 2.2 | **Tagline / brand nickname** | "The Fed Guy" | Optional `alternateName` in schema + OG. |
| 2.3 | **Domain** | reizeslaw.com | Goes in `CNAME`, canonicals, sitemap, schema `url`. |
| 2.4 | **Industry / schema type** | `["LegalService","Attorney"]` | Pick the right [schema.org](https://schema.org) type: `Dentist`, `Restaurant`, `MedicalBusiness`, `HomeAndConstructionBusiness`, `ProfessionalService`, `LocalBusiness`, etc. |
| 2.5 | **Services / "practice areas"** | discipline, removals, suspensions, MSPB, FERS, whistleblower, EEO | Each becomes a top-level folder + a nav dropdown item + a sitemap entry. 3–8 is typical. |
| 2.6 | **Service area (geo)** | All 50 US states (nationwide) | Drives `areaServed` in schema + geo meta tags. Local business → city/region instead. |
| 2.7 | **Contact details** | phone(s), intake email, hours | Phone in `tel:` links + schema; hours in `openingHoursSpecification`. |
| 2.8 | **Brand palette** | navy `#1a2b3c` + gold `#c5a059` | Two-color "primary + accent" scheme → CSS custom properties (§5.1). |
| 2.9 | **Typography** | Playfair Display (headings) + Montserrat (body) | A serif display + a clean sans is the default pairing; swap to fit brand. |
| 2.10 | **Logo** | inline SVG (gavel mark) | Prefer an inline SVG so it scales and themes via `currentColor`; falls back to a wordmark. |
| 2.11 | **Hero image / portrait** | `profile.jpg` / `.webp` | The OG/Twitter share image + above-the-fold visual. |
| 2.12 | **Reviews / social proof** | 3 client reviews (5★) | Feeds `AggregateRating` + `Review` schema and a testimonials section. |
| 2.13 | **Analytics ID** | GA4 `G-NYGP4NDRD2` | One GA4 property per site. |
| 2.14 | **Contact-form backend** | Web3Forms access key | Serverless form POST endpoint (§7). |
| 2.15 | **Blog wanted?** | Yes | If yes, build §10. If no, skip it entirely. |
| 2.16 | **Primary CTA** | "Free case review" → contact | The conversion action repeated across the site. |

> **Agent rule:** choose tasteful, industry-appropriate **design, copy, imagery, and tone** yourself.
> The blueprint fixes the *structure and engineering*; you fill the *content and aesthetics* to suit the
> business. Do not ask the user to specify colors or layout unless they want to.

---

## 3. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| **Markup** | Hand-written HTML5, one full document per page | No framework, no hydration, instant load, trivially debuggable. |
| **Styling** | One shared `assets/styles.css` (CSS custom properties, Flexbox/Grid) | Single source of truth for the design system; restyle in one file. |
| **Scripting** | Vanilla ES6 in `assets/shared.js` (+ `assets/analytics.js`), loaded `defer` | Nav/menu, accessibility widget, scroll-to-top, FAQ accordion, form handling. No bundler. |
| **Hosting** | **GitHub Pages**, custom domain via `CNAME`, `.nojekyll` present | Free, fast, HTTPS, CDN-backed. |
| **Fonts** | Google Fonts via `<link>` with `preconnect` | One stylesheet request; `display=swap`. |
| **Analytics** | Google Analytics 4 (`gtag.js`) | Free, standard; custom events for phone/email/CTA clicks. |
| **Contact form** | Web3Forms (serverless POST) | No backend; spam-protected; emails the business. |
| **Blog tooling** *(optional)* | Node ≥20, `gray-matter` + `marked`, run only in CI | Renders Markdown → static HTML. The *only* build step, and only for the blog. |
| **CMS** *(optional)* | Sveltia CMS (static admin in `/admin/`) + a free Cloudflare Worker for GitHub OAuth | Visual editing for non-technical owners; content stays in the repo. |
| **CI/CD** *(optional)* | GitHub Actions: build blog → deploy Pages artifact | Triggered on push to `main`. Core site needs no CI. |

**Hard constraints (don't violate without reason):**
- No client-side framework (React/Vue/etc.) and no SPA routing — these are content sites; static HTML wins on SEO and speed.
- No runtime server and no database.
- The **public site is always 100% static HTML.** Any build runs in CI only and emits static files.
- No paid infrastructure by default.

---

## 4. Site Structure & URL Conventions

```
<repo-root>/
├── index.html                 # Homepage: hero, about, services overview, reviews, FAQ, contact
├── <service-1>/index.html     # One folder per service → clean URL /<service-1>/
├── <service-2>/index.html
│   …
├── about/  (or lawyer/, team/) # Bio / about page
├── contact/index.html          # Dedicated contact page (homepage also has a contact section)
├── privacy/index.html          # Privacy policy (required if you run analytics/forms)
├── 404.html                    # Branded not-found page
├── assets/
│   ├── styles.css              # Shared design system (all pages)
│   ├── shared.js               # Shared behavior (nav, a11y, scroll, accordion)
│   └── analytics.js            # GA4 event wiring
├── <hero-image>.jpg / .webp    # Share image + hero visual
├── sitemap.xml                 # All canonical URLs
├── robots.txt                  # Allow all; Sitemap: line; Disallow /admin/ if CMS present
├── CNAME                       # Custom domain (one line)
├── .nojekyll                   # Tell Pages not to run Jekyll
├── README.md                   # Stack + maintenance notes
└── (optional blog subsystem — see §10)
```

**URL rules:**
- **Directory-style URLs** (`/service-name/`, served by `service-name/index.html`) — clean, no `.html`, no trailing date.
- **Slugs**: lowercase, hyphen-separated, descriptive, keyword-bearing.
- **One `<h1>` per page.** Subheads are `<h2>`/`<h3>`.
- **Canonical URL on every page**, absolute, with trailing slash for directories.
- When a URL is retired, leave a **redirect stub** (`<link rel=canonical>` + `<meta http-equiv=refresh>` + JS fallback) rather than a 404 (Pages is static, so this stands in for a 301).

---

## 5. Design System

### 5.1 Color — "primary + accent" via CSS custom properties
Define the palette once in `:root` and reference everywhere. Reizes example:

```css
:root {
  --primary-color:  #1a2b3c;  /* deep brand color — nav, headings, footer */
  --secondary-color:#c5a059;  /* accent — CTAs, links, highlights (here: gold) */
  --accent-silver:  #bdc3c7;
  --text-dark:      #2c3e50;
  --text-muted:     #576574;
  --bg-light:       #f8f9fa;
  --white:          #ffffff;
  --transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
```
Pick a **deep primary** (trust/authority) and a **warm or vivid accent** (action) appropriate to the
industry. Keep contrast AA-compliant.

### 5.2 Typography
- **Headings:** a display face (Reizes: *Playfair Display*, serif) for `h1,h2,h3,.logo`.
- **Body:** a clean sans (Reizes: *Montserrat*), `line-height: 1.7`.
- Load both in one Google Fonts `<link>` with `preconnect` + `display=swap`.

### 5.3 Layout & components (reused across pages)
- **Sticky top `<nav>`** with logo (left) + links (right); collapses to a **hamburger drawer** on mobile.
  - Includes an **"Expertise/Services" dropdown** listing the service folders.
  - Pinned `direction: ltr` so a browser "translate to Hebrew/Arabic" RTL pass can't break the menu
    (a real bug fixed on this site — keep this safeguard).
- **Page hero** with breadcrumb + `h1` + lead paragraph.
- **CTA strip** (repeated): heading + text + button to contact.
- **Footer**: brand blurb, link columns (Firm / Services / Contact), copyright, legal disclaimer line.
- **Floating quick-contact** buttons (call + email) and a **scroll-to-top** button.
- **Accessibility widget** (high-contrast, large-text, highlight-links toggles) — see §8.
- **`<noscript>` banner** with phone/email so the site is usable with JS disabled.

### 5.4 Responsive
Mobile-first, single breakpoint family; the nav drawer, grids (`.blog-grid`, service cards), and CTAs all
have mobile rules. Test on a phone — the owner often reviews on mobile.

---

## 6. SEO Specification (apply to *every* page)

This is the part that makes the site rank. Each page's `<head>` carries:

**Core meta**
- `<title>` — unique, keyword-front-loaded, ~60 chars, suffixed with the brand (`… | Business Name`).
- `<meta name="description">` — unique, ~155 chars, benefit + keyword.
- `<meta name="robots" content="index, follow">`.
- `<meta name="author">`, `theme-color`, `format-detection`.
- Geo meta (`geo.region`, `geo.placename`) for local/regional businesses.
- `<link rel="canonical" href="…absolute URL…">`.

**Social cards**
- **Open Graph**: `og:type` (`website` for pages, `article` for posts), `og:site_name`, `og:locale`,
  `og:url`, `og:title`, `og:description`, `og:image` (+ `og:image:alt`).
- **Twitter**: `summary_large_image` card with url/title/description/image.

**Structured data (JSON-LD)** — the highest-leverage SEO asset here:
- **Business schema on the homepage** — the right type from §2.4 (e.g. `LegalService`/`Attorney`,
  `Dentist`, `Restaurant`), including `name`, `alternateName`, `description`, `url`, `image`,
  `telephone`, `email`, `areaServed`, `knowsAbout`/services, `founder`/owner, `openingHoursSpecification`,
  `aggregateRating`, and `review[]`.
- **`FAQPage`** schema wherever there's an FAQ section.
- **`BreadcrumbList`** on every sub-page.
- **`BlogPosting`** + **`Blog`** schema on blog content (§10).
- Validate with Google's Rich Results Test before launch.

**Site-level**
- `sitemap.xml` listing every canonical URL with `lastmod`/`changefreq`/`priority`
  (homepage `1.0`, services `0.8`, legal/utility pages `0.3`).
- `robots.txt`: `Allow: /`, a `Sitemap:` line, and `Disallow: /admin/` if the CMS is present.
- Performance as SEO: `preconnect`/`preload` the hero image and fonts, `defer` all JS, prefer `.webp`.

**Internal linking:** every page links to relevant services and to the contact CTA; the blog links each
post to ≥1 service page to push topical authority toward commercial pages.

---

## 7. Contact Form (serverless)

- A standard `<form method="POST" action="https://api.web3forms.com/submit">` with a hidden
  `access_key` (one per site, from web3forms.com).
- Fields: name, email, phone, message, plus a honeypot for spam.
- `assets/shared.js` handles submit (async fetch), success/error UI, and validation.
- No backend, no PII stored in the repo — submissions email the business.
- Fire a GA4 event on successful submit.
- **Privacy policy page is required** when running analytics + a form (linked in the footer).

---

## 8. Accessibility (baseline, non-negotiable)

- `lang` on `<html>`; **skip-to-content** link; one `<h1>` per page; logical heading order.
- ARIA on nav, dropdown (`aria-haspopup`/`aria-expanded`), hamburger (`aria-controls`), breadcrumbs
  (`aria-current`), and the accessibility menu (`role="menuitemcheckbox"`).
- Decorative SVGs `aria-hidden`; meaningful images get `alt`.
- Visible focus states; keyboard-operable menus and toggles.
- **Accessibility widget** (high-contrast / large-text / highlight-links, persisted to `localStorage`).
- `<noscript>` fallback with contact info.
- Color contrast AA.

---

## 9. Analytics & Conversion Tracking

- GA4 via `gtag.js` in every page `<head>` (one property ID).
- `assets/analytics.js` wires **custom events**: phone-click, email-click, form-submit, and (blog) CTA
  clicks with `category`/`slug` parameters.
- The point is to see **which pages/posts drive contacts** and optimize from there.

---

## 10. Optional Subsystem — SEO Blog + Visual CMS + AI Drafting

Include this only when the business wants an ongoing content engine (most do, for SEO). It keeps the
public site 100% static while giving a non-technical owner a Word-like editor and an AI that drafts
articles on a schedule for human approval. Everything needed to build it is below and in **Appendix A**
(the real build script, CMS config, and CI workflow) — no other document is required.

### 10.1 Architecture
```
content/blog/{slug}.md      # SOURCE OF TRUTH: Markdown + YAML front-matter
admin/                      # Sveltia CMS static admin → /admin/  (config.yml + index.html)
templates/post.html         # Post skeleton with {{TOKEN}} placeholders
templates/index.html        # Blog-index skeleton
scripts/build_blog.js       # Reconciler: content/*.md → blog/**, index, posts.json, sitemap, redirects
blog/                       # GENERATED (git-ignored) — never hand-edit
.github/workflows/build-blog.yml   # On push: render Markdown → deploy whole site to Pages
```

### 10.2 Build engine (`scripts/build_blog.js`)
- Node ≥20; deps `gray-matter` (front-matter) + `marked` (Markdown→HTML). Run via `npm run build`.
- It's a **reconciler**, not append-only: on each run it treats non-draft `*.md` as truth and regenerates
  every derived surface (post pages, index, `posts.json`, sitemap), so add/edit/delete is one safe op.
- Skips any post with `draft: true` (publish gate at the build layer).
- Demotes body `<h1>`→`<h2>` to preserve one `<h1>` per page (the title).
- Emits **redirect stubs** for retired slugs listed in `content/blog/_redirects.json`.
- **Sitemap reconcile preserves all non-blog URLs** and rewrites only the `/blog/**` entries.

### 10.3 Content model (front-matter = the CMS fields)
```yaml
title:        # H1 + <title> base
slug:         # /blog/{slug}/ ; lowercase-hyphen, validated by regex
category:     # select from a fixed list (mirror in build script + admin config)
date:         # datePublished
updated:      # dateModified (bump on revision for freshness)
excerpt:      # index card + meta-description fallback
meta_title:   # SEO <title> (optional; auto-built if blank)
meta_description:  # SEO snippet (optional; falls back to excerpt)
primary_practice_area:  # internal-link target (a service URL)
og_image:     # optional social image (defaults to brand image)
draft:        # true = never rendered/indexed
ai_generated: # provenance flag
source_urls:  # for news-sourced drafts — verify before publish
body:         # Markdown (start headings at H2)
```
Every rendered post includes: `BlogPosting` + `BreadcrumbList` JSON-LD, OG `article` tags, canonical,
a byline ("Reviewed by <Owner>"), a per-category CTA, a "Related reading" block linking the service page +
same-category posts, and the global legal/medical/business disclaimer in the footer.

### 10.4 CMS (Sveltia)
- `admin/config.yml`: `backend: github`, `publish_mode: editorial_workflow` (Draft → In Review → Ready),
  a `blog` folder collection whose fields mirror §10.3 (with **dedicated SEO boxes**), and a media folder.
- Login: deploy the free [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) Cloudflare
  Worker + register a GitHub OAuth App; set `base_url`. (Pages CMS is a zero-infra alternative.)
- Nothing reaches `main`/live until the owner clicks **Publish** — a mandatory human gate.

### 10.5 AI drafting agent (planned phase)
- A scheduled GitHub Action runs a `draft_post` script: optionally scans recent news for a timely topic
  (opportunistic, never load-bearing), else pops the next item from an editorial queue
  (`content/blog/_topics.json`), prompts an LLM, and writes `content/blog/{slug}.md` with `draft: true`.
- **Guardrails:** word-count bounds; regex refusal of fabricated-looking citations; news claims only with
  a captured `source_urls`; output as structured JSON; opens a PR labeled `ai-draft` + `needs-review`.
- **Two gates** keep unreviewed content off the site: `draft: true` (build skips it) **and** the CMS
  editorial workflow. The agent **drafts; a human publishes** — never auto-publish, especially for YMYL
  (health, legal, finance) niches where Google's E-E-A-T scrutiny is highest.

### 10.6 Deployment
- GitHub Pages set to **Source: GitHub Actions**. `build-blog.yml` renders Markdown, strips dev-only files
  from the artifact, and deploys the static site. No generated HTML is committed.
- Fallback if avoiding Actions-based Pages: commit rendered `blog/**` back to `main`.

---

## 11. Build Checklist (per new site)

**Core site**
- [ ] Intake (§2) filled in; schema type chosen.
- [ ] `index.html`: hero, about, services overview, reviews, FAQ, contact section — full SEO `<head>` + business JSON-LD + FAQPage.
- [ ] One `/<service>/index.html` per service, each with its own SEO `<head>` + BreadcrumbList.
- [ ] `about`, `contact`, `privacy`, `404.html`.
- [ ] `assets/styles.css` (palette + type + components), `assets/shared.js`, `assets/analytics.js`.
- [ ] Logo (inline SVG), hero/share image (`.webp` + `.jpg`).
- [ ] `sitemap.xml`, `robots.txt`, `CNAME`, `.nojekyll`, `README.md`.
- [ ] GA4 ID wired on every page; Web3Forms key in the form.
- [ ] Nav (with services dropdown + LTR pin) and footer consistent on every page.
- [ ] Accessibility pass (§8); mobile pass; Rich Results Test on JSON-LD.

**Blog subsystem (if §2.15 = yes)**
- [ ] `package.json` + deps; `scripts/build_blog.js`; `templates/post.html` + `index.html`.
- [ ] `content/blog/` with 1–2 seed posts; fixed category list mirrored in script + `admin/config.yml`.
- [ ] `admin/` (Sveltia) + OAuth Worker + `robots.txt` `Disallow: /admin/`.
- [ ] `.github/workflows/build-blog.yml`; Pages Source = GitHub Actions.
- [ ] (Later) AI drafting workflow + `GEMINI_API_KEY`/`ANTHROPIC_API_KEY` secret + guardrails.

---

## 12. What's Deliberately Out of Scope (v1)

Comments, user accounts/auth, gated content, multi-author beyond owner + AI, tag pages (categories only),
RSS (easy later), translations (English-only; rely on the LTR-safe nav for browser translation),
e-commerce/booking backends. Add only when a business actually needs them.

---

*This document is self-contained: §1–§12 give the spec, and **Appendix A** below provides the complete,
parameterized reference files (HTML shell, design tokens, shared JS, contact form, build script, CMS
config, CI workflow). You should be able to build a full site from this file alone, without the original
source repo.*

---

# Appendix A — Reference Artifacts (copy-paste, then parameterize)

These are the **actual, working files** from the reference implementation, generalized with placeholder
tokens. Replace every `{{TOKEN}}` using the §2 Intake table, then adapt copy/design to the business.

### A.0 Placeholder tokens

| Token | Meaning | Reference value |
|---|---|---|
| `{{BUSINESS_NAME}}` | Legal/brand name | Reizes Law |
| `{{BRAND_NICKNAME}}` | Optional tagline/alternate name | The Fed Guy |
| `{{DOMAIN}}` | Bare domain (no scheme) | reizeslaw.com |
| `{{PRIMARY_HEX}}` | Deep brand color | `#1a2b3c` |
| `{{ACCENT_HEX}}` | Action/accent color | `#c5a059` |
| `{{HEADING_FONT}}` | Display font | Playfair Display |
| `{{BODY_FONT}}` | Body font | Montserrat |
| `{{GA4_ID}}` | Google Analytics 4 ID | `G-NYGP4NDRD2` |
| `{{PHONE_E164}}` | Phone for `tel:` links | `+17137669966` |
| `{{PHONE_DISPLAY}}` | Human phone | (713) 766-9966 |
| `{{EMAIL}}` | Intake email | Intake@reizeslaw.com |
| `{{SHARE_IMAGE}}` | OG/Twitter + hero image filename | `profile.jpg` |
| `{{WEB3FORMS_KEY}}` | Contact-form access key | (a UUID) |
| `{{GITHUB_REPO}}` | `owner/repo` for the CMS backend | `ereizeslaw/reizeslaw` |
| `{{OWNER_NAME}}` | Person for byline / author schema | Ely Reizes |
| `{{SERVICES}}` | The service folders + nav items | discipline, removals, … |

> The inline **logo SVG** below is the Reizes "gavel" mark — replace it with the business's own SVG (or a
> wordmark). It themes via the two hex colors.

### A.1 Shared `<head>` block (every page)

Each page is a complete HTML document. The `<head>` pattern — unique title/description/canonical per
page, then identical analytics + fonts + assets, then the page-appropriate JSON-LD:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PAGE_TITLE}} | {{BUSINESS_NAME}}</title>
    <meta name="description" content="{{PAGE_DESCRIPTION}}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="{{BUSINESS_NAME}}">
    <meta name="theme-color" content="{{PRIMARY_HEX}}">
    <meta name="format-detection" content="telephone=yes">
    <meta name="geo.region" content="US">                  <!-- adjust/remove for local biz -->
    <meta name="geo.placename" content="United States">
    <link rel="canonical" href="https://{{DOMAIN}}/{{PAGE_PATH}}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="image" href="/{{SHARE_IMAGE}}" fetchpriority="high"> <!-- hero page only -->

    <!-- Open Graph -->
    <meta property="og:type" content="website">            <!-- "article" on blog posts -->
    <meta property="og:site_name" content="{{BUSINESS_NAME}}">
    <meta property="og:locale" content="en_US">
    <meta property="og:url" content="https://{{DOMAIN}}/{{PAGE_PATH}}">
    <meta property="og:title" content="{{PAGE_TITLE}} | {{BUSINESS_NAME}}">
    <meta property="og:description" content="{{PAGE_DESCRIPTION}}">
    <meta property="og:image" content="https://{{DOMAIN}}/{{SHARE_IMAGE}}">
    <meta property="og:image:alt" content="{{IMAGE_ALT}}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://{{DOMAIN}}/{{PAGE_PATH}}">
    <meta property="twitter:title" content="{{PAGE_TITLE}} | {{BUSINESS_NAME}}">
    <meta property="twitter:description" content="{{PAGE_DESCRIPTION}}">
    <meta property="twitter:image" content="https://{{DOMAIN}}/{{SHARE_IMAGE}}">

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,..."> <!-- inline brand SVG -->
    <link href="https://fonts.googleapis.com/css2?family={{HEADING_FONT}}:wght@400;700&family={{BODY_FONT}}:wght@300;400;600&display=swap" rel="stylesheet">

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{GA4_ID}}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '{{GA4_ID}}');
    </script>
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="/assets/shared.js" defer></script>
    <script src="/assets/analytics.js" defer></script>

    <!-- JSON-LD: homepage → business schema (A.7); sub-pages → BreadcrumbList; FAQ pages → FAQPage -->
</head>
```

### A.2 Body shell — nav + footer + floating UI (shared by every page)

The chrome below is identical on every page (only the `current`/`aria-current` nav item and breadcrumb
change). The nav has a **services dropdown**, a **mobile hamburger drawer**, and is **pinned LTR** (A.4)
so a browser "translate to Hebrew/Arabic" pass can't right-align it off-screen.

```html
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <noscript>
    <div class="noscript-banner">
      This website works best with JavaScript enabled. You can still call us at
      <a href="tel:{{PHONE_E164}}">{{PHONE_DISPLAY}}</a> or email
      <a href="mailto:{{EMAIL}}">{{EMAIL}}</a>.
    </div>
  </noscript>

  <nav aria-label="Primary navigation">
    <a href="/" class="logo"><!-- inline brand SVG -->{{BUSINESS_NAME}}</a>
    <button type="button" class="hamburger" id="hamburger" aria-label="Toggle navigation menu"
            aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>
    <ul class="nav-links" id="navLinks">
      <li><a href="/#home">Home</a></li>
      <li><a href="/#about">About</a></li>
      <li class="has-dropdown">
        <a href="/#services" class="nav-dropdown-trigger" aria-haspopup="true" aria-expanded="false">
          Services
          <svg class="dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <ul class="dropdown-menu" role="menu">
          <!-- one <li><a href="/{{service}}/" role="menuitem">…</a></li> per service -->
        </ul>
      </li>
      <li><a href="/blog/">Blog</a></li>            <!-- only if blog subsystem present -->
      <li><a href="/#faq">FAQ</a></li>
      <li><a href="/#contact">Contact</a></li>
    </ul>
  </nav>
  <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>

  <main id="main-content">
    <!-- page content -->
  </main>

  <footer>
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="logo"><!-- inverted brand SVG -->{{BUSINESS_NAME}}</a>
        <p>{{BRAND_BLURB}}</p>
      </div>
      <div class="footer-links"><h4>Company</h4><ul><!-- home/about/services/blog/contact --></ul></div>
      <div class="footer-links"><h4>Contact</h4><ul>
        <li>{{PHONE_DISPLAY}}</li><li>{{EMAIL}}</li></ul></div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{YEAR}} {{BUSINESS_NAME}}. All Rights Reserved. | <a href="/privacy/">Privacy Policy</a></p>
      <!-- on blog posts, also include the industry disclaimer line here -->
    </div>
  </footer>

  <!-- Accessibility widget (high-contrast / large-text / highlight-links) -->
  <div class="accessibility-widget">
    <button type="button" class="acc-btn" id="accBtn" aria-label="Open accessibility menu"
            aria-expanded="false" aria-controls="accMenu"><!-- person icon SVG --></button>
    <div class="acc-menu" id="accMenu" role="menu" aria-label="Accessibility options">
      <h4>Accessibility Tools</h4>
      <div class="acc-option" role="menuitemcheckbox" tabindex="0" data-feature="high-contrast" aria-checked="false"><span>High Contrast</span><input type="checkbox" id="contrast-check" tabindex="-1" aria-hidden="true"></div>
      <div class="acc-option" role="menuitemcheckbox" tabindex="0" data-feature="large-text" aria-checked="false"><span>Large Text</span><input type="checkbox" id="text-check" tabindex="-1" aria-hidden="true"></div>
      <div class="acc-option" role="menuitemcheckbox" tabindex="0" data-feature="highlight-links" aria-checked="false"><span>Highlight Links</span><input type="checkbox" id="links-check" tabindex="-1" aria-hidden="true"></div>
      <button type="button" id="accReset">Reset All</button>
    </div>
  </div>

  <!-- Floating quick-contact (email + call) -->
  <div class="floating-contact" role="group" aria-label="Quick contact">
    <a href="/#contact" class="fc-btn fc-secondary" aria-label="Jump to contact form"><!-- mail icon --></a>
    <a href="tel:{{PHONE_E164}}" class="fc-btn fc-primary" aria-label="Call {{BUSINESS_NAME}}">
      <span class="fc-pulse" aria-hidden="true"></span><!-- phone icon --></a>
  </div>

  <button type="button" class="scroll-top" id="scrollTop" aria-label="Scroll back to top"><!-- up arrow --></button>
</body>
```

### A.3 Contact form (Web3Forms, serverless)

```html
<form class="contact-form" id="contactForm" action="https://api.web3forms.com/submit" method="POST"
      aria-label="Contact Inquiry Form">
  <input type="hidden" name="access_key" value="{{WEB3FORMS_KEY}}">
  <input type="hidden" name="from_name" value="{{BUSINESS_NAME}} Website">
  <input type="hidden" name="redirect" value="false">
  <!-- honeypot: hidden off-screen; bots fill it, humans don't -->
  <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off"
         style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" aria-hidden="true">
  <div class="row">
    <div class="form-group"><label for="full-name">Full Name</label>
      <input type="text" id="full-name" name="name" autocomplete="name" aria-required="true" required></div>
    <div class="form-group"><label for="email-address">Email Address</label>
      <input type="email" id="email-address" name="email" autocomplete="email" aria-required="true" required></div>
  </div>
  <div class="form-group"><label for="subject">Subject</label>
    <input type="text" id="subject" name="subject" aria-required="true" required></div>
  <div class="form-group"><label for="message">Message</label>
    <textarea id="message" name="message" aria-required="true" required></textarea></div>
  <button type="submit" class="submit-btn" id="submitBtn">Send Inquiry</button>
  <div id="formStatus" role="status" aria-live="polite"></div>
</form>
```
A small homepage-only handler intercepts submit, POSTs via `fetch`, and writes success/error text into
`#formStatus` (plus a GA4 event). Keep that handler in the homepage `<script>` (it is not in the shared JS).

### A.4 `assets/styles.css` — design tokens + critical rules

The full stylesheet is large; these are the parts that define the system and must be reproduced. Build the
rest of the components (buttons, cards, hero, grids, footer, accessibility states) to match the brand.

```css
:root {
  --primary-color:  {{PRIMARY_HEX}};   /* nav, headings, footer */
  --secondary-color:{{ACCENT_HEX}};    /* CTAs, links, highlights */
  --accent-silver:  #bdc3c7;
  --text-dark:      #2c3e50;
  --text-muted:     #576574;
  --bg-light:       #f8f9fa;
  --white:          #ffffff;
  --transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior: smooth; }
body { font-family: '{{BODY_FONT}}', sans-serif; line-height: 1.7; color: var(--text-dark);
       background: var(--white); overflow-x: hidden; }
h1, h2, h3, .logo { font-family: '{{HEADING_FONT}}', serif; font-weight: 700; }

/* Sticky nav — PINNED LTR so a forced RTL (browser "Translate to Hebrew") can't break the menu. */
nav { background: rgba(255,255,255,0.98); padding: 1.5rem 10%; display:flex;
      justify-content:space-between; align-items:center; box-shadow:0 4px 20px rgba(0,0,0,0.03);
      position:sticky; top:0; z-index:1000; direction: ltr; }
.nav-links, .nav-links .dropdown-menu { direction: ltr; text-align: left; }
/* Accessibility-widget states toggled by shared.js: */
body.high-contrast { /* ... */ }  body.large-text { /* ... */ }  body.highlight-links a { /* ... */ }
```
Other required classes (build to taste): `.skip-link`, `.noscript-banner`, `.hamburger`, `.nav-backdrop`,
`.has-dropdown`/`.dropdown-menu` (CSS hover on desktop, `.open` on mobile), `.page-hero`, `.breadcrumb`,
`.lead`, `.cta-strip`/`.cta-button`, `.floating-contact`/`.fc-btn`, `.scroll-top.visible`,
`.accessibility-widget`/`.acc-menu.active`, and — if blogging — `.blog-grid`/`.blog-card`, `.post-byline`,
`.legal-disclaimer`, `.blog-empty`, `.info-callout.related-reading`.

### A.5 `assets/shared.js` (complete — already business-agnostic)

Drives the accessibility widget (with outside-click + Escape close), scroll-to-top button, mobile
hamburger drawer, and the Services dropdown (CSS hover on desktop ≥1100px; tap-to-toggle on mobile).
Reproduce as-is:

```js
(function () {
  'use strict';

  // ---- Accessibility widget ----
  var accBtn = document.getElementById('accBtn');
  var accMenu = document.getElementById('accMenu');
  function setAccExpanded(open) {
    if (!accBtn || !accMenu) return;
    accBtn.setAttribute('aria-expanded', String(open));
    accMenu.classList.toggle('active', open);
  }
  if (accBtn && accMenu) {
    accBtn.addEventListener('click', function () {
      setAccExpanded(!accMenu.classList.contains('active'));
    });
  }
  function toggleFeature(className, sourceEl) {
    var active = document.body.classList.toggle(className);
    var checkMap = { 'high-contrast':'contrast-check', 'large-text':'text-check', 'highlight-links':'links-check' };
    var cb = document.getElementById(checkMap[className]);
    if (cb) cb.checked = active;
    if (sourceEl) sourceEl.setAttribute('aria-checked', String(active));
  }
  document.querySelectorAll('.acc-option[data-feature]').forEach(function (el) {
    el.addEventListener('click', function () { toggleFeature(el.dataset.feature, el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFeature(el.dataset.feature, el); }
    });
  });
  var accReset = document.getElementById('accReset');
  if (accReset) accReset.addEventListener('click', function () {
    document.body.classList.remove('high-contrast','large-text','highlight-links');
    ['contrast-check','text-check','links-check'].forEach(function (id) { var cb=document.getElementById(id); if (cb) cb.checked=false; });
    document.querySelectorAll('.acc-option[data-feature]').forEach(function (el) { el.setAttribute('aria-checked','false'); });
  });
  document.addEventListener('click', function (event) {
    if (accMenu && !event.target.closest('.accessibility-widget') && accMenu.classList.contains('active')) setAccExpanded(false);
  });

  // ---- Scroll-to-top ----
  var scrollTopBtn = document.getElementById('scrollTop');
  function onScroll() { if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400); }
  if (scrollTopBtn) {
    window.addEventListener('scroll', onScroll, { passive: true });
    scrollTopBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    onScroll();
  }

  // ---- Mobile hamburger + Services dropdown ----
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var navBackdrop = document.getElementById('navBackdrop');
  function closeMobileNav() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('open'); navLinks.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('active');
    hamburger.setAttribute('aria-expanded','false');
  }
  function toggleMobileNav() {
    if (!hamburger || !navLinks) return;
    var isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    if (navBackdrop) navBackdrop.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }
  var MOBILE_BREAKPOINT = 1100;
  function isMobileNav() { return window.matchMedia('(max-width: ' + MOBILE_BREAKPOINT + 'px)').matches; }
  function closeAllDropdowns() {
    document.querySelectorAll('.has-dropdown.open').forEach(function (li) {
      li.classList.remove('open');
      var trig = li.querySelector('.nav-dropdown-trigger'); if (trig) trig.setAttribute('aria-expanded','false');
    });
  }
  document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      if (isMobileNav()) {
        e.preventDefault();
        var li = trigger.closest('.has-dropdown'); if (!li) return;
        var wasOpen = li.classList.contains('open');
        document.querySelectorAll('.has-dropdown.open').forEach(function (o) {
          if (o !== li) { o.classList.remove('open'); var t=o.querySelector('.nav-dropdown-trigger'); if (t) t.setAttribute('aria-expanded','false'); }
        });
        li.classList.toggle('open', !wasOpen);
        trigger.setAttribute('aria-expanded', String(!wasOpen));
      }
    });
  });
  document.querySelectorAll('.dropdown-menu a').forEach(function (a) { a.addEventListener('click', closeAllDropdowns); });
  document.addEventListener('click', function (event) {
    if (!isMobileNav() && !event.target.closest('.has-dropdown')) closeAllDropdowns();
  });
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', toggleMobileNav);
    if (navBackdrop) navBackdrop.addEventListener('click', closeMobileNav);
    navLinks.querySelectorAll('a').forEach(function (a) {
      if (a.classList.contains('nav-dropdown-trigger') && isMobileNav()) return;
      a.addEventListener('click', function () { closeAllDropdowns(); closeMobileNav(); });
    });
  }
  window.addEventListener('resize', closeAllDropdowns);

  // ---- Global Escape ----
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (accMenu && accMenu.classList.contains('active')) { setAccExpanded(false); if (accBtn) accBtn.focus(); }
    if (document.querySelector('.has-dropdown.open')) closeAllDropdowns();
    if (navLinks && navLinks.classList.contains('open')) closeMobileNav();
  });
})();
```
`assets/analytics.js` is a small companion that attaches GA4 `gtag` events to `tel:`/`mailto:` links, the
form submit, and (on blog) `[data-blog-cta]` clicks.

### A.6 Site-level files

**`CNAME`** — one line:
```
{{DOMAIN}}
```
**`.nojekyll`** — empty file (stops Pages from running Jekyll).

**`robots.txt`**:
```
User-agent: *
Allow: /
Disallow: /admin/          # only if the CMS subsystem is present
Sitemap: https://{{DOMAIN}}/sitemap.xml
```
**`sitemap.xml`** — one `<url>` per canonical page (homepage `1.0`, services `0.8`, utility `0.3`, blog
posts `0.7`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://{{DOMAIN}}/</loc>
      <lastmod>{{DATE}}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority>
   </url>
   <!-- one block per /service/ at priority 0.8; blog posts are reconciled in by build_blog.js -->
</urlset>
```
**`package.json`** (only if blogging):
```json
{
  "name": "{{SITE}}-blog-tooling",
  "private": true,
  "type": "module",
  "scripts": { "build": "node scripts/build_blog.js" },
  "engines": { "node": ">=20" },
  "dependencies": { "gray-matter": "^4.0.3", "marked": "^12.0.0" }
}
```

### A.7 JSON-LD blocks

**Homepage business schema** — pick the right `@type` (§2.4) and fill the slots:
```json
{
  "@context": "https://schema.org",
  "@type": ["LegalService", "Attorney"],
  "name": "{{BUSINESS_NAME}}",
  "alternateName": "{{BRAND_NICKNAME}}",
  "description": "…",
  "url": "https://{{DOMAIN}}/",
  "image": "https://{{DOMAIN}}/{{SHARE_IMAGE}}",
  "telephone": ["{{PHONE_E164}}"],
  "email": "{{EMAIL}}",
  "areaServed": [ { "@type": "Country", "name": "United States" } ],
  "knowsAbout": [ "…service keywords…" ],
  "founder": { "@type": "Person", "name": "{{OWNER_NAME}}", "jobTitle": "…" },
  "openingHoursSpecification": { "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5", "reviewCount": "3" },
  "review": [ { "@type": "Review", "reviewRating": {"@type":"Rating","ratingValue":"5","bestRating":"5"},
                "author": {"@type":"Person","name":"…"}, "reviewBody": "…" } ]
}
```
**Sub-page `BreadcrumbList`** (Home → Section → Page) and, on FAQ sections, a **`FAQPage`** with
`mainEntity[]` of `Question`/`acceptedAnswer`. Blog post/index JSON-LD is emitted by the build script (A.8).

### A.8 `scripts/build_blog.js` (complete blog engine — only if blogging)

Reconciler: reads `content/blog/*.md`, renders non-draft posts to `blog/{slug}/index.html` via
`templates/post.html`, rebuilds the index + `posts.json`, reconciles `sitemap.xml` (preserving non-blog
URLs), and emits redirect stubs from `content/blog/_redirects.json`. Generalize the `CATEGORIES` /
`CATEGORY_META` maps to the business's blog categories + service URLs.

```js
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://{{DOMAIN}}';

const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const BLOG_OUT = path.join(ROOT, 'blog');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

// Blog categories — must match admin/config.yml select options.
const CATEGORIES = [ /* e.g. 'News', 'Guides', … */ ];
// Per-category CTA copy + the service page each category links to.
const CATEGORY_META = {
  // 'Guides': { area: '/service-a/', areaLabel: 'Service A', cta: 'Need help with X?' },
};
const DEFAULT_CTA_TEXT = 'Call {{PHONE_DISPLAY}} or use our contact form for a free consultation.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/{{SHARE_IMAGE}}`;

function escapeHtml(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function jsonInner(s){return JSON.stringify(String(s??'')).slice(1,-1);}
function fillTokens(t,tok){let o=t;for(const[k,v]of Object.entries(tok))o=o.split(`{{${k}}}`).join(v??'');return o;}
function toISODate(v){if(!v)return'';if(v instanceof Date)return v.toISOString().slice(0,10);return String(v).slice(0,10);}
function formatHuman(iso){const d=new Date(`${iso}T00:00:00Z`);return Number.isNaN(d.getTime())?iso:d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});}
function rmrf(dir){fs.rmSync(dir,{recursive:true,force:true});}

function loadPosts(){
  if(!fs.existsSync(CONTENT_DIR))return[];
  const files=fs.readdirSync(CONTENT_DIR).filter(f=>f.endsWith('.md')&&!f.startsWith('_'));
  const posts=[];
  for(const file of files){
    const{data,content}=matter(fs.readFileSync(path.join(CONTENT_DIR,file),'utf8'));
    const slug=(data.slug||path.basename(file,'.md')).trim();
    if(data.draft===true){console.log(`  · skipping draft: ${slug}`);continue;}
    if(!data.title){console.warn(`  ! ${file}: missing title — skipped`);continue;}
    let category=(data.category||'').trim();
    if(!CATEGORIES.includes(category)){console.warn(`  ! ${file}: unknown category "${category}"`);category=CATEGORIES[CATEGORIES.length-1];}
    const date=toISODate(data.date);
    const updated=data.updated?toISODate(data.updated):date;
    posts.push({slug,title:String(data.title),category,date,updated,
      excerpt:String(data.excerpt||''),
      metaTitle:String(data.meta_title||`${data.title} | {{BUSINESS_NAME}}`),
      metaDescription:String(data.meta_description||data.excerpt||''),
      primaryArea:String(data.primary_practice_area||CATEGORY_META[category].area),
      ogImage:String(data.og_image||DEFAULT_OG_IMAGE),
      bodyMd:content});
  }
  posts.sort((a,b)=>(a.date<b.date?1:a.date>b.date?-1:a.title.localeCompare(b.title)));
  return posts;
}

function renderBody(md){
  let html=marked.parse(md,{gfm:true,breaks:false});
  html=html.replace(/<(\/?)h1(\s|>)/g,'<$1h2$2'); // keep one <h1> per page (the title)
  return html.trim();
}
function relatedLinksBlock(post,all){
  const meta=CATEGORY_META[post.category];
  const related=all.filter(p=>p.slug!==post.slug&&p.category===post.category).slice(0,3);
  let items=`<li><a href="${meta.area}">${escapeHtml(meta.areaLabel)}</a> — our service overview</li>`;
  for(const r of related)items+=`\n<li><a href="/blog/${r.slug}/">${escapeHtml(r.title)}</a></li>`;
  return `<div class="info-callout related-reading"><h4>Related reading</h4><ul>${items}</ul></div>`;
}
function renderPost(post,all,template){
  const canonical=`${SITE_URL}/blog/${post.slug}/`;
  const meta=CATEGORY_META[post.category];
  const tokens={
    META_TITLE:escapeHtml(post.metaTitle), META_DESCRIPTION:escapeHtml(post.metaDescription),
    META_DESCRIPTION_ESCAPED:jsonInner(post.metaDescription), CANONICAL_URL:canonical,
    OG_TITLE:escapeHtml(post.metaTitle), OG_IMAGE:escapeHtml(post.ogImage),
    TITLE:escapeHtml(post.title), TITLE_ESCAPED:jsonInner(post.title),
    CATEGORY:escapeHtml(post.category), SLUG:escapeHtml(post.slug),
    DATE_ISO:post.date, UPDATED_ISO:post.updated, DATE_HUMAN:escapeHtml(formatHuman(post.date)),
    EXCERPT:escapeHtml(post.excerpt), BODY_HTML:renderBody(post.bodyMd),
    RELATED_LINKS:relatedLinksBlock(post,all),
    CTA_HEADING:escapeHtml(meta.cta), CTA_TEXT:escapeHtml(DEFAULT_CTA_TEXT),
  };
  const outDir=path.join(BLOG_OUT,post.slug);
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'index.html'),fillTokens(template,tokens),'utf8');
}
function renderCard(p){
  return `<article class="blog-card"><a href="/blog/${p.slug}/" class="blog-card-link">
    <span class="blog-card-cat">${escapeHtml(p.category)}</span>
    <h2 class="blog-card-title">${escapeHtml(p.title)}</h2>
    <p class="blog-card-excerpt">${escapeHtml(p.excerpt)}</p>
    <span class="blog-card-meta"><time datetime="${p.date}">${escapeHtml(formatHuman(p.date))}</time></span>
    <span class="learn-more">Read article &rarr;</span></a></article>`;
}
function blogJsonLd(posts){
  const blogPost=posts.map((p,i)=>({'@type':'ListItem',position:i+1,url:`${SITE_URL}/blog/${p.slug}/`,name:p.title}));
  const obj={'@context':'https://schema.org','@type':'Blog',name:'{{BUSINESS_NAME}} Blog',
    url:`${SITE_URL}/blog/`,inLanguage:'en-US',
    publisher:{'@type':'Organization',name:'{{BUSINESS_NAME}}',url:`${SITE_URL}/`},
    ...(blogPost.length?{blogPost}:{})};
  return `<script type="application/ld+json">\n${JSON.stringify(obj,null,4)}\n</script>`;
}
function renderIndex(posts,template){
  const cards=posts.length===0
    ? `<div class="blog-empty"><h2>New articles coming soon</h2><p>Check back soon.</p></div>`
    : `<div class="blog-grid">\n${posts.map(renderCard).join('\n')}\n</div>`;
  fs.mkdirSync(BLOG_OUT,{recursive:true});
  fs.writeFileSync(path.join(BLOG_OUT,'index.html'),fillTokens(template,{CARDS:cards,BLOG_JSONLD:blogJsonLd(posts)}),'utf8');
}
function writePostsManifest(posts){
  const m=posts.map(p=>({slug:p.slug,title:p.title,category:p.category,date:p.date,updated:p.updated,excerpt:p.excerpt,url:`/blog/${p.slug}/`}));
  fs.writeFileSync(path.join(BLOG_OUT,'posts.json'),JSON.stringify(m,null,2),'utf8');
}
function reconcileSitemap(posts){
  if(!fs.existsSync(SITEMAP_PATH)){console.warn('  ! sitemap.xml not found');return;}
  const xml=fs.readFileSync(SITEMAP_PATH,'utf8');
  const blocks=xml.match(/<url>[\s\S]*?<\/url>/g)||[];
  const preserved=blocks.filter(b=>!/\/blog\//.test(b)&&!/<loc>https:\/\/[^<]*\/blog\/<\/loc>/.test(b));
  const indent='   ';
  const blogBlocks=[`${indent}<url>\n${indent}   <loc>${SITE_URL}/blog/</loc>\n${indent}   <changefreq>weekly</changefreq>\n${indent}   <priority>0.6</priority>\n${indent}</url>`];
  for(const p of posts)blogBlocks.push(`${indent}<url>\n${indent}   <loc>${SITE_URL}/blog/${p.slug}/</loc>\n${indent}   <lastmod>${p.updated||p.date}</lastmod>\n${indent}   <changefreq>monthly</changefreq>\n${indent}   <priority>0.7</priority>\n${indent}</url>`);
  const body=[...preserved.map(b=>indent+b.trim()),...blogBlocks].join('\n');
  fs.writeFileSync(SITEMAP_PATH,`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,'utf8');
}
function redirectStub(target){
  const url=target.startsWith('http')?target:`${SITE_URL}${target}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Redirecting...</title>
<link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${url}">
<script>window.location.href="${url}";</script></head><body><p>Redirecting to <a href="${url}">our blog</a>…</p></body></html>`;
}
function emitRedirects(livingSlugs){
  const file=path.join(CONTENT_DIR,'_redirects.json');
  if(!fs.existsSync(file))return 0;
  let entries;try{entries=JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){console.warn(`  ! _redirects.json invalid: ${e.message}`);return 0;}
  let count=0;
  for(const entry of entries){
    const from=(entry.from||'').trim();const to=entry.to||'/blog/';
    if(!from)continue;
    if(livingSlugs.has(from)){console.warn(`  ! redirect "${from}" collides with a live post`);continue;}
    const outDir=path.join(BLOG_OUT,from);fs.mkdirSync(outDir,{recursive:true});
    fs.writeFileSync(path.join(outDir,'index.html'),redirectStub(to),'utf8');count++;
  }
  return count;
}
function main(){
  console.log('Building blog…');
  const postTpl=fs.readFileSync(path.join(TEMPLATES_DIR,'post.html'),'utf8');
  const indexTpl=fs.readFileSync(path.join(TEMPLATES_DIR,'index.html'),'utf8');
  const posts=loadPosts();
  rmrf(BLOG_OUT);fs.mkdirSync(BLOG_OUT,{recursive:true});
  for(const post of posts)renderPost(post,posts,postTpl);
  renderIndex(posts,indexTpl);
  writePostsManifest(posts);
  reconcileSitemap(posts);
  const redirects=emitRedirects(new Set(posts.map(p=>p.slug)));
  console.log(`Done: ${posts.length} post(s), ${redirects} redirect stub(s).`);
}
main();
```

**`templates/post.html` token contract** (the placeholders the script fills): `{{META_TITLE}}`,
`{{META_DESCRIPTION}}`, `{{META_DESCRIPTION_ESCAPED}}`, `{{CANONICAL_URL}}`, `{{OG_TITLE}}`, `{{OG_IMAGE}}`,
`{{TITLE}}`, `{{TITLE_ESCAPED}}`, `{{CATEGORY}}`, `{{SLUG}}`, `{{DATE_ISO}}`, `{{UPDATED_ISO}}`,
`{{DATE_HUMAN}}`, `{{EXCERPT}}`, `{{BODY_HTML}}`, `{{RELATED_LINKS}}`, `{{CTA_HEADING}}`, `{{CTA_TEXT}}`.
The post template is the A.2 shell plus a `page-hero` (breadcrumb + `h1` {{TITLE}} + byline + {{EXCERPT}}),
an `<article class="page-content">{{BODY_HTML}}{{RELATED_LINKS}}</article>`, a `cta-strip`, and **two
JSON-LD blocks**: `BlogPosting` (headline/description/datePublished/dateModified/author/publisher/
mainEntityOfPage) and `BreadcrumbList`. The index template is the shell plus `{{CARDS}}` and `{{BLOG_JSONLD}}`.

### A.9 `admin/config.yml` (Sveltia CMS — only if blogging)

```yaml
backend:
  name: github
  repo: {{GITHUB_REPO}}          # owner/repo
  branch: main
  base_url: https://{{your-sveltia-cms-auth-worker}}.workers.dev   # OAuth relay
publish_mode: editorial_workflow  # Draft → In review → Ready (the human gate)
site_url: https://{{DOMAIN}}
display_url: https://{{DOMAIN}}
media_folder: "assets/blog"
public_folder: "/assets/blog"
collections:
  - name: blog
    label: "Blog Posts"
    folder: "content/blog"
    create: true
    slug: "{{fields.slug}}"      # file = content/blog/{slug}.md
    extension: md
    format: frontmatter
    fields:
      - { name: title, label: "Title", widget: string }
      - { name: slug, label: "Slug (URL)", widget: string,
          pattern: ['^[a-z0-9]+(?:-[a-z0-9]+)*$', "lowercase, numbers, hyphens only"] }
      - { name: category, label: "Category", widget: select, options: [ /* match CATEGORIES */ ] }
      - { name: date, label: "Publish date", widget: datetime, date_format: "YYYY-MM-DD", time_format: false, picker_utc: true }
      - { name: updated, label: "Last updated", widget: datetime, required: false, date_format: "YYYY-MM-DD", time_format: false, picker_utc: true }
      - { name: excerpt, label: "Excerpt", widget: text }
      - { name: meta_title, label: "SEO title", widget: string, required: false }
      - { name: meta_description, label: "SEO meta description", widget: text, required: false }
      - { name: primary_practice_area, label: "Primary service (internal link)", widget: select, options: [ /* service URLs */ ] }
      - { name: og_image, label: "Social share image", widget: image, required: false }
      - { name: draft, label: "Keep hidden", widget: boolean, default: false, required: false }
      - { name: ai_generated, label: "AI-assisted draft", widget: boolean, default: false, required: false }
      - { name: source_urls, label: "Source URLs", widget: list, required: false, field: { name: url, label: URL, widget: string } }
      - { name: body, label: "Article body", widget: markdown }
```
`admin/index.html` is a few lines loading the Sveltia bundle. Login needs a free
[`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker + a GitHub OAuth App.

### A.10 `.github/workflows/build-blog.yml` (render + deploy — only if blogging)

Requires **Settings → Pages → Source: GitHub Actions**. Renders Markdown, strips dev-only files from the
artifact, deploys the static site. No generated HTML is committed.

```yaml
name: Build & Deploy Site
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deploy.outputs.page_url }}" }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build      # scripts/build_blog.js
      - name: Strip dev-only files from the artifact
        run: |
          rm -rf node_modules scripts templates content .github .git
          rm -f package.json package-lock.json .gitignore CNAME.hold *.md
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: . }
      - id: deploy
        uses: actions/deploy-pages@v4
```
*(Lower-tech alternative: skip Actions-based Pages and instead commit the rendered `blog/**` back to
`main`, serving from the branch. The public site is static either way.)*

### A.11 AI drafting agent (planned phase — only if blogging)

A second scheduled workflow (`draft-blog-post.yml`, `cron` weekly + `workflow_dispatch`) runs a
`scripts/draft_post.js`: optionally scan recent news for a timely, **source-backed** topic (opportunistic,
never load-bearing), else pop the next item from an editorial queue (`content/blog/_topics.json`); prompt
an LLM (model behind one swappable function — Gemini free tier, or Claude/OpenAI); write
`content/blog/{slug}.md` with `draft: true` + `ai_generated: true`; open a PR labeled `ai-draft` +
`needs-review`. **Guardrails:** word-count bounds, regex refusal of fabricated-looking citations, news
claims only with captured `source_urls`, structured-JSON output. **Two gates** keep unreviewed content
off the live site — `draft: true` (the build skips it) **and** the CMS editorial workflow — so the agent
*drafts* and a human *publishes*. This matters most for YMYL niches (health, legal, finance), where Google's
E-E-A-T scrutiny of unreviewed AI content is highest.
