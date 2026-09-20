export function createStarBurst(container) {
  const burst = document.createElement('span');
  burst.className = 'star-burst-wrap';
  const angles = [-40, -15, 10, 35, 60];
  angles.forEach((angle, i) => {
    const star = document.createElement('span');
    star.className = 'star-burst-particle';
    star.textContent = '⭐';
    star.style.setProperty('--angle', `${angle}deg`);
    star.style.animationDelay = `${i * 30}ms`;
    burst.appendChild(star);
  });
  container.appendChild(burst);
  setTimeout(() => burst.remove(), 900);
}
