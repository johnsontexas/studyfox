// Share sheet: pick what to share (streak, progress, or the site), then send it by text, email,
// or as an Instagram story image. The story image is drawn on a canvas at 1080x1920.
import { icon } from './icons.js';
import { toast } from './util.js';
import { modal } from './tools.js';
import { SHARE_KINDS, shareMessage } from './share-text.js';
import { SITE_URL } from './config.js';

const W = 1080, H = 1920;
const FOX = 'M8 6l16 14h16l16-14-2 30-22 24-22-24z';

function drawCard(kind) {
  const m = shareMessage(kind);
  const cv = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = cv.getContext('2d');
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1f6b47'); bg.addColorStop(1, '#0d3322');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // soft shapes
  g.fillStyle = 'rgba(242,179,61,.16)'; g.beginPath(); g.arc(940, 260, 300, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.arc(120, 1650, 360, 0, 7); g.fill();
  // fox mark
  g.save(); g.translate(W / 2 - 160, 300); g.scale(5, 5);
  const p = new Path2D(FOX); g.fillStyle = '#f9a825'; g.fill(p);
  g.fillStyle = '#fff8ec'; g.fill(new Path2D('M10 36l22 24 22-24-12-4-10 9-10-9z'));
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(23, 28, 3, 0, 7); g.arc(41, 28, 3, 0, 7); g.fill(); g.fill(new Path2D('M26.5 54h11L32 60z'));
  g.restore();
  g.textAlign = 'center'; g.fillStyle = '#fff8ec';
  g.font = '700 76px system-ui, sans-serif'; g.fillText(m.title.toUpperCase(), W / 2, 820);
  const bigSize = m.big.length > 6 ? 220 : 400;
  g.font = `800 ${bigSize}px system-ui, sans-serif`; g.fillStyle = '#f2b33d'; g.fillText(m.big, W / 2, 820 + 60 + bigSize);
  g.fillStyle = '#fff8ec'; g.font = '500 66px system-ui, sans-serif';
  wrap(g, m.small, W / 2, 1360, 900, 84);
  g.font = '800 88px system-ui, sans-serif'; g.fillText('studyfox.org', W / 2, 1700);
  g.font = '500 48px system-ui, sans-serif'; g.fillStyle = 'rgba(255,248,236,.75)'; g.fillText('Free. No ads. No paywalls.', W / 2, 1770);
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
  let kind = start;
  const m = modal(`<div class="share-sheet">
      <div class="seg full" id="shKind">${SHARE_KINDS.map(([k, t]) => `<button data-k="${k}">${t}</button>`).join('')}</div>
      <div class="share-preview"><img id="shImg" alt="Preview of the image you'll share"></div>
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
    el.querySelector('#shImg').src = drawCard(kind).toDataURL('image/png');
    el.querySelector('#shText').textContent = shareMessage(kind).text;
  };
  el.addEventListener('click', async (e) => {
    const k = e.target.closest('[data-k]'); if (k) { kind = k.dataset.k; return draw(); }
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    const msg = shareMessage(kind);
    if (a === 'text') location.href = `sms:?&body=${encodeURIComponent(msg.text)}`;
    else if (a === 'email') location.href = `mailto:?subject=${encodeURIComponent('Check out StudyFox')}&body=${encodeURIComponent(msg.text)}`;
    else if (a === 'copy') { try { await navigator.clipboard.writeText(kind === 'site' ? SITE_URL : msg.text); toast('Copied.', 'good'); } catch { toast("Couldn't copy. Select the text above instead."); } }
    else if (a === 'story' || a === 'save') {
      const blob = await toBlob(drawCard(kind));
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
  return m;
}
