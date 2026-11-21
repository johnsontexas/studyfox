// One custom icon per class, keyed by course id. Same 24x24 line style as js/icons.js
// (stroke = currentColor, width 2), so they follow light/dark mode. A dot or small shape
// is filled with currentColor to give each one a focal point.
const D = (cx, cy, r = 1.2) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;

export const COURSE_ICONS = {
  // Math
  'algebra-1': '<path d="M4 18L18 4"/><path d="M4 8h5M6.5 5.5v5"/><path d="M14 16h6"/>' + D(17, 13, 1) + D(17, 19, 1),
  geometry: '<path d="M4 19.5L12 5l8 14.5z"/><path d="M4 19.5h16"/><path d="M8.5 19.5a4 4 0 0 0-1.6-3.2"/><circle cx="12" cy="14.5" r="2"/>',
  precalc: '<path d="M3.5 20h17M4 20V4"/><path d="M4 18c3 0 4-9 7-9s3 6 6 6 3-8 3.5-10"/>' + D(11, 9),
  calculus: '<path d="M14.5 4c-1.7-1-3.4-.3-3.8 1.8l-2.3 12.4c-.4 2.1-2.1 2.8-3.9 1.8"/><path d="M14 13.5c2 0 2.5-4 4.5-4M13.5 9.5c2 0 2.5 4 5 4"/>',
  statistics: '<path d="M3.5 20h17"/><path d="M3.5 19c3.5 0 4.5-12 8.5-12s5 12 8.5 12"/><path d="M8 20v-6M16 20v-6" stroke-width="1.4"/>' + D(12, 4, 1),
  'ap-precalc': '<circle cx="12" cy="12" r="8"/><path d="M12 12l5.5-5.8M12 12h8"/><path d="M15.6 12a3.6 3.6 0 0 0-1.1-2.6"/>' + D(17.5, 6.2),
  'ap-calc-bc': '<path d="M3.5 20h17M4 20V4"/><path d="M5 17c3-1 5-6 8-8s5-3 7-3"/><path d="M7.5 15.5V20M10.5 12.5V20M13.5 9.5V20M16.5 7.5V20" stroke-width="1.4"/>',
  'sat-math-algebra': '<path d="M5 8h4M7 6v4M15 8h4"/><path d="M5 16l4-0M15 14l4 4M19 14l-4 4"/><path d="M12 4v16" stroke-dasharray="2 2.5"/>',
  'sat-math-data-geo': '<path d="M4 20h16"/><rect x="5" y="12" width="3" height="8"/><rect x="10.5" y="8" width="3" height="12"/><path d="M16 20l4-7v7z"/>' + D(12, 4.5),
  'act-math': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h3M9.5 7.5v3M13.5 9h3M8 15l2.5 0M13.5 14l3 2.5M16.5 14l-3 2.5"/>',
  desmos: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M12 3.5v17M3.5 12h17" stroke-width="1.2"/><path d="M5.5 18c3-1 4-12 6.5-12s3 7 6.5 7"/>',

  // Science
  biology: '<path d="M12 20c-4.5 0-7-3-7-6.5C5 8 10 4 12 4s7 4 7 9.5c0 3.5-2.5 6.5-7 6.5z"/><circle cx="12" cy="12.5" r="3"/>' + D(12, 12.5, 1),
  chemistry: '<path d="M10 3.5h4M11 3.5v5.5L6 18a2 2 0 0 0 1.8 3h8.4a2 2 0 0 0 1.8-3L13 9V3.5"/><path d="M8 15.5h8"/>' + D(11, 18) + D(14, 17, .9),
  physics: '<circle cx="12" cy="12" r="1.8" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-60 12 12)"/>',
  'ap-bio': '<path d="M7 3c0 5 10 7 10 12s-4 6-4 6M17 3c0 5-10 7-10 12s4 6 4 6"/><path d="M8.5 6.5h7M9 17.5h6M10.5 12h3"/>',
  'ap-chem': '<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="20" r="2"/><path d="M10.2 10.3L6.5 7.3M13.8 10.3l3.7-3M12 14.5V18"/>',
  'ap-enviro': '<circle cx="12" cy="12" r="8.5"/><path d="M12 20.5c0-6 0-9 5.5-12"/><path d="M12 15c-3 0-5-2-5-5.5 3.5 0 5 2 5 5.5z"/>',
  'ap-physics-1': '<path d="M3.5 20h17"/><path d="M5 20l12-8"/><rect x="9" y="11" width="4.5" height="4.5" rx=".8" transform="rotate(-33.7 11.25 13.25)"/><path d="M15 8.5l3-2M16.5 9.5l2.5-1.5"/>',
  'ap-physics-2': '<path d="M3 15c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 5-4 2.5 4 3 4"/><path d="M3 9l18 0" stroke-dasharray="1.5 3"/><circle cx="12" cy="6" r="2"/>',
  'ap-physics-c-mech': '<path d="M12 3.5v4"/><path d="M7 3.5h10"/><path d="M12 7.5l5 9"/><circle cx="17.8" cy="18" r="2.5" fill="currentColor"/><path d="M8 16a6 6 0 0 0 4.8 2.5" stroke-dasharray="1.5 2"/>',
  'ap-physics-c-em': '<path d="M6 4v9a6 6 0 0 0 12 0V4"/><path d="M6 4h3v9a3 3 0 0 0 6 0V4h3"/><path d="M5 20l2-2M19 20l-2-2M12 21.5v-2"/>',
  'act-science': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M7 16l3.5-4 3 2.5L17 9"/>' + D(10.5, 12, 1) + D(13.5, 14.5, 1) + D(17, 9, 1),

  // English and writing
  'essay-writing': '<path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4"/><path d="M9 12h6M9 15h6M9 18h3.5"/>',
  'ap-lang': '<path d="M4 5.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3.5v-3.5H4z"/><path d="M20 9.5v6.5h-1v2.5l-3-2.5h-3"/><path d="M7.5 9.5h6"/>',
  'ap-lit': '<path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2zM12 6.5v14"/><path d="M15 4.8V11l1.5-1.2L18 11V4.6"/>',
  'ap-seminar': '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5l5 5"/><path d="M8.5 11h5M11 8.5v5" stroke-width="1.6"/>',
  grammar: '<path d="M5 19L10 5l5 14M7 14h6"/><path d="M17 15.5a2 2 0 1 1 0 .1zM19 13.5v6"/>',
  'act-english': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 16l4-8 4 8M9.5 13h5"/>',
  'act-reading': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h5"/>' + D(16, 15.5),
  'sat-rw': '<path d="M4 5.5h7a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H4z"/><path d="M13 7.5a2 2 0 0 1 2-2h5v13h-5"/><path d="M15.5 14.5l1.5 1.5 4-4" />',

  // History and social studies
  history: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/><path d="M3.5 12H2M22 12h-1.5"/>',
  apush: '<path d="M5 21V4"/><path d="M5 4.5h13l-2.5 3.5L18 11.5H5"/><path d="M8 7h4M8 9h4" stroke-width="1.4"/>',
  'ap-world': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/><path d="M17 4.5l2.5-1.5"/>',
  'ap-euro': '<path d="M4 20.5h16M5.5 20.5V11L8 8.5l2.5 2.5v9.5M13.5 20.5V11L16 8.5l2.5 2.5v9.5"/><path d="M10.5 14h3M8 3.5v5M16 3.5v5"/><path d="M8 3.5l2 1-2 1M16 3.5l2 1-2 1"/>',
  'ap-afam': '<path d="M12 21v-9"/><path d="M12 12c-4 0-7-2.5-7-6.5 3.5 0 7 2 7 6.5zM12 12c4 0 7-2.5 7-6.5-3.5 0-7 2-7 6.5z"/><path d="M8 21h8"/>',
  'ap-gov': '<path d="M3.5 9.5L12 4l8.5 5.5z"/><path d="M6 12v6M10 12v6M14 12v6M18 12v6M3.5 20.5h17"/>' + D(12, 7.3, 1),
  'ap-comp-gov': '<path d="M4 21V5M4 5.5h7l-1.5 2.5L11 10.5H4"/><path d="M13 21V9M13 9.5h7l-1.5 2.5 1.5 2.5h-7"/>',
  'ap-macro': '<path d="M3.5 20h17M4 20V4"/><path d="M7 16l4-4 3 2 5-6"/><path d="M15.5 8H19v3.5"/>',
  'ap-micro': '<path d="M4 4v16h16"/><path d="M6 7c4 2 7 6 12 11M6 17c4-2 7-6 12-11"/>' + D(12, 12),
  'ap-psych': '<path d="M15 20.5v-3h2.5a1.5 1.5 0 0 0 1.5-1.5v-2.5l1.5-.5-1.5-3.5A7 7 0 0 0 5.5 9c0 2.5 1 4 2.5 5.5v6"/><path d="M11 8.5a2 2 0 0 1 3 2c0 1.5-1.5 1.5-1.5 3"/>' + D(12.5, 15.8, 1),
  'ap-hug': '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.5"/>',

  // Computer science
  'ap-csa': '<path d="M7 5.5c-1.5 0-2 .8-2 2v2.5c0 1-.7 2-1.5 2 .8 0 1.5 1 1.5 2v2.5c0 1.2.5 2 2 2M17 5.5c1.5 0 2 .8 2 2v2.5c0 1 .7 2 1.5 2-.8 0-1.5 1-1.5 2v2.5c0 1.2-.5 2-2 2"/>' + D(9.5, 12) + D(12, 12) + D(14.5, 12),
  'ap-csp': '<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="4" height="4" fill="currentColor" stroke="none"/><path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"/>',

  // Arts and languages
  'ap-art-history': '<rect x="4" y="4" width="16" height="16" rx="1"/><rect x="7" y="7" width="10" height="10"/><path d="M7 15l3-3 2 2 2-3 3 4"/>' + D(10, 9.5, 1),
  'ap-music-theory': '<path d="M3 7h18M3 10.5h18M3 14h18" stroke-width="1.2"/><ellipse cx="9" cy="17" rx="2.3" ry="1.7" fill="currentColor" transform="rotate(-20 9 17)"/><path d="M11.1 16.3V5l4 1.5"/>',
  'ap-art-design': '<path d="M19 4.5c-2 1-7 6.5-8.5 9l1.5 1.5c2.5-1.5 8-6.5 9-8.5z"/><path d="M10.5 13.5c-2 0-3.5 1.5-3.5 3.5 0 1.5-1 2.5-3 3 4 1 8 0 8-5"/>',
  'ap-world-languages': '<path d="M4 5h9v7H8l-3 2.5V12H4z"/><path d="M15 9h5v7h-1v2.5L16 16h-3.5v-2"/><path d="M6.5 8.5h4"/>' + D(15.5, 12.5, .9) + D(17.5, 12.5, .9),

  // Study skills and test prep
  'how-to-learn': '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z"/><path d="M12 7v3.5"/>' + D(12, 12.5, .9),
  'test-strategy': '<path d="M3.5 7l4-2.5 4 2.5 4-2.5 4 2.5v12.5l-4-2.5-4 2.5-4-2.5-4 2.5z"/><path d="M7 14.5c2-0 2.5-4 5-4s2 3 4.5 3"/><path d="M14.5 11.5l2 2M16.5 11.5l-2 2" stroke-width="1.6"/>',
};

export const COURSE_ICON_IDS = Object.keys(COURSE_ICONS);
