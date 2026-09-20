export function mascotSVG(size = 56) {
  return `
<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Archana the owl tutor" class="mascot-svg">
  <ellipse cx="50" cy="60" rx="36" ry="32" fill="var(--color-primary)"/>
  <ellipse cx="50" cy="68" rx="20" ry="16" fill="var(--color-mascot-belly)"/>
  <path d="M20 32 Q28 10 42 24 Z" fill="var(--color-primary-dark)"/>
  <path d="M80 32 Q72 10 58 24 Z" fill="var(--color-primary-dark)"/>
  <circle cx="36" cy="50" r="16" fill="white"/>
  <circle cx="64" cy="50" r="16" fill="white"/>
  <circle cx="36" cy="50" r="7" fill="var(--color-text)"/>
  <circle cx="64" cy="50" r="7" fill="var(--color-text)"/>
  <circle cx="38.5" cy="47.5" r="2.4" fill="white"/>
  <circle cx="66.5" cy="47.5" r="2.4" fill="white"/>
  <circle cx="22" cy="62" r="6" fill="#ff9d9d" opacity="0.7"/>
  <circle cx="78" cy="62" r="6" fill="#ff9d9d" opacity="0.7"/>
  <path d="M45 63 L50 70 L55 63 Z" fill="#f5a623"/>
  <ellipse cx="14" cy="64" rx="9" ry="16" fill="var(--color-primary-dark)"/>
  <ellipse cx="86" cy="64" rx="9" ry="16" fill="var(--color-primary-dark)"/>
</svg>`.trim();
}
