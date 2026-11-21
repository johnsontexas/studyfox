// Share sheet: pick what to share (streak, progress, or the site), then send it by text, email,
// or as an Instagram story image in one of several designs. The story image is drawn on a canvas at 1080x1920.
import { icon } from './icons.js';
import { toast } from './util.js';
import { modal } from './tools.js';
import { SHARE_KINDS, shareMessage } from './share-text.js';
import { referralUrl, myNumber, loadMember, ordinal, myAvatar } from './members.js';
import { foxSVG } from './avatar.js';
import { db } from './cloud.js';
import { store } from './store.js';

const W = 1080, H = 1920;
const FOX = 'M8 6l16 14h16l16-14-2 30-22 24-22-24z';

// Card designs. Flat, printed-looking colors with a little paper grain, so they read like a
// poster or a notebook page rather than a glowing gradient. Each paints its own background.
// Seeded random so a card looks the same every time it's drawn.
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
function grain(g, alpha, seed = 7, light = false) {
  const r = rng(seed); g.fillStyle = light ? '#fff' : '#000';
  for (let i = 0; i < 9000; i++) { g.globalAlpha = r() * alpha; g.fillRect(r() * W, r() * H, 2, 2); }
  g.globalAlpha = 1;
}
// A wobbly marker stroke, like someone underlined it by hand.
function scribble(g, x, y, w, color, thick = 22) {
  const r = rng(Math.round(w) + 3);
  g.strokeStyle = color; g.lineWidth = thick; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x, y + 6);
  for (let i = 1; i <= 8; i++) g.lineTo(x + (w * i) / 8, y + 6 - i * 1.4 + (r() - .5) * 9);
  g.stroke();
  g.lineWidth = thick * .45; g.globalAlpha = .7; g.beginPath(); g.moveTo(x + w * .08, y + 30);
  g.quadraticCurveTo(x + w * .5, y + 18 + (r() - .5) * 10, x + w * .82, y + 26); g.stroke(); g.globalAlpha = 1;
}
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, sans-serif';

const THEMES = [
  { id: 'paper', name: 'Paper', ink: '#23201b', accent: '#23201b', sub: 'rgba(35,32,27,.62)', mark: 'rgba(242,170,40,.75)', paint(g) {
    g.fillStyle = '#f4ede0'; g.fillRect(0, 0, W, H); grain(g, .07, 11);
    // a faint coffee ring, the kind every desk notebook has
    g.strokeStyle = 'rgba(140,100,60,.10)'; g.lineWidth = 14; g.beginPath(); g.arc(880, 1500, 150, .4, 5.9); g.stroke();
  } },
  { id: 'chalk', name: 'Chalk', ink: '#f3f1ea', accent: '#f6d77a', sub: 'rgba(243,241,234,.66)', mark: 'rgba(243,241,234,.55)', paint(g) {
    g.fillStyle = '#2f4a3c'; g.fillRect(0, 0, W, H); grain(g, .10, 5, true);
    // half-erased smudges
    const r = rng(19); g.fillStyle = 'rgba(255,255,255,.022)';
    for (let i = 0; i < 6; i++) { g.save(); g.translate(r() * W, r() * H); g.rotate(r() - .5); g.fillRect(-260, -50, 520, 100); g.restore(); }
    g.fillStyle = '#7a5a3a'; g.fillRect(0, H - 46, W, 46); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, H - 46, W, 6);
  } },
  { id: 'sticky', name: 'Sticky', ink: '#2a2418', accent: '#2a2418', sub: 'rgba(42,36,24,.62)', mark: 'rgba(230,80,60,.6)', tilt: -.025, paint(g) {
    g.fillStyle = '#c9a77c'; g.fillRect(0, 0, W, H); grain(g, .12, 3);
    g.save(); g.translate(W / 2, H / 2 + 20); g.rotate(-.025);
    g.fillStyle = 'rgba(60,40,10,.28)'; g.fillRect(-440, -770, 900, 1620);
    g.fillStyle = '#fbe58a'; g.fillRect(-460, -790, 900, 1620);
    g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(-460, -790, 900, 90);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.save(); g.translate(0, -795); g.rotate(.06); g.fillRect(-130, -32, 260, 64); g.restore();
    g.restore();
  } },
  { id: 'ink', name: 'Ink', ink: '#ece6d8', accent: '#ece6d8', sub: 'rgba(236,230,216,.6)', mark: 'rgba(232,110,70,.85)', paint(g) {
    g.fillStyle = '#1c2230'; g.fillRect(0, 0, W, H); grain(g, .08, 23, true);
    g.strokeStyle = 'rgba(236,230,216,.25)'; g.lineWidth = 3; g.strokeRect(54, 54, W - 108, H - 108);
  } },
  { id: 'bold', name: 'Bold', ink: '#141414', accent: '#141414', sub: 'rgba(20,20,20,.7)', mark: '#ffffff', sans: true, paint(g) {
    g.fillStyle = '#f5c518'; g.fillRect(0, 0, W, H); grain(g, .06, 31);
    g.fillStyle = '#141414'; g.fillRect(0, H - 360, W, 360);
  } },
];

function drawCard(kind, themeId = 'paper', fox = null) {
  const m = shareMessage(kind);
  const t = THEMES.find((x) => x.id === themeId) || THEMES[0];
  const cv = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = cv.getContext('2d');
  t.paint(g);
  g.save();
  if (t.tilt) { g.translate(W / 2, H / 2); g.rotate(t.tilt); g.translate(-W / 2, -H / 2); }
  const X = 130, head = t.sans ? SANS : SERIF;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  // small fox + wordmark, top left, like a letterhead
  g.save(); g.translate(X, 230); g.scale(1.6, 1.6);
  const p = new Path2D(FOX); g.fillStyle = '#e8892a'; g.fill(p);
  g.fillStyle = '#fff8ec'; g.fill(new Path2D('M10 36l22 24 22-24-12-4-10 9-10-9z'));
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(23, 28, 3, 0, 7); g.arc(41, 28, 3, 0, 7); g.fill(); g.fill(new Path2D('M26.5 54h11L32 60z'));
  g.restore();
  g.fillStyle = t.ink; g.font = `700 54px ${head}`; g.fillText('StudyFox', X + 120, 300);
  // The student's own fox, if they chose to show it (an <img> of foxSVG, loaded before drawing).
  if (fox?.complete && fox.naturalWidth) g.drawImage(fox, W - 130 - 400, 360, 400, 400);
  // label, then the big number
  g.fillStyle = t.sub; g.font = `600 48px ${SANS}`; g.fillText(m.title, X, 820);
  const long = m.big.length > 6;
  const bigSize = long ? 210 : 440;
  g.font = `${t.sans ? 900 : 700} ${bigSize}px ${head}`;
  const bw = Math.min(g.measureText(m.big).width, W - X - 90);
  const by = 820 + 40 + bigSize * .82;
  scribble(g, X - 10, by + 24, bw + 20, t.mark, t.id === 'bold' ? 26 : 22);
  g.fillStyle = t.accent; g.fillText(m.big, X, by, W - X - 90);
  g.fillStyle = t.ink; g.font = `${t.sans ? 600 : 'italic 400'} 64px ${head}`;
  wrap(g, m.small, X, by + 170, W - X - 130, 82);
  // Signed-in students' cards carry their referral link, so a friend can type it in.
  const link = referralUrl(store.user() ? myNumber() : null).replace(/^https?:\/\//, '');
  const footInk = t.id === 'bold' ? '#f5c518' : t.ink;
  g.fillStyle = footInk; g.font = `700 ${link.length > 18 ? 54 : 70}px ${SANS}`; g.fillText(link, X, 1700, W - X - 90);
  g.globalAlpha = .7; g.font = `400 44px ${SANS}`; g.fillText('Free. No ads. No paywalls.', X, 1770); g.globalAlpha = 1;
  g.restore();
  return cv;
}
function wrap(g, text, x, y, max, lh) {
  let line = '';
  for (const w of text.split(' ')) {
    if (g.measureText(line + w).width > max && line) { g.fillText(line.trim(), x, y); y += lh; line = ''; }
    line += w + ' ';
  }
  g.fillText(line.trim(), x, y);
}
const toBlob = (cv) => new Promise((r) => cv.toBlob(r, 'image/png'));

export function openShare(start = 'streak') {
  let kind = start, theme = 'paper', showFox = !!store.user();
  try { const saved = localStorage.getItem('sf_share_theme'); if (THEMES.some((t) => t.id === saved)) theme = saved; } catch {}
  try { if (localStorage.getItem('sf_share_fox') === '0') showFox = false; } catch {}
  // The fox as an image the canvas can draw (an SVG data URL doesn't taint the canvas).
  const foxImg = new Image();
  if (store.user()) foxImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(foxSVG(myAvatar(), { size: 400, bg: 'none' }));
  const card = () => drawCard(kind, theme, showFox ? foxImg : null);
  const m = modal(`<div class="share-sheet">
      <div class="seg full" id="shKind">${SHARE_KINDS.map(([k, t]) => `<button data-k="${k}">${t}</button>`).join('')}</div>
      <div class="share-preview"><img id="shImg" alt="Preview of the image you'll share"></div>
      <div class="share-themes" id="shTheme" aria-label="Card design">${THEMES.map((t) => `<button data-t="${t.id}" class="sw-${t.id}" title="${t.name}"><span>${t.name}</span></button>`).join('')}</div>
      ${store.user() ? '<label class="consent small"><input type="checkbox" id="shFox"> <span>Show my fox on the image</span></label>' : ''}
      <div class="share-link" id="shLink"></div>
      <p class="muted small" id="shText"></p>
      <div class="share-actions">
        <button class="btn" data-a="text">${icon('mail')} Text</button>
        <button class="btn" data-a="email">${icon('mail')} Email</button>
        <button class="btn" data-a="story">${icon('instagram')} Instagram story</button>
        <button class="btn" data-a="copy">${icon('link')} Copy link</button>
      </div>
      <button class="link sm" data-a="save">${icon('down')} Save image</button>
    </div>`, { title: 'Share' });
  const el = m.el;
  const draw = () => {
    el.querySelectorAll('[data-k]').forEach((b) => b.classList.toggle('on', b.dataset.k === kind));
    el.querySelectorAll('[data-t]').forEach((b) => b.classList.toggle('on', b.dataset.t === theme));
    el.querySelector('#shImg').src = card().toDataURL('image/png');
    const fb = el.querySelector('#shFox'); if (fb) fb.checked = showFox;
    el.querySelector('#shText').textContent = shareMessage(kind).text;
    const no = store.user() ? myNumber() : null;
    el.querySelector('#shLink').innerHTML = no
      ? `<div><b>Your link</b> <span class="muted small">You're student #${no}, the ${ordinal(no)} to join. Friends who sign up with it get your number filled in.</span></div><code>${referralUrl(no).replace(/^https?:\/\//, '')}</code>`
      : store.user()?.cloud ? '<span class="muted small">Loading your link…</span>' : '';
  };
  el.addEventListener('click', async (e) => {
    const k = e.target.closest('[data-k]'); if (k) { kind = k.dataset.k; return draw(); }
    const tb = e.target.closest('[data-t]'); if (tb) { theme = tb.dataset.t; try { localStorage.setItem('sf_share_theme', theme); } catch {} return draw(); }
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    const msg = shareMessage(kind);
    if (a === 'text') location.href = `sms:?&body=${encodeURIComponent(msg.text)}`;
    else if (a === 'email') location.href = `mailto:?subject=${encodeURIComponent('Check out StudyFox')}&body=${encodeURIComponent(msg.text)}`;
    else if (a === 'copy') { try { await navigator.clipboard.writeText(referralUrl(store.user() ? myNumber() : null)); toast('Link copied.', 'good'); } catch { toast("Couldn't copy. Select the text above instead."); } }
    else if (a === 'story' || a === 'save') {
      const blob = await toBlob(card());
      const file = new File([blob], `studyfox-${kind}.png`, { type: 'image/png' });
      if (a === 'story' && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], text: msg.text }); return; } catch (err) { if (err?.name === 'AbortError') return; }
      }
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: file.name }).click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (a === 'story') toast('Image saved. Open Instagram, start a story, and pick it from your photos.');
    }
  });
  el.querySelector('#shFox')?.addEventListener('change', (e) => { showFox = e.target.checked; try { localStorage.setItem('sf_share_fox', showFox ? '1' : '0'); } catch {} draw(); });
  foxImg.onload = () => { if (el.isConnected) draw(); };
  draw();
  if (store.user()?.cloud && !myNumber()) loadMember(db()).then(() => { if (el.isConnected) draw(); });
  return m;
}
