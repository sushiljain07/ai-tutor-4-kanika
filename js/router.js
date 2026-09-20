function parsePattern(pattern) {
  return pattern.split('/').filter(Boolean);
}

function matchRoute(pattern, path) {
  const patternParts = parsePattern(pattern);
  const pathParts = parsePattern(path);
  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];
    if (part.startsWith(':')) {
      params[part.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (part !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function createRouter(rootElement) {
  const routes = [];

  function register(pattern, handler) {
    routes.push({ pattern, handler });
  }

  function resolve() {
    const path = location.hash.replace(/^#/, '') || '/home';
    for (const { pattern, handler } of routes) {
      const params = matchRoute(pattern, path);
      if (params) {
        rootElement.innerHTML = '';
        rootElement.classList.remove('route-enter');
        void rootElement.offsetWidth;
        rootElement.classList.add('route-enter');
        handler(params, rootElement);
        return;
      }
    }
  }

  function navigate(path) {
    location.hash = path;
  }

  function start() {
    window.addEventListener('hashchange', resolve);
    if (!location.hash) {
      location.hash = '/home'; // triggers exactly one hashchange -> resolve(), listener is already attached
    } else {
      resolve(); // hash already set, so no hashchange event will fire — resolve once, manually
    }
  }

  return { register, start, navigate };
}
