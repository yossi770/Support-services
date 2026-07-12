# Houston Home Tech Help

Marketing website for **Houston Home Tech Help** — patient, friendly in-home & remote tech support in the greater Houston area (owner: Yosef).

Built as a **framework-free static site** (hand-written HTML5 + CSS3 + vanilla ES6) per `WEBSITE_BLUEPRINT.md`, with an optional Markdown-powered blog. Hosted on **Cloudflare Pages** (code on GitHub).

## Structure

```
index.html                  Homepage (hero, services, about, process, testimonials, areas, FAQ, contact)
device-setup/               Service page  → /device-setup/
home-network-wifi/          Service page  → /home-network-wifi/
tech-lessons/               Service page  → /tech-lessons/
accessibility-setup/        Service page  → /accessibility-setup/
remote-support/             Service page  → /remote-support/
about/  contact/  privacy/  Supporting pages
404.html                    Branded not-found page
assets/
  styles.css                Design system (single source of truth)
  shared.js                 Nav, dropdown, a11y widget, scroll-top, FAQ
  analytics.js              GA4 event wiring
sitemap.xml  robots.txt     SEO
—— optional blog subsystem ——
content/blog/*.md           SOURCE OF TRUTH for posts (Markdown + front-matter)
templates/                  post.html + index.html skeletons ({{TOKENS}})
scripts/build_blog.js       Reconciler: content/*.md → blog/**, index, posts.json, sitemap
admin/                      Sveltia CMS (visual editor) → /admin/
blog/                       GENERATED — git-ignored, never hand-edit
```

## Local development

The **core site has no build step** — open `index.html` or serve the folder:

```bash
python -m http.server 8000      # then visit http://localhost:8000
```

The **blog** needs Node ≥ 20:

```bash
npm install
npm run build                   # renders content/blog/*.md → blog/**
```

`build_blog.js` is a reconciler: it treats non-draft `content/blog/*.md` as the source of truth and regenerates all blog pages, the index, `posts.json`, and the `/blog/**` entries in `sitemap.xml` (preserving the non-blog URLs). Posts with `draft: true` are skipped. Add/edit/delete a `.md` file and re-run — safe every time.

## Deployment (Cloudflare Pages)

Connect the GitHub repo to a Cloudflare Pages project:

- **Build command:** `npm run build`
- **Build output directory:** `/` (repo root)
- **Custom domain:** configure `houstonhometechhelp.com` in the Cloudflare dashboard.

The public site is 100% static either way. (No `CNAME`/`.nojekyll` — those are GitHub Pages artifacts and are not used here.)

## ⚠️ Before you launch — replace these placeholders

Search-and-replace across the repo:

| Placeholder | Replace with | Where |
|---|---|---|
| `+17135550100` / `(713) 555-0100` | Real phone number | every page (`tel:` links, schema, footer) |
| `hello@houstonhometechhelp.com` | Real inbox | every page + schema |
| `G-XXXXXXXXXX` | GA4 Measurement ID | `<head>` of every page + templates |
| `YOUR-WEB3FORMS-ACCESS-KEY` | [web3forms.com](https://web3forms.com) access key | `index.html`, `contact/index.html` |
| Business hours (Mon–Fri 9–6, Sat 10–4) | Real hours | homepage schema, contact page, footers |

Also:

- **Add real images.** Drop in `assets/og-image.png` (1200×630 social share card) and a photo of Yosef at `assets/yosef.jpg`, then wire the photo into the About section / homepage portrait (currently a friendly placeholder). Until `og-image.png` exists, link previews will have no image.
- **Replace the sample testimonials** on the homepage with real client reviews. They are clearly marked as samples. Once you have genuine reviews, you can also add `aggregateRating` + `review` to the homepage `LocalBusiness` JSON-LD — this was intentionally left out because fabricated review markup violates Google's guidelines.
- **CMS setup (optional).** To use the visual editor at `/admin/`, edit `admin/config.yml` (`repo` + `base_url`), deploy the free [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker, and register a GitHub OAuth App.
- **Validate** the JSON-LD with Google's [Rich Results Test](https://search.google.com/test/rich-results) once the domain is live.

## Notes

- `PROGRESS.md` tracks build status. `goal.md` + `WEBSITE_BLUEPRINT.md` are the source brief and spec. `CLAUDE.md` orients future work.
- The navigation is intentionally pinned `direction: ltr` so a browser "translate to Hebrew/Arabic" pass can't break the menu — keep that safeguard.
