import { deriveTopicStatus } from '../engine/mastery-rules.js';
import { fetchJson } from '../engine/safe-fetch.js';
import { renderErrorScreen } from '../widgets/error-screen.js';

const NODE_CONTENT = {
  mastered: () => '✓',
  needsAttention: () => '!',
  notStarted: (n) => n,
  inProgress: () => '▶',
};

function nodeStatus(attempts) {
  if (!attempts || attempts.length === 0) return 'notStarted';
  return deriveTopicStatus(attempts);
}

export async function renderSubject(root, { store, router, subjectId }) {
  let subjects;
  let topics;
  try {
    subjects = await fetchJson('js/content/subjects.json');
    topics = await fetchJson(`js/content/${subjectId}/index.json`);
  } catch {
    renderErrorScreen(root, { router, message: "Hmm, that subject couldn't be loaded. Let's go back and try again." });
    return;
  }
  const subject = subjects.find((s) => s.id === subjectId);
  const record = store.load();

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `<div class="app-brand">${subject?.displayName ?? subjectId}</div>`;
  root.appendChild(header);

  const card = document.createElement('div');
  card.className = 'card';

  if (topics.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'More topics for this subject are coming soon!';
    card.appendChild(empty);
  } else {
    const path = document.createElement('div');
    path.className = 'topic-path';
    topics.forEach((topic, i) => {
      const status = nodeStatus(record.topics[topic.id]?.attempts);
      const align = ['align-left', 'align-center', 'align-right'][i % 3];

      const item = document.createElement('div');
      item.className = `topic-path-item ${align}`;

      const node = document.createElement('button');
      node.type = 'button';
      node.className = `topic-node status-${status}`;
      node.textContent = NODE_CONTENT[status](i + 1);
      node.setAttribute('aria-label', topic.displayName);

      const label = document.createElement('span');
      label.className = 'topic-node-label';
      label.textContent = topic.displayName;

      const routePrefix = { reading: 'reading', 'multiplication-drill': 'tables' }[topic.kind] ?? 'topic';
      const go = () => router.navigate(`/${routePrefix}/${subjectId}/${topic.id}`);
      node.addEventListener('click', go);
      label.addEventListener('click', go);
      label.style.cursor = 'pointer';

      item.append(node, label);
      path.appendChild(item);
    });
    card.appendChild(path);
  }

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'button secondary';
  backButton.style.marginTop = 'var(--space-2)';
  backButton.textContent = 'Back to home';
  backButton.addEventListener('click', () => router.navigate('/home'));
  card.appendChild(backButton);

  root.appendChild(card);
}
