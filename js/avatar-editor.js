// The fox editor: a big preview, a tab per part, every choice drawn on a small fox, and Shuffle.
// Exclusive items show a lock and how to earn them. Used by the Your fox page (#/fox) and Settings.
import { foxSVG, PARTS, PART_NAMES, defaultAvatar, isUnlocked, unlockText, followUrl, followSet } from './avatar.js';
import { myAvatar, saveAvatar, foxStats, foxUnlocked, earnFoxItem } from './members.js';
import { icon } from './icons.js';
import { esc, toast } from './util.js';

export function avatarCardHTML({ page = false } = {}) {
  return `<div class="card stack fox-card" id="foxCard">${page ? '' : '<h2 class="h3">Your fox</h2>'}
    <p class="muted small">This is you on your profile, the Match leaderboards, Top sharers, and your share images.</p>
    <div class="fox-edit"><div class="fox-big" id="foxBig"></div>
      <div class="grow stack"><div class="seg sm wrap" id="foxTabs">${Object.entries(PART_NAMES).map(([k, n], i) => `<button data-part="${k}" class="${i ? '' : 'on'}">${n}</button>`).join('')}</div>
      <div class="fox-opts" id="foxOpts"></div>
      <button class="btn ghost sm" id="foxShuffle">${icon('shuffle')} Shuffle outfit</button></div></div></div>`;
}

export function wireAvatar(root, client) {
  const card = root.querySelector('#foxCard');
  if (!card) return;
  let a = myAvatar(), part = 'fur';
  const draw = () => {
    const stats = foxStats(), had = foxUnlocked();
    card.querySelector('#foxBig').innerHTML = foxSVG(a, { size: 150, title: 'Your fox' });
    const list = [...PARTS[part]].sort((x, y) => !!x.unlock - !!y.unlock);
    card.querySelector('#foxOpts').innerHTML = list.map((o) => {
      const open = isUnlocked(o, stats, had), on = a[part] === o.id;
      const how = o.unlock ? unlockText(o.unlock) : '';
      return `<button class="fox-opt${on ? ' on' : ''}${open ? '' : ' locked'}${o.unlock ? ' rare' : ''}" data-id="${o.id}" title="${esc(open ? o.name : `${o.name}: ${how}`)}" aria-label="${esc(open ? o.name : `${o.name}, locked. ${how}`)}" aria-pressed="${on}">
        ${foxSVG({ ...a, [part]: o.id }, { size: 56 })}${open ? '' : `<span class="fox-lock">${icon('shield')}</span>`}<span>${esc(o.name)}</span>${o.unlock ? `<em>${open ? 'Earned' : esc(how)}</em>` : ''}</button>`;
    }).join('');
  };
  const set = (next) => {
    a = next; draw(); saveAvatar(client, a);
    const nav = document.querySelector('.nav-fox');
    if (nav) nav.innerHTML = foxSVG(a, { size: 30 });
  };
  card.addEventListener('click', (e) => {
    const t = e.target.closest('[data-part]');
    if (t) { part = t.dataset.part; card.querySelectorAll('#foxTabs button').forEach((b) => b.classList.toggle('on', b === t)); draw(); return; }
    const o = e.target.closest('.fox-opt');
    if (o) {
      const item = PARTS[part].find((x) => x.id === o.dataset.id);
      if (!isUnlocked(item, foxStats(), foxUnlocked()) && followUrl(item)) {
        window.open(followUrl(item), '_blank', 'noopener');
        const set = followSet(item); set.forEach(([, x]) => earnFoxItem(x.id));
        toast(`${item.unlock.kind === 'review' ? 'Thanks for the review!' : 'Thanks for following!'} Unlocked: ${set.map(([, x]) => x.name).join(', ')}.`);
        return set({ ...a, [part]: o.dataset.id });
      }
      if (!isUnlocked(item, foxStats(), foxUnlocked())) return toast(`Locked. ${unlockText(item.unlock)} to earn the ${item.name.toLowerCase()}.`);
      return set({ ...a, [part]: o.dataset.id });
    }
    if (e.target.closest('#foxShuffle')) set({ ...defaultAvatar(), fur: a.fur });
  });
  draw();
}

/** The Your fox page (#/fox). */
export function foxView(root, client) {
  root.innerHTML = `<div class="page narrow-wide stack"><div class="page-head"><a class="muted small" href="#/settings">Settings</a><h1>Your fox</h1></div>${avatarCardHTML({ page: true })}</div>`;
  wireAvatar(root, client);
}
