import { renderQuestionCard } from './question-card.js';
import { sampleQuickChallenge } from '../engine/quick-challenge.js';
import { say } from '../engine/tutor-character.js';
import { LEARNER_NAME } from '../config.js';
import { playCorrectSound } from '../engine/sound.js';
import { fetchJson } from '../engine/safe-fetch.js';
import { renderErrorScreen } from '../widgets/error-screen.js';
import { icon } from '../widgets/ui-icons.js';

const RECENT_IDS_KEY = 'kanika-tutor:quick-challenge:recent-ids';

function readRecentlySeenIds() {
  try {
    return JSON.parse(sessionStorage.getItem(RECENT_IDS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeRecentlySeenIds(ids) {
  try {
    sessionStorage.setItem(RECENT_IDS_KEY, JSON.stringify(ids));
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — repeats are a
    // tolerated fallback, not a hard requirement.
  }
}

const RESULT_MESSAGES = [
  { min: 1, message: 'Perfect round! Every single answer was spot on!' },
  { min: 0.75, message: "Fantastic! You're getting really strong at this!" },
  { min: 0.5, message: 'Nice effort! A little more practice and this will be easy.' },
  { min: 0, message: "Great try! Let's practice a bit more and come back stronger." },
];

export async function renderQuickChallenge(root, { store, router }) {
  const record = store.load();
  const openedTopicIds = Object.keys(record.topics).filter((id) => record.topics[id].attempts.length > 0);

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `<div class="app-brand">${icon('bolt', 26)} Quick Challenge</div>`;
  root.appendChild(header);

  if (openedTopicIds.length === 0) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<p>${say(`Let's practice a topic first, ${LEARNER_NAME}, then Quick Challenge will have questions ready for you!`)}</p>`;
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button';
    backButton.textContent = 'Back to home';
    backButton.addEventListener('click', () => router.navigate('/home'));
    card.appendChild(backButton);
    root.appendChild(card);
    return;
  }

  let subjects;
  const topicsWithQuestions = [];
  try {
    subjects = await fetchJson('js/content/subjects.json');
    for (const subject of subjects) {
      const index = await fetchJson(`js/content/${subject.id}/index.json`);
      for (const entry of index) {
        if (!openedTopicIds.includes(entry.id)) continue;
        const topic = await fetchJson(`js/content/${subject.id}/${entry.id}.json`);
        topicsWithQuestions.push(topic);
      }
    }
  } catch {
    renderErrorScreen(root, { router, message: "Hmm, the challenge couldn't be put together. Let's try again." });
    return;
  }

  const previouslySeenIds = readRecentlySeenIds();
  const questions = sampleQuickChallenge(openedTopicIds, topicsWithQuestions, 5, previouslySeenIds);
  writeRecentlySeenIds(questions.map((q) => q.id));
  const session = { correctFirstTry: 0, total: questions.length };
  showQuestionAt(0);

  function showQuestionAt(index) {
    if (index >= questions.length) {
      showComplete();
      return;
    }
    const question = questions[index];
    renderQuestionCard(root, {
      question,
      topicId: question.topicId,
      store,
      progressLabelText: `Quick Challenge — question ${index + 1} of ${questions.length}`,
      onAnswered({ correct, hintLevelUsed }) {
        if (correct && hintLevelUsed === 0) session.correctFirstTry += 1;
      },
      renderNextAction(actions) {
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'button';
        nextButton.textContent = index + 1 < questions.length ? 'Next question' : 'See my results';
        nextButton.addEventListener('click', () => showQuestionAt(index + 1));
        actions.appendChild(nextButton);
      },
    });
  }

  function showComplete() {
    root.innerHTML = '';
    root.appendChild(header);
    const card = document.createElement('div');
    card.className = 'card';

    const ratio = session.total > 0 ? session.correctFirstTry / session.total : 0;
    const resultMessage = RESULT_MESSAGES.find((r) => ratio >= r.min).message;

    card.innerHTML = `
      <p style="text-align:center; font-size: 48px; margin-bottom: 0;">🏆</p>
      <h1 style="text-align:center;">Challenge Complete!</h1>
      <p style="text-align:center; font-size: 20px; font-weight: 700;">
        ${session.correctFirstTry} / ${session.total} correct on the first try
      </p>
      <p class="feedback-success" style="text-align:center;">${say(`${LEARNER_NAME}, ${resultMessage}`)}</p>
    `;
    if (store.isSoundEnabled()) playCorrectSound();

    const againButton = document.createElement('button');
    againButton.type = 'button';
    againButton.className = 'button';
    againButton.textContent = 'Play again';
    againButton.addEventListener('click', () => renderQuickChallenge(root, { store, router }));
    card.appendChild(againButton);

    const homeButton = document.createElement('button');
    homeButton.type = 'button';
    homeButton.className = 'button secondary';
    homeButton.style.marginLeft = '8px';
    homeButton.textContent = 'Back to home';
    homeButton.addEventListener('click', () => router.navigate('/home'));
    card.appendChild(homeButton);

    root.appendChild(card);
  }
}
