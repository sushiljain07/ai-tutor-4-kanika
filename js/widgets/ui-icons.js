const ICONS = {
  home: `<path d="M6 18 20 7l14 11"/><path d="M9 16v15h22V16"/><path d="M17 31v-9h6v9"/>`,
  bolt: `<path d="M22 5 9 22h9l-3 13 15-19h-9z" stroke-linejoin="round"/>`,
  parent: `<circle cx="15" cy="12" r="4.5"/><circle cx="26" cy="15" r="3.5"/><path d="M6 33v-2c0-4.5 4-8 9-8s9 3.5 9 8v2"/><path d="M22 25c4.5.5 8 3 8 6.5V33"/>`,
  star: `<path d="M20 6l4.2 8.9 9.8 1.3-7.1 6.8 1.8 9.7L20 27.8 11.3 32.7l1.8-9.7-7.1-6.8 9.8-1.3z" fill="currentColor" stroke="none" stroke-linejoin="round"/>`,
  flame: `<path d="M20 4c1 6-6 8-6 14a6 6 0 0 0 12 0c0-2-1-3-2-4 1 4-1 6-2 6-2 0-2-2-1-4 1-3-1-5-1-8-3 2-5 5-5 9a7 7 0 0 0 14 0C29 10 24 8 20 4z" fill="currentColor" stroke="none" stroke-linejoin="round"/>`,
  speaker: `<path d="M6 15v10h7l9 7V8l-9 7z" stroke-linejoin="round"/><path d="M27 14a8 8 0 0 1 0 12M31 10a13 13 0 0 1 0 20"/>`,
  mic: `<rect x="15" y="5" width="10" height="18" rx="5"/><path d="M10 18a10 10 0 0 0 20 0"/><path d="M20 28v7M14 35h12"/>`,
  stop: `<rect x="10" y="10" width="20" height="20" rx="3"/>`,
  book: `<path d="M20 12c-3-3-9-4-13-2v20c4-2 10-1 13 2 3-3 9-4 13-2V10c-4-2-10-1-13 2z"/><path d="M20 12v20"/>`,
  cards: `<rect x="8" y="12" width="18" height="22" rx="3"/><rect x="14" y="6" width="18" height="22" rx="3" fill="var(--color-surface, #fff)"/>`,
  quiz: `<rect x="8" y="6" width="24" height="28" rx="3"/><path d="M14 15h12M14 21h12M14 27h7"/>`,
};

export function icon(name, size = 24) {
  const body = ICONS[name] ?? '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">${body}</svg>`;
}
