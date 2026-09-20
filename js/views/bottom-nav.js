import { icon } from '../widgets/ui-icons.js';

const ITEMS = [
  { path: '/home', icon: 'home', label: 'Home' },
  { path: '/quick-challenge', icon: 'bolt', label: 'Challenge' },
  { path: '/parent', icon: 'parent', label: 'Parent' },
];

export function renderBottomNav(container, router) {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';

  const buttons = ITEMS.map((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bottom-nav-item';
    button.innerHTML = `<span class="bottom-nav-icon">${icon(item.icon, 26)}</span><span>${item.label}</span>`;
    button.addEventListener('click', () => router.navigate(item.path));
    nav.appendChild(button);
    return { button, path: item.path };
  });

  function updateActive() {
    const current = location.hash.replace(/^#/, '') || '/home';
    buttons.forEach(({ button, path }) => {
      button.classList.toggle('active', current === path);
    });
  }

  window.addEventListener('hashchange', updateActive);
  updateActive();

  container.appendChild(nav);
}
