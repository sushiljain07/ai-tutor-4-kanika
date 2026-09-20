import { say } from '../engine/tutor-character.js';
import { LEARNER_NAME } from '../config.js';
import { deriveTopicStatus } from '../engine/mastery-rules.js';
import { mascotSVG } from '../widgets/mascot.js';
import { subjectIconSVG } from '../widgets/subject-icons.js';
import { fetchJson } from '../engine/safe-fetch.js';
import { renderErrorScreen } from '../widgets/error-screen.js';

const SUBJECT_ACCENTS = {
  math: { color: 'var(--color-accent-math)', dark: 'var(--color-accent-math-dark)', tint: 'var(--color-accent-math-tint)' },
  english: { color: 'var(--color-accent-english)', dark: 'var(--color-accent-english-dark)', tint: 'var(--color-accent-english-tint)' },
  'computer-studies': {
    color: 'var(--color-accent-computer)',
    dark: 'var(--color-accent-computer-dark)',
    tint: 'var(--color-accent-computer-tint)',
  },
};

export async function renderHome(root, { store, router }) {
  const record = store.load();
  let subjects;
  try {
    subjects = await fetchJson('js/content/subjects.json');
  } catch {
    renderErrorScreen(root, { router, message: "Hmm, the home screen couldn't load its subjects. Let's try reloading." });
    return;
  }

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="app-brand">${mascotSVG(28)} ${LEARNER_NAME}'s Learning Buddy</div>
    <button type="button" class="icon-link" aria-label="Parent view">👪</button>
  `;
  header.querySelector('.icon-link').addEventListener('click', () => router.navigate('/parent'));
  root.appendChild(header);

  const hero = document.createElement('section');
  hero.className = 'card hero-card';
  hero.innerHTML = `
    <div class="tutor-message">
      <div class="tutor-avatar tutor-avatar-lg">${mascotSVG(64)}</div>
      <div class="speech-bubble">
        <p class="tutor-line">${say(`Good day, ${LEARNER_NAME}! Ready for a fun learning adventure?`)}</p>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-pill">⭐ <strong>${record.stars}</strong> stars</div>
      <div class="stat-pill">🔥 <strong>${record.streak.count}</strong> day streak</div>
    </div>
  `;
  root.appendChild(hero);

  const mission = await buildMission(subjects, record);
  const missionButton = document.createElement('button');
  missionButton.type = 'button';
  missionButton.className = 'mission-card';
  missionButton.innerHTML = `
    <span class="mission-label">Today's mission</span>
    <span class="mission-title">${mission.title}</span>
    <span class="mission-arrow">→</span>
  `;
  missionButton.addEventListener('click', () => router.navigate(mission.path));
  root.appendChild(missionButton);

  const sectionHeading = document.createElement('h2');
  sectionHeading.className = 'section-heading';
  sectionHeading.textContent = 'Choose a subject';
  root.appendChild(sectionHeading);

  const grid = document.createElement('div');
  grid.className = 'subject-grid';
  for (const subject of subjects) {
    const masteredCount = await countMastered(subject.id, record);
    const accent = SUBJECT_ACCENTS[subject.id] ?? SUBJECT_ACCENTS.math;
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'subject-tile';
    tile.style.setProperty('--tile-accent', accent.color);
    tile.style.setProperty('--tile-accent-dark', accent.dark);
    tile.style.setProperty('--tile-tint', accent.tint);
    tile.innerHTML = `
      <span class="subject-icon">${subjectIconSVG(subject.id)}</span>
      <span class="subject-name">${subject.displayName}</span>
      <span class="subject-meta">${masteredCount > 0 ? `${masteredCount} mastered` : "Let's begin"}</span>
    `;
    tile.addEventListener('click', () => router.navigate(`/subject/${subject.id}`));
    grid.appendChild(tile);
  }
  root.appendChild(grid);

  async function buildMission(subjects, record) {
    const openedCount = Object.keys(record.topics).filter((id) => record.topics[id].attempts.length > 0).length;
    try {
      for (const subject of subjects) {
        const topics = await fetchJson(`js/content/${subject.id}/index.json`);
        for (const topic of topics) {
          const status = deriveTopicStatus(record.topics[topic.id]?.attempts ?? []);
          if (status !== 'mastered') {
            return { title: `Practice ${topic.displayName}`, path: `/topic/${subject.id}/${topic.id}` };
          }
        }
      }
    } catch {
      return { title: 'Choose a subject to begin', path: '/home' };
    }
    if (openedCount >= 2) return { title: 'Take a Quick Challenge', path: '/quick-challenge' };
    return { title: 'You are all caught up!', path: '/home' };
  }

  async function countMastered(subjectId, record) {
    try {
      const topics = await fetchJson(`js/content/${subjectId}/index.json`);
      return topics.filter((t) => deriveTopicStatus(record.topics[t.id]?.attempts ?? []) === 'mastered').length;
    } catch {
      return 0;
    }
  }
}
