import { createProgressStore } from './engine/progress-store.js';
import { createRouter } from './router.js';
import { renderHome } from './views/home.js';
import { renderSubject } from './views/subject.js';
import { renderTopic } from './views/topic.js';
import { renderReadingPassage } from './views/reading-passage.js';
import { renderMultiplicationTables } from './views/multiplication-tables.js';
import { renderParent } from './views/parent.js';
import { renderQuickChallenge } from './views/quick-challenge.js';
import { renderBottomNav } from './views/bottom-nav.js';

const store = createProgressStore();
const contentRoot = document.getElementById('app-content');
const router = createRouter(contentRoot);
renderBottomNav(document.getElementById('app'), router);

router.register('/home', (params, el) => renderHome(el, { store, router }));
router.register('/subject/:subjectId', (params, el) => renderSubject(el, { store, router, ...params }));
router.register('/topic/:subjectId/:topicId', (params, el) => renderTopic(el, { store, router, ...params }));
router.register('/reading/:subjectId/:topicId', (params, el) => renderReadingPassage(el, { store, router, ...params }));
router.register('/tables/:subjectId/:topicId', (params, el) => renderMultiplicationTables(el, { store, router, ...params }));
router.register('/parent', (params, el) => renderParent(el, { store, router }));
router.register('/quick-challenge', (params, el) => renderQuickChallenge(el, { store, router }));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

router.start();
