const ICONS = {
  math: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="9" width="28" height="22" rx="4"/>
    <path d="M13 16h4M13 22h4M23 16h4M23 22h4M20 9v22"/>
  </svg>`,
  english: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 12c-3-3-9-4-13-2v20c4-2 10-1 13 2 3-3 9-4 13-2V10c-4-2-10-1-13 2z"/>
    <path d="M20 12v20"/>
  </svg>`,
  'computer-studies': `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="8" width="28" height="18" rx="3"/>
    <path d="M15 32h10M20 26v6"/>
  </svg>`,
};

export function subjectIconSVG(subjectId) {
  return ICONS[subjectId] ?? ICONS.math;
}
