// Builds static, crawlable pages for search engines from StudyFox's content, plus sitemap.xml and an HTML sitemap.
// The app itself uses #/ routes, which Google treats as one page. These pages give every course, lesson and
// flashcard deck its own real URL with the full text in the HTML, and link into the interactive app.
//
// Run:  npm run seo        (pulls the latest content from Supabase; falls back to the built-in copy in js/content/)
// Re-run it after adding or editing lessons, then deploy.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COURSES, SUBJECTS } from '../js/content/courses.js';
import { BUILTIN_DECKS } from '../js/content/decks.js';
import { applyContent } from '../js/content/live.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, CREATOR, SITE_URL } from '../js/config.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = SITE_URL.replace(/\/$/, '');
const TODAY = new Date().toISOString().slice(0, 10);

// ---------- content ----------
async function loadLive() {
  const get = async (table, order) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
    if (!r.ok) throw new Error(`${table}: ${r.status}`);
    return r.json();
  };
  try {
    const [courses, lessons, decks] = await Promise.all([get('courses', 'sort,id'), get('lessons', 'course_id,sort'), get('decks', 'sort')]);
    if (applyContent({ version: 'seo', courses, lessons, decks, questions: [], hidden: [] })) { console.log('Using live content from Supabase.'); return; }
  } catch (e) { console.warn('Could not reach Supabase, using the built-in content:', e.message); }
}
await loadLive();

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\$([^$]+)\$/g, '$1').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n = 155) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:.]$/, '') + '…');
const slug = (s) => String(s).toLowerCase().replace(/^builtin-/, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SUBJECT_SLUG = Object.fromEntries(SUBJECTS.map((s) => [s, slug(s)]));
const coursesIn = (subject) => COURSES.filter((c) => c.subject === subject);
const courseUrl = (c) => `/courses/${c.id}/`;
const lessonUrl = (c, l) => `/courses/${c.id}/${l.id}/`;
const deckUrl = (d) => `/flashcards/${slug(d.id)}/`;

const urls = []; // { loc, priority, changefreq, section, title, desc }
const pages = []; // { path, html }
const cards = new Map(); // file -> { file, title, sub, kicker }: share images drawn by tools/build-card-images.py
const card = (file, title, sub, kicker = 'StudyFox') => { cards.set(file, { file, title, sub, kicker }); return { file, title, sub }; };
const imgUrl = (im) => `${SITE}/assets/cards/${im.file}.png`;

function page({ path, title, desc, h1, crumbs = [], body, jsonld = [], priority = 0.6, changefreq = 'monthly', section, appLink, image, showImage = true }) {
  const url = SITE + path;
  const im = image || card('studyfox', 'StudyFox', 'Free study material for every AP class, SAT and ACT');
  const imAlt = `${im.title}: ${im.sub}`;
  const crumbLd = { '@type': 'BreadcrumbList', itemListElement: [{ name: 'StudyFox', path: '/' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE + c.path })) };
  const ld = { '@context': 'https://schema.org', '@graph': [crumbLd, ...jsonld] };
  const fullTitle = `${title} · StudyFox`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(CREATOR)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="StudyFox">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${imgUrl(im)}">
<meta property="og:image:alt" content="${esc(imAlt)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${imgUrl(im)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/studyfox-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Instrument+Sans:wght@400..700&family=Source+Serif+4:wght@400;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" media="print" onload="this.media='all'">
<link rel="stylesheet" href="/css/seo.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="/"><img src="/assets/logo-mark.svg" alt="" width="28" height="28">StudyFox</a>
<nav><a href="/courses/">Courses</a><a href="/ap/">AP</a><a href="/sat-act/">SAT &amp; ACT</a><a href="/flashcards/">Flashcards</a></nav></div></header>
<main class="wrap">
${crumbs.length ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">StudyFox</a>${crumbs.map((c, i) => i === crumbs.length - 1 ? ` <span>/</span> <span aria-current="page">${esc(c.name)}</span>` : ` <span>/</span> <a href="${c.path}">${esc(c.name)}</a>`).join('')}</nav>` : ''}
<h1>${esc(h1 || title)}</h1>
${showImage ? `<figure class="hero-card"><img src="/assets/cards/${im.file}.png" alt="${esc(imAlt)}" width="1200" height="630" fetchpriority="high"></figure>` : ''}
${appLink ? `<p class="cta"><a class="btn" href="${appLink}">Open in StudyFox</a> <span>Free, no ads. Practice, track progress and quiz yourself in the app.</span></p>` : ''}
${body}
</main>
<footer class="foot"><div class="wrap"><p>StudyFox is free study material for school, made by ${esc(CREATOR)}. No ads, no paywalls.</p>
<p><a href="/courses/">All courses</a> · <a href="/ap/">AP classes</a> · <a href="/sat-act/">SAT &amp; ACT prep</a> · <a href="/flashcards/">Flashcards</a> · <a href="/sitemap/">Site map</a> · <a href="/#/about">About</a> · <a href="/#/privacy">Privacy</a></p></div></footer>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$',right:'$',display:false}],throwOnError:false})"></script>
</body>
</html>
`;
  pages.push({ path, html });
  urls.push({ loc: url, priority, changefreq, section, title, desc, image: imgUrl(im), imageTitle: imAlt });
}

const courseCard = (c) => `<li><a href="${courseUrl(c)}"><b>${esc(c.title)}</b></a><span class="meta">${esc(c.level || c.subject)} · ${c.lessons.length} lessons</span><p>${esc(c.blurb)}</p></li>`;
const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
const ap = COURSES.filter((c) => c.ap);
const prep = COURSES.filter((c) => c.subject === 'SAT & ACT');

// ---------- hubs ----------
page({
  path: '/courses/', title: 'Free Online Courses for High School', priority: 0.9, changefreq: 'weekly', section: 'Hubs', appLink: '/#/learn', image: card('courses', 'Free Courses', `${COURSES.length} classes, ${totalLessons} lessons, all free`, 'StudyFox courses'),
  desc: clip(`${COURSES.length} free courses and ${totalLessons} short lessons for high school: math, science, English, history, every AP subject, and SAT and ACT prep. Each lesson has worked examples and a quick check.`),
  crumbs: [{ name: 'Courses', path: '/courses/' }],
  body: `<p class="lede">${COURSES.length} free courses with ${totalLessons} short lessons. Each lesson explains the idea, works through examples, and ends with a quick check question.</p>
${SUBJECTS.filter((s) => coursesIn(s).length).map((s) => `<section><h2 id="${SUBJECT_SLUG[s]}">${esc(s)}</h2><ul class="cards">${coursesIn(s).map(courseCard).join('')}</ul></section>`).join('\n')}`,
  jsonld: [{ '@type': 'ItemList', name: 'StudyFox courses', itemListElement: COURSES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + courseUrl(c), name: c.title })) }],
});

page({
  path: '/ap/', title: 'Free AP Review for Every AP Class', priority: 0.9, changefreq: 'weekly', section: 'Hubs', appLink: '/#/ap', image: card('ap', 'AP Review', `Notes for all ${ap.length} AP classes, unit by unit`, 'StudyFox AP'),
  desc: clip(`Free AP review for ${ap.length} AP courses, including AP Biology, AP Chemistry, AP U.S. History, AP World, AP Psychology and AP Calculus: unit-by-unit lessons, practice questions and cram flashcards.`),
  crumbs: [{ name: 'AP classes', path: '/ap/' }],
  body: `<p class="lede">Unit-by-unit review for ${ap.length} AP courses, written to match the College Board course frameworks. Each unit is a short lesson with the key ideas, exam tips and a check question. Practice questions and cram flashcards are in the app.</p>
${SUBJECTS.filter((s) => ap.some((c) => c.subject === s)).map((s) => `<section><h2>AP ${esc(s)}</h2><ul class="cards">${ap.filter((c) => c.subject === s).map(courseCard).join('')}</ul></section>`).join('\n')}`,
  jsonld: [{ '@type': 'ItemList', name: 'AP courses', itemListElement: ap.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + courseUrl(c), name: c.title })) }],
});

page({
  path: '/sat-act/', title: 'Free SAT and ACT Prep', priority: 0.9, changefreq: 'weekly', section: 'Hubs', appLink: '/#/practice', image: card('sat-act', 'SAT & ACT Prep', 'Lessons, practice tests and a question bank', 'StudyFox test prep'),
  desc: 'Free SAT and ACT prep: Desmos tricks, grammar rules, reading and math lessons, numbered practice tests, speed practice, formula sheets and a question bank. No ads, no paywalls.',
  crumbs: [{ name: 'SAT & ACT prep', path: '/sat-act/' }],
  body: `<p class="lede">Everything for the digital SAT and the ACT, free. Learn each section with the lessons below, then use the app for unlimited practice questions, numbered full-length and half-length practice tests, speed practice and score tracking.</p>
<h2>Lessons</h2><ul class="cards">${prep.map(courseCard).join('')}</ul>
<h2>Practice in the app</h2><ul class="plain">
<li><a href="/#/practice">SAT and ACT question bank</a>: practice by skill with explanations for every answer.</li>
<li><a href="/#/exams">Practice tests</a>: numbered SAT and ACT tests and subject half tests, scored like the real thing.</li>
<li><a href="/#/speed">Speed practice</a>: timed drills to build pace.</li>
<li><a href="/#/formulas">Formula sheets</a> and the built-in <a href="/#/calculator">Desmos calculator</a>.</li></ul>
<h2>Flashcards</h2><ul class="plain">${BUILTIN_DECKS.filter((d) => /SAT|ACT/.test(d.tag)).map((d) => `<li><a href="${deckUrl(d)}">${esc(d.title)}</a>: ${esc(d.desc)}</li>`).join('')}</ul>`,
});

page({
  path: '/flashcards/', title: 'Free Flashcards for AP, SAT and ACT', priority: 0.8, changefreq: 'weekly', section: 'Hubs', appLink: '/#/flashcards', image: card('flashcards', 'Flashcards', `${BUILTIN_DECKS.length} free decks for AP, SAT and ACT`, 'StudyFox flashcards'),
  desc: clip(`${BUILTIN_DECKS.length} free flashcard decks: SAT vocabulary, math formulas, grammar rules, and cram sets for AP Biology, Chemistry, U.S. History, World History, Psychology and more.`),
  crumbs: [{ name: 'Flashcards', path: '/flashcards/' }],
  body: `<p class="lede">Free flashcard decks you can study in the app with Learn, Test and Match modes, or copy and edit as your own.</p><ul class="cards">${BUILTIN_DECKS.map((d) => `<li><a href="${deckUrl(d)}"><b>${esc(d.title)}</b></a><span class="meta">${esc(d.tag)} · ${d.cards.length} cards</span><p>${esc(d.desc)}</p></li>`).join('')}</ul>`,
});

// ---------- courses and lessons ----------
for (const c of COURSES) {
  const crumbsC = [{ name: c.ap ? 'AP classes' : c.subject === 'SAT & ACT' ? 'SAT & ACT prep' : 'Courses', path: c.ap ? '/ap/' : c.subject === 'SAT & ACT' ? '/sat-act/' : '/courses/' }, { name: c.title, path: courseUrl(c) }];
  const deck = BUILTIN_DECKS.find((d) => slug(d.title).startsWith(slug(c.title)) || d.title.startsWith(c.title + ' '));
  const mins = c.lessons.reduce((n, l) => n + (l.mins || 0), 0);
  const cImg = card(`course-${c.id}`, c.title, c.ap ? `Free review notes for every unit · ${c.lessons.length} lessons` : `Free course · ${c.lessons.length} lessons`, c.ap ? 'AP review' : (c.subject || 'Course'));
  page({
    path: courseUrl(c), title: c.ap ? `${c.title} Review: Free Notes for Every Unit` : `${c.title}: Free Course`, h1: c.title, crumbs: crumbsC,
    priority: c.ap || c.subject === 'SAT & ACT' ? 0.8 : 0.7, section: 'Courses', appLink: `/#/learn/${c.id}`, image: cImg,
    desc: clip(`Free ${c.title} ${c.ap ? 'review' : 'course'}: ${c.blurb}`),
    body: `<p class="lede">${esc(c.blurb)}</p><p class="meta">${esc(c.level || c.subject)} · ${c.lessons.length} lessons · about ${mins} minutes</p>
<h2>Lessons</h2><ol class="lessons">${c.lessons.map((l) => `<li><a href="${lessonUrl(c, l)}">${esc(l.title)}</a><span class="meta">${l.mins ? l.mins + ' min' : ''}</span><p>${esc(clip(strip(l.body), 160))}</p></li>`).join('')}</ol>
${deck ? `<h2>Flashcards</h2><p><a href="${deckUrl(deck)}">${esc(deck.title)}</a>: ${deck.cards.length} cards.</p>` : ''}`,
    jsonld: [{ '@type': 'Course', name: c.title, description: c.blurb, url: SITE + courseUrl(c), inLanguage: 'en', isAccessibleForFree: true, educationalLevel: c.level || 'High school',
      provider: { '@type': 'Organization', name: 'StudyFox', sameAs: SITE, logo: SITE + '/assets/logo-512.png' }, image: imgUrl(cImg), offers: { '@type': 'Offer', category: 'Free', price: 0, priceCurrency: 'USD' },
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: `PT${mins || 30}M` },
      syllabusSections: c.lessons.map((l) => ({ '@type': 'Syllabus', name: l.title })) }],
  });

  c.lessons.forEach((l, i) => {
    const prev = c.lessons[i - 1], next = c.lessons[i + 1];
    const ch = l.check;
    const checkHtml = ch ? `<section class="check"><h2>Check your understanding</h2><p>${ch.q}</p><ol type="A">${ch.choices.map((x) => `<li>${x}</li>`).join('')}</ol>
<details><summary>Show answer</summary><p><b>Answer: ${String.fromCharCode(65 + ch.answer)}.</b> ${ch.why || ''}</p></details></section>` : '';
    const text = strip(l.body);
    page({
      path: lessonUrl(c, l), title: `${l.title} · ${c.title}`, h1: l.title, crumbs: [...crumbsC, { name: l.title, path: lessonUrl(c, l) }],
      priority: 0.6, section: 'Lessons', image: cImg, showImage: false, appLink: `/#/learn/${c.id}/${l.id}`,
      desc: clip(`${c.title}, ${l.title}: ${text}`),
      body: `<p class="meta">${esc(c.title)} · Lesson ${i + 1} of ${c.lessons.length}${l.mins ? ` · ${l.mins} min read` : ''}</p>
<article class="lesson">${l.body}</article>${checkHtml}
<nav class="pager">${prev ? `<a href="${lessonUrl(c, prev)}">Previous: ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="${lessonUrl(c, next)}">Next: ${esc(next.title)}</a>` : `<a href="${courseUrl(c)}">Back to ${esc(c.title)}</a>`}</nav>`,
      jsonld: [
        { '@type': 'LearningResource', name: l.title, description: clip(text, 300), url: SITE + lessonUrl(c, l), learningResourceType: 'Lesson', isAccessibleForFree: true, image: imgUrl(cImg), inLanguage: 'en', educationalLevel: c.level || 'High school', timeRequired: l.mins ? `PT${l.mins}M` : undefined, isPartOf: { '@type': 'Course', name: c.title, url: SITE + courseUrl(c) }, author: { '@type': 'Person', name: CREATOR } },
        ...(ch ? [{ '@type': 'Quiz', name: `${l.title} check`, about: l.title, hasPart: [{ '@type': 'Question', eduQuestionType: 'Multiple choice', text: strip(ch.q), acceptedAnswer: { '@type': 'Answer', text: strip(ch.choices[ch.answer]) }, suggestedAnswer: ch.choices.filter((_, j) => j !== ch.answer).map((x) => ({ '@type': 'Answer', text: strip(x) })) }] }] : []),
      ],
    });
  });
}

// ---------- flashcard decks ----------
for (const d of BUILTIN_DECKS) {
  page({
    path: deckUrl(d), title: `${d.title} Flashcards`, h1: d.title, crumbs: [{ name: 'Flashcards', path: '/flashcards/' }, { name: d.title, path: deckUrl(d) }],
    priority: 0.6, section: 'Flashcards', appLink: `/#/flashcards/${d.id}`, image: card(`deck-${slug(d.id)}`, d.title, `${d.cards.length} free flashcards`, 'Flashcards'),
    desc: clip(`${d.cards.length} free ${d.title} flashcards. ${d.desc}`),
    body: `<p class="lede">${esc(d.desc)}</p><p class="meta">${esc(d.tag)} · ${d.cards.length} cards</p>
<dl class="deck">${d.cards.map((x) => `<div><dt>${x.t}</dt><dd>${x.d}</dd></div>`).join('')}</dl>`,
    jsonld: [{ '@type': 'LearningResource', name: d.title, description: d.desc, learningResourceType: 'Flashcards', isAccessibleForFree: true, url: SITE + deckUrl(d), author: { '@type': 'Person', name: CREATOR } }],
  });
}

// ---------- HTML site map ----------
const sections = ['Hubs', 'Courses', 'Lessons', 'Flashcards'];
page({
  path: '/sitemap/', title: 'Site Map', priority: 0.3, section: 'Hubs', showImage: false,
  desc: `Every page on StudyFox: ${COURSES.length} courses, ${totalLessons} lessons and ${BUILTIN_DECKS.length} flashcard decks for high school, AP, SAT and ACT.`,
  crumbs: [{ name: 'Site map', path: '/sitemap/' }],
  body: `<p class="lede">Every page on StudyFox, grouped by course.</p>
<h2>Main pages</h2><ul class="plain"><li><a href="/">Home</a></li><li><a href="/courses/">All courses</a></li><li><a href="/ap/">AP classes</a></li><li><a href="/sat-act/">SAT and ACT prep</a></li><li><a href="/flashcards/">Flashcards</a></li></ul>
${SUBJECTS.filter((s) => coursesIn(s).length).map((s) => `<h2>${esc(s)}</h2>${coursesIn(s).map((c) => `<h3><a href="${courseUrl(c)}">${esc(c.title)}</a></h3><ul class="plain cols">${c.lessons.map((l) => `<li><a href="${lessonUrl(c, l)}">${esc(l.title)}</a></li>`).join('')}</ul>`).join('')}`).join('')}
<h2>Flashcard decks</h2><ul class="plain cols">${BUILTIN_DECKS.map((d) => `<li><a href="${deckUrl(d)}">${esc(d.title)}</a></li>`).join('')}</ul>`,
});

// ---------- write ----------
for (const dir of ['courses', 'ap', 'sat-act', 'flashcards', 'sitemap']) rmSync(join(ROOT, dir), { recursive: true, force: true });
for (const p of pages) { const f = join(ROOT, p.path, 'index.html'); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, p.html); }

const xmlEsc = (s) => esc(s).replace(/--/g, '- -');
const entry = (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n    <image:image><image:loc>${u.image}</image:loc></image:image>\n  </url>`;
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  StudyFox sitemap (${SITE}/sitemap.xml), generated ${TODAY} by tools/build-seo.mjs. Do not edit by hand: run "npm run seo".

  StudyFox is free study material for high school by ${xmlEsc(CREATOR)}: ${COURSES.length} courses and ${totalLessons} lessons
  covering math, science, English, history, social science, computer science, the arts, every AP subject,
  and SAT and ACT prep, plus ${BUILTIN_DECKS.length} flashcard decks. Everything is free, with no ads and no paywalls.

  The interactive app runs at ${SITE}/ (routes after #/ are not separate pages). Each URL below is a static page
  with the full text of its content and a link into the app.

  Sections:
    Home and hubs ....... ${urls.filter((u) => u.section === 'Hubs').length + 1} pages: home, all courses, AP classes, SAT and ACT prep, flashcards, site map
    Courses ............. ${urls.filter((u) => u.section === 'Courses').length} pages: one overview per course with its lesson list
    Lessons ............. ${urls.filter((u) => u.section === 'Lessons').length} pages: full lesson text, worked examples and a check question with the answer
    Flashcards .......... ${urls.filter((u) => u.section === 'Flashcards').length} pages: every card in each free deck

  Priority: 1.0 home, 0.9 hubs, 0.8 AP and SAT/ACT courses and the flashcard hub, 0.7 other courses, 0.6 lessons and decks.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Home -->
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc>${SITE}/assets/og-image.png</image:loc></image:image>
    <image:image><image:loc>${SITE}/assets/logo-512.png</image:loc></image:image>
  </url>
${sections.map((s) => {
  if (s !== 'Lessons') return `\n  <!-- ${s} -->\n` + urls.filter((u) => u.section === s).map(entry).join('\n');
  return COURSES.map((c) => `\n  <!-- Lessons: ${xmlEsc(c.title)} (${c.lessons.length}) -->\n` + c.lessons.map((l) => entry(urls.find((u) => u.loc === SITE + lessonUrl(c, l)))).join('\n')).join('\n');
}).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), xml);
mkdirSync(join(ROOT, 'assets/cards'), { recursive: true });
writeFileSync(join(ROOT, 'assets/cards/cards.json'), JSON.stringify([...cards.values()], null, 1));
console.log(`Wrote ${cards.size} image specs (run: python3 tools/build-card-images.py), ${pages.length} pages and sitemap.xml with ${urls.length + 1} URLs.`);
