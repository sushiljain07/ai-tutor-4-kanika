const PARTS = [
  {
    id: 'monitor',
    label: 'Monitor',
    description: 'Shows pictures and words so we can see what the computer is doing.',
    shape: '<rect x="70" y="20" width="160" height="110" rx="8" fill="var(--color-surface-alt)" stroke="var(--color-primary)" stroke-width="3"/><rect x="85" y="35" width="130" height="80" rx="4" fill="var(--color-surface)"/>',
    hotspot: { x: 150, y: 75 },
  },
  {
    id: 'cabinet',
    label: 'Cabinet (CPU)',
    description: 'The box that holds the computer\'s "brain" and keeps the important parts safe.',
    shape: '<rect x="245" y="20" width="55" height="150" rx="6" fill="var(--color-surface-alt)" stroke="var(--color-primary)" stroke-width="3"/>',
    hotspot: { x: 272, y: 95 },
  },
  {
    id: 'keyboard',
    label: 'Keyboard',
    description: 'Lets us type letters, numbers, and symbols into the computer.',
    shape: '<rect x="55" y="150" width="150" height="40" rx="6" fill="var(--color-surface-alt)" stroke="var(--color-primary)" stroke-width="3"/>',
    hotspot: { x: 130, y: 170 },
  },
  {
    id: 'mouse',
    label: 'Mouse',
    description: 'We move it to point at things on the screen and click to select them.',
    shape: '<ellipse cx="225" cy="185" rx="18" ry="26" fill="var(--color-surface-alt)" stroke="var(--color-primary)" stroke-width="3"/>',
    hotspot: { x: 225, y: 185 },
  },
];

export function createComputerDiagram(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'diagram-wrapper';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 320 220');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'A diagram of a desktop computer with its main parts');
  svg.classList.add('computer-diagram');

  const shapesHtml = PARTS.map((p) => p.shape).join('');
  svg.innerHTML = shapesHtml;

  PARTS.forEach((part) => {
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('cx', part.hotspot.x);
    marker.setAttribute('cy', part.hotspot.y);
    marker.setAttribute('r', 12);
    marker.setAttribute('class', 'diagram-hotspot');
    marker.setAttribute('tabindex', '0');
    marker.setAttribute('role', 'button');
    marker.setAttribute('aria-label', `Learn about the ${part.label}`);
    marker.addEventListener('click', () => showDescription(part));
    marker.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') showDescription(part);
    });
    svg.appendChild(marker);
  });

  const description = document.createElement('div');
  description.className = 'hint-box';
  description.textContent = 'Tap a glowing dot to learn what that part does!';

  wrapper.append(svg, description);
  container.appendChild(wrapper);

  function showDescription(part) {
    description.innerHTML = `<strong>${part.label}:</strong> ${part.description}`;
  }
}
