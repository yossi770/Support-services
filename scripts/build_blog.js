#!/usr/bin/env node
/* =========================================================================
   Houston Home Tech Help — blog build (reconciler)
   Reads content/blog/*.md, renders non-draft posts to blog/{slug}/index.html,
   rebuilds the index + posts.json, reconciles sitemap.xml (preserving non-blog
   URLs), and emits redirect stubs from content/blog/_redirects.json.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://houstonhometechhelp.com';
const BUSINESS_NAME = 'Houston Home Tech Help';
const OWNER_NAME = 'Yosef';
const PHONE_DISPLAY = '(713) 555-0100';
const SHARE_IMAGE = 'assets/og-image.png';

const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const BLOG_OUT = path.join(ROOT, 'blog');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

// Blog categories — must match admin/config.yml select options.
const CATEGORIES = ['Getting Started', 'Wi-Fi & Home Network', 'Learning Apps', 'Staying Safe Online', 'Accessibility'];

// Per-category CTA copy + the service page each category links to.
const CATEGORY_META = {
  'Getting Started':      { area: '/device-setup/',        areaLabel: 'Device Setup & Optimization', cta: 'Want your new device set up for you?' },
  'Wi-Fi & Home Network': { area: '/home-network-wifi/',   areaLabel: 'Home Network & Wi-Fi',        cta: 'Struggling with Wi-Fi or a printer?' },
  'Learning Apps':        { area: '/tech-lessons/',        areaLabel: 'Tech Lessons & Training',     cta: 'Want a patient lesson, one-on-one?' },
  'Staying Safe Online':  { area: '/remote-support/',      areaLabel: 'Remote Support & Troubleshooting', cta: 'Worried something is wrong?' },
  'Accessibility':        { area: '/accessibility-setup/', areaLabel: 'Accessibility & Easy-to-Use Setup', cta: 'Want your device easier to see and use?' },
};
const DEFAULT_CTA_TEXT = `Call ${PHONE_DISPLAY} or use the contact form for friendly, upfront help.`;
const DEFAULT_OG_IMAGE = `${SITE_URL}/${SHARE_IMAGE}`;

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
    if(!CATEGORIES.includes(category)){console.warn(`  ! ${file}: unknown category "${category}" — using "${CATEGORIES[CATEGORIES.length-1]}"`);category=CATEGORIES[CATEGORIES.length-1];}
    const date=toISODate(data.date);
    const updated=data.updated?toISODate(data.updated):date;
    posts.push({slug,title:String(data.title),category,date,updated,
      excerpt:String(data.excerpt||''),
      metaTitle:String(data.meta_title||`${data.title} | ${BUSINESS_NAME}`),
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
  let items=`<li><a href="${meta.area}">${escapeHtml(meta.areaLabel)}</a> — my service overview</li>`;
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
    EXCERPT:escapeHtml(post.excerpt), EXCERPT_ESCAPED:jsonInner(post.metaDescription), BODY_HTML:renderBody(post.bodyMd),
    RELATED_LINKS:relatedLinksBlock(post,all),
    CTA_HEADING:escapeHtml(meta.cta), CTA_TEXT:escapeHtml(DEFAULT_CTA_TEXT),
    OWNER_NAME:escapeHtml(OWNER_NAME), BUSINESS_NAME:escapeHtml(BUSINESS_NAME),
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
    <span class="learn-more">Read article →</span></a></article>`;
}
function blogJsonLd(posts){
  const blogPost=posts.map((p,i)=>({'@type':'ListItem',position:i+1,url:`${SITE_URL}/blog/${p.slug}/`,name:p.title}));
  const obj={'@context':'https://schema.org','@type':'Blog',name:`${BUSINESS_NAME} Blog`,
    url:`${SITE_URL}/blog/`,inLanguage:'en-US',
    publisher:{'@type':'Organization',name:BUSINESS_NAME,url:`${SITE_URL}/`},
    ...(blogPost.length?{blogPost}:{})};
  return `<script type="application/ld+json">\n${JSON.stringify(obj,null,4)}\n</script>`;
}
function renderIndex(posts,template){
  const cards=posts.length===0
    ? `<div class="blog-empty"><h2>New articles coming soon</h2><p>Helpful, plain-language tech tips are on the way. Check back soon.</p></div>`
    : `<div class="blog-grid">\n${posts.map(renderCard).join('\n')}\n</div>`;
  fs.mkdirSync(BLOG_OUT,{recursive:true});
  fs.writeFileSync(path.join(BLOG_OUT,'index.html'),fillTokens(template,{CARDS:cards,BLOG_JSONLD:blogJsonLd(posts)}),'utf8');
}
function writePostsManifest(posts){
  const m=posts.map(p=>({slug:p.slug,title:p.title,category:p.category,date:p.date,updated:p.updated,excerpt:p.excerpt,url:`/blog/${p.slug}/`}));
  fs.writeFileSync(path.join(BLOG_OUT,'posts.json'),JSON.stringify(m,null,2),'utf8');
}
function reconcileSitemap(posts){
  if(!fs.existsSync(SITEMAP_PATH)){console.warn('  ! sitemap.xml not found — skipping reconcile');return;}
  const xml=fs.readFileSync(SITEMAP_PATH,'utf8');
  const blocks=xml.match(/<url>[\s\S]*?<\/url>/g)||[];
  const preserved=blocks.filter(b=>!/\/blog\//.test(b));
  const indent='   ';
  const blogBlocks=[`${indent}<url>\n${indent}   <loc>${SITE_URL}/blog/</loc>\n${indent}   <changefreq>weekly</changefreq>\n${indent}   <priority>0.6</priority>\n${indent}</url>`];
  for(const p of posts)blogBlocks.push(`${indent}<url>\n${indent}   <loc>${SITE_URL}/blog/${p.slug}/</loc>\n${indent}   <lastmod>${p.updated||p.date}</lastmod>\n${indent}   <changefreq>monthly</changefreq>\n${indent}   <priority>0.7</priority>\n${indent}</url>`);
  const body=[...preserved.map(b=>indent+b.trim()),...blogBlocks].join('\n');
  fs.writeFileSync(SITEMAP_PATH,`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,'utf8');
}
function redirectStub(target){
  const url=target.startsWith('http')?target:`${SITE_URL}${target}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Redirecting…</title>
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
    if(livingSlugs.has(from)){console.warn(`  ! redirect "${from}" collides with a live post — skipped`);continue;}
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
