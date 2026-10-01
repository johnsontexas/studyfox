// Small HTML helpers shared by all course files.
export const bad = (s) => `<div class="ex ex-bad"><b>Incorrect</b><span>${s}</span></div>`;
export const good = (s) => `<div class="ex ex-good"><b>Correct</b><span>${s}</span></div>`;
export const rule = (s) => `<div class="rule">${s}</div>`;
export const tip = (s) => `<div class="tip"><b>Tip</b> ${s}</div>`;
export const worked = (title, s) => `<div class="worked"><b>${title}</b>${s}</div>`;
// table(['Head', ...], [['cell', ...], ...]) -> a data table that scrolls sideways on narrow screens.
export const table = (head, rows) => `<div class="tbl-wrap"><table class="data"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
