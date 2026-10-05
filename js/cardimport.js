// Splits pasted notes into flashcards. Shared by the website and the app (mobile/src/lib/shared.ts).
// sep: 'tab' | 'comma' | 'dash' | 'custom'; row: 'nl' | 'semi' | 'custom'. Custom text may use \n and \t.
const unescape = (s) => String(s || '').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
const SEP = { tab: '\t', comma: ',', dash: ' - ' };

export const IMPORT_DEFAULT = { sep: 'tab', row: 'nl', cSep: '', cRow: '' };

export function parseImport(txt, sep, row, cSep = '', cRow = '') {
  const s = sep === 'custom' ? unescape(cSep) : SEP[sep] || '\t';
  const r = row === 'custom' ? unescape(cRow) : row === 'semi' ? ';' : null;
  if (!s || (row === 'custom' && !r)) return [];
  return String(txt).split(r == null ? /\r?\n/ : r).map((line) => {
    const i = line.indexOf(s);
    if (i < 0) return null;
    return { t: line.slice(0, i).trim(), d: line.slice(i + s.length).trim() };
  }).filter((c) => c && (c.t || c.d));
}

// The last separators someone used live in their settings, so they sync with their account.
export const importPrefs = (settings) => ({ ...IMPORT_DEFAULT, ...(settings.importSep || {}) });
