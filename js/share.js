// Share sheet: pick what to share (streak, progress, or the site), then send it by text, email,
// or as an Instagram story image in one of several designs. The story image is drawn on a canvas at 1080x1920.
import { icon } from './icons.js';
import { toast } from './util.js';
import { modal } from './tools.js';
import { SHARE_KINDS, shareMessage } from './share-text.js';
import { referralUrl, myNumber, loadMember, ordinal } from './members.js';
import { db } from './cloud.js';
import { store } from './store.js';

const W = 1080, H = 1920;
const FOX = 'M8 6l16 14h16l16-14-2 30-22 24-22-24z';

// Card designs. Each paints its own background and decoration, then shares the same layout.
const THEMES = [
  { id: 'forest', name: 'Forest', ink: '#fff8ec', accent: '#f2b33d', sub: 'rgba(255,248,236,.75)', paint(g) {
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#1f6b47'); bg.addColorStop(1, '#0d3322');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(242,179,61,.16)'; g.beginPath(); g.arc(940, 260, 300, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.arc(120, 1650, 360, 0, 7); g.fill();
  } },
  { id: 'sunset', name: 'Sunset', ink: '#ffffff', accent: '#fff1a8', sub: 'rgba(255,255,255,.8)', paint(g) {
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#ff7a59'); bg.addColorStop(.55, '#e8457c'); bg.addColorStop(1, '#5b2a86');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // a sun rising behind the fox, with horizon stripes along the bottom edge
    g.fillStyle = 'rgba(255,214,120,.45)'; g.beginPath(); g.arc(W / 2, 470, 300, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 5; i++) g.fillRect(0, 1810 + i * 24, W, 4 + i * 3);
  } },
  { id: 'midnight', name: 'Midnight', ink: '#e8f0ff', accent: '#5ff2c1', sub: 'rgba(232,240,255,.7)', paint(g) {
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); glow.addColorStop(0, 'rgba(95,242,193,.22)'); glow.addColorStop(1, 'rgba(95,242,193,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(120,150,255,.13)'; g.lineWidth = 2;
    for (let x = 0; x <= W; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y <= H; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { const x = (i * 337) % W, y = (i * 571) % 700; g.globalAlpha = .2 + (i % 5) / 8; g.fillRect(x, y, 4, 4); } g.globalAlpha = 1;
  } },
  { id: 'notebook', name: 'Notebook', ink: '#1d2a44', accent: '#e8453c', sub: 'rgba(29,42,68,.7)', paint(g) {
    g.fillStyle = '#fbf7ec'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(80,130,200,.28)'; g.lineWidth = 3;
    for (let y = 140; y < H; y += 72) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = 'rgba(232,69,60,.5)'; g.beginPath(); g.moveTo(130, 0); g.lineTo(130, H); g.stroke();
    g.fillStyle = '#e6dfcc'; for (const y of [380, 960, 1540]) { g.beginPath(); g.arc(60, y, 26, 0, 7); g.fill(); }
    // highlighter swipe behind the big number
    g.fillStyle = 'rgba(255,222,89,.6)'; g.save(); g.translate(W / 2, 1215); g.rotate(-.04); g.fillRect(-300, -80, 600, 120); g.restore();
  } },
  { id: 'bold', name: 'Bold', ink: '#111111', accent: '#111111', sub: 'rgba(17,17,17,.75)', paint(g) {
    g.fillStyle = '#f9c80e'; g.fillRect(0, 0, W, H);
    g.save(); g.rotate(-.35); g.fillStyle = 'rgba(17,17,17,.08)';
    for (let x = -1400; x < 2400; x += 160) g.fillRect(x, -400, 70, 3200);
    g.restore();
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 10;
    g.beginPath(); g.roundRect(90, 740, W - 180, 760, 48); g.fill(); g.stroke();
  } },
];

function drawCard(kind, themeId = 'forest') {
  const m = shareMessage(kind);
  const t = THEMES.find((x) => x.id === themeId) || THEMES[0];
  const cv = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = cv.getContext('2d');
  t.paint(g);
  // fox mark
  g.save(); g.translate(W / 2 - 160, 300); g.scale(5, 5);
  const p = new Path2D(FOX); g.fillStyle = '#f9a825'; g.fill(p);
  if (t.id === 'bold' || t.id === 'notebook') { g.lineWidth = 2; g.strokeStyle = t.ink; g.stroke(p); }
  g.fillStyle = '#fff8ec'; g.fill(new Path2D('M10 36l22 24 22-24-12-4-10 9-10-9z'));
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(23, 28, 3, 0, 7); g.arc(41, 28, 3, 0, 7); g.fill(); g.fill(new Path2D('M26.5 54h11L32 60z'));
  g.restore();
  g.textAlign = 'center'; g.fillStyle = t.ink;
  g.font = '700 76px system-ui, sans-serif'; g.fillText(m.title.toUpperCase(), W / 2, 820);
  const bigSize = m.big.length > 6 ? 220 : 400;
  g.font = `800 ${bigSize}px system-ui, sans-serif`; g.fillStyle = t.accent; g.fillText(m.big, W / 2, 820 + 60 + bigSize);
  g.fillStyle = t.ink; g.font = '500 66px system-ui, sans-serif';
  wrap(g, m.small, W / 2, 1360, 820, 84);
  // Signed-in students' cards carry their referral link, so a friend can type it in.
  const link = referralUrl(store.user() ? myNumber() : null).replace(/^https?:\/\//, '');
  g.font = `800 ${link.length > 14 ? 64 : 88}px system-ui, sans-serif`; g.fillText(link, W / 2, 1700);
  g.font = '500 48px system-ui, sans-serif'; g.fillStyle = t.sub; g.fillText('Free. No ads. No paywalls.', W / 2, 1770);
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
  let kind = start, theme = 'forest';
  try { theme = localStorage.getItem('sf_share_theme') || theme; } catch {}
  const m = modal(`<div class="share-sheet">
      <div class="seg full" id="shKind">${SHARE_KINDS.map(([k, t]) => `<button data-k="${k}">${t}</button>`).join('')}</div>
      <div class="share-preview"><img id="shImg" alt="Preview of the image you'll share"></div>
      <div class="share-themes" id="shTheme" aria-label="Card design">${THEMES.map((t) => `<button data-t="${t.id}" class="sw-${t.id}" title="${t.name}"><span>${t.name}</span></button>`).join('')}</div>
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
    el.querySelector('#shImg').src = drawCard(kind, theme).toDataURL('image/png');
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
      const blob = await toBlob(drawCard(kind, theme));
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
  draw();
  if (store.user()?.cloud && !myNumber()) loadMember(db()).then(() => { if (el.isConnected) draw(); });
  return m;
}
