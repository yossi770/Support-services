# Build Progress — Houston Home Tech Help

Live status of the website build. Updated as work proceeds.
**Legend:** ✅ done · 🚧 in progress · ⬜ not started

_Last updated: 2026-07-07 — **BUILD COMPLETE.** All pages, SEO, and blog subsystem done & verified. Remaining work is swapping the launch placeholders below (real phone/email/keys/images/reviews)._

## Locked decisions
- **Brand:** Houston Home Tech Help · **Domain:** houstonhometechhelp.com
- **Owner:** Yosef (software-systems builder → "makes tech work smoothly for you")
- **Contact/keys:** placeholders (phone, email, GA4, Web3Forms) — swap before launch
- **Blog subsystem:** included
- **Hosting:** Cloudflare Pages (code on GitHub)
- **Design:** friendly/high-legibility — deep blue + warm amber, Poppins + Inter

## Services (5 pages / nav dropdown)
1. Device Setup & Optimization → `/device-setup/`
2. Home Network & Wi‑Fi → `/home-network-wifi/`
3. Tech Lessons & Training → `/tech-lessons/`
4. Accessibility & Easy‑to‑Use Setup → `/accessibility-setup/`
5. Remote Support & Troubleshooting → `/remote-support/`

---

## Core site
| Status | Item | Notes |
|---|---|---|
| ✅ | `assets/styles.css` | Full design system |
| ✅ | `assets/shared.js` | Nav, a11y widget (persisted), scroll-top, FAQ |
| ✅ | `assets/analytics.js` | GA4 event wiring |
| ✅ | `index.html` | Homepage: hero, services, about, process, testimonials, areas, FAQ, contact |
| ✅ | `device-setup/index.html` | Service page + Service/Breadcrumb schema |
| ✅ | `home-network-wifi/index.html` | Service page + schema |
| ✅ | `tech-lessons/index.html` | Service page + schema |
| ✅ | `accessibility-setup/index.html` | Service page + schema |
| ✅ | `remote-support/index.html` | Service page + schema |
| ✅ | `about/index.html` | Yosef bio / trust + AboutPage schema |
| ✅ | `contact/index.html` | Dedicated contact page + working form |
| ✅ | `privacy/index.html` | Privacy policy |
| ✅ | `404.html` | Branded not-found |

## SEO / site-level files
| Status | Item | Notes |
|---|---|---|
| ✅ | JSON-LD business schema (homepage) | LocalBusiness + areaServed from goal.md |
| ✅ | FAQPage + BreadcrumbList schema | FAQPage on home; breadcrumbs on all subpages |
| ✅ | `sitemap.xml` | All canonical URLs + blog (reconciled by build) |
| ✅ | `robots.txt` | Allow all + sitemap + Disallow /admin/ |
| ✅ | `assets/favicon.svg` / inline icon | Inline data-URI brand mark on every page |
| ⬜ | `assets/og-image` placeholder | Referenced everywhere; real PNG still needed |

## Blog subsystem (optional — included)
| Status | Item | Notes |
|---|---|---|
| ✅ | `package.json` | gray-matter + marked |
| ✅ | `scripts/build_blog.js` | Markdown → static reconciler |
| ✅ | `templates/post.html` | Post skeleton |
| ✅ | `templates/index.html` | Blog index skeleton |
| ✅ | `content/blog/*.md` | 2 seed posts + `_redirects.json` |
| ✅ | `admin/config.yml` + `admin/index.html` | Sveltia CMS |
| ✅ | `.gitignore` | Ignore blog/ output + node_modules |

## Wrap-up
| Status | Item | Notes |
|---|---|---|
| ✅ | `README.md` | Stack + "Before you launch" checklist |
| ✅ | Run blog build locally | `npm run build` → 2 posts, 0 unfilled tokens |
| ✅ | Final review pass | 24 JSON-LD blocks parse; 0 real broken links |

---

## Before-launch placeholders to replace
- [x] Phone: `(713) 955-7217` / `+17139557217`
- [x] Email: `yosef@houstonhometechhelp.com` (mailbox to be created on server)
- [x] GA4 Measurement ID: `G-WLE58LCE62`
- [x] Web3Forms access key: `7df359d7-e591-46a3-9c1c-9e879f7ea4e4`
- [x] Owner photo wired in (`assets/yosef.png`, About + homepage)
- [x] Social share card created (`assets/og-image.png`, 1200×630, branded with photo)
- [x] Replaced sample testimonials with 3 real client reviews (Sarah M., David L., Miriam K.) + matching Review/AggregateRating JSON-LD on homepage
- [x] Business hours: Sun–Fri 9am–6pm, closed Saturday (footers, contact page, schema)
