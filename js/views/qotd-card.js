// Dashboard card for the Question of the Day race (js/qotd.js, supabase/qotd_race.sql).
// new: a Start button and today's topic only. started: the question and a running timer.
// done: right or wrong, the time, the explanation, and the day's leaderboard.
import { icon } from '../icons.js';
import { tex, esc, toast } from '../util.js';
import { L, tagLine } from '../qview.js';
import { store } from '../store.js';
import { foxSVG, cleanAvatar } from '../avatar.js';
import { myAvatar } from '../members.js';
import { db, cloudEnabled } from '../cloud.js';
import { qotdStatus, qotdStart, qotdAnswer, qotdBoard, qotdYesterday, fmtMs } from '../qotd.js';

const SECTION = { math: 'Math', rw: 'Reading and Writing' };

export function qotdRaceWidget(el) {
  const me = store.user();
  const client = cloudEnabled ? db() : null;
  let st = null, iv = null, t0 = 0, busy = false;

  const boardRows = (rows) => (rows.length
    ? `<ol class="board">${rows.map((r) => { const mine = me?.cloud && r.user_id === me.id; return `<li class="${mine ? 'you' : ''}"><span class="board-who">${foxSVG(mine ? myAvatar() : cleanAvatar(r.avatar, r.user_id), { size: 30 })}${esc(r.name || 'Student')}${mine ? ' (you)' : ''}</span><b>${fmtMs(r.ms)}</b></li>`; }).join('')}</ol>`
    : '<p class="muted small">No right answers yet today. Be the first on the board.</p>');

  async function drawBoard() {
    const box = el.querySelector('#qdBoard');
    if (!box) return;
    try {
      const [today, yday] = await Promise.all([qotdBoard(client), st?.day ? qotdBoard(client, qotdYesterday(st.day)) : []]);
      if (!box.isConnected) return;
      box.innerHTML = `<h3 class="sub">${icon('trophy')} Today's fastest</h3>${boardRows(today)}${yday[0] ? `<p class="muted small qd-yday">Yesterday's fastest: <b>${esc(yday[0].name || 'Student')}</b> in ${fmtMs(yday[0].ms)}</p>` : ''}`;
    } catch { box.innerHTML = '<p class="muted small">The leaderboard could not load.</p>'; }
  }

  const questionHTML = (q, done) => `${tagLine(q)}
    ${q.passage ? `<div class="passage">${tex(q.passage)}</div>` : ''}${q.figure || ''}
    <div class="stem">${tex(q.stem)}</div>
    <ol class="choices">${q.choices.map((c, i) => `<li class="${done && i === q.answer ? 'correct' : ''} ${done && i === st.chosen && !st.correct ? 'wrong' : ''}"><button class="choice" data-c="${i}" ${done ? 'disabled' : ''}><span class="letter">${L(i)}</span><span class="ctext">${tex(c)}</span></button></li>`).join('')}</ol>`;

  function draw() {
    clearInterval(iv);
    if (!st?.available) { el.innerHTML = '<p class="muted">No question today. Check back tomorrow.</p><div id="qdBoard"></div>'; return drawBoard(); }
    if (st.status === 'new') {
      const signedIn = !!me?.cloud;
      el.innerHTML = `<div class="qd-start">
        <p class="muted small">${icon('timer')} Today: ${esc(SECTION[st.section] || 'SAT')}${st.domain ? `, ${esc(st.domain)}` : ''}</p>
        <p>Everyone gets the same question. You get one try, and the clock starts when you press Start. Right answers go on the leaderboard, fastest first.</p>
        ${signedIn ? '<button class="btn primary lg" id="qdStart">Start Question of the Day</button>' : '<a class="btn primary" href="#/login">Sign in to play</a><p class="muted small">You need an account that syncs, so your time counts.</p>'}
      </div><div id="qdBoard"></div>`;
      return drawBoard();
    }
    if (st.status === 'started') {
      // Server start time, adjusted to this device's clock by the time the response arrived.
      t0 = Math.min(Date.now(), Date.parse(st.started_at) || Date.now());
      el.innerHTML = `<div class="row between"><b>Question of the Day</b><b class="match-time" id="qdTime">0.0s</b></div>${questionHTML(st.question, false)}`;
      const tick = () => { if (!el.isConnected) return clearInterval(iv); const t = el.querySelector('#qdTime'); if (t) t.textContent = fmtMs(Date.now() - t0); };
      tick(); iv = setInterval(tick, 100);
      return;
    }
    const q = st.question;
    el.innerHTML = `${questionHTML(q, true)}
      <div class="feedback ${st.correct ? 'ok' : 'bad'}"><b>${st.correct ? `Right in ${fmtMs(st.ms)}!` : 'Not quite.'}</b>
        ${st.correct ? `You're #${st.rank} today.` : "Wrong answers don't go on the leaderboard."}
        ${st.correct && st.beat != null ? ` You were faster than ${st.beat}% of students today.` : ''}
        Answer: ${L(q.answer)}<div class="expl">${tex(q.expl || '')}</div>
        ${!st.correct && q.choiceExpl?.[st.chosen] ? `<p class="small"><b>Why ${L(st.chosen)} is wrong:</b> ${tex(q.choiceExpl[st.chosen])}</p>` : ''}
        <p class="muted small">A new question comes out at midnight Central time.</p></div>
      <div id="qdBoard"></div>`;
    drawBoard();
  }

  el.addEventListener('click', async (e) => {
    if (busy) return;
    if (e.target.closest('#qdStart')) {
      busy = true;
      try { st = await qotdStart(client); draw(); } catch (err) { toast(err.message); }
      busy = false;
      return;
    }
    const c = e.target.closest('[data-c]');
    if (!c || st?.status !== 'started') return;
    busy = true;
    el.querySelectorAll('[data-c]').forEach((b) => { b.disabled = true; });
    try {
      st = await qotdAnswer(client, +c.dataset.c);
      const q = st.question;
      store.recordAnswer({ ...q, uid: q.id }, !!st.correct); store.save();
      draw();
    } catch (err) { toast(err.message); el.querySelectorAll('[data-c]').forEach((b) => { b.disabled = false; }); }
    busy = false;
  });

  el.innerHTML = '<p class="muted small">Loading...</p>';
  qotdStatus(client).then((s) => { st = s; draw(); }).catch(() => { el.innerHTML = '<p class="muted">The Question of the Day could not load. Try again in a bit.</p>'; });
}
