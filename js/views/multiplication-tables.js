import { renderQuestionCard } from './question-card.js';
import { deriveTopicStatus } from '../engine/mastery-rules.js';
import { say } from '../engine/tutor-character.js';
import { LEARNER_NAME } from '../config.js';
import { createStarBurst } from '../widgets/star-burst.js';
import { renderExplanationBlock } from '../widgets/explanation-block.js';
import { playCorrectSound } from '../engine/sound.js';
import { fetchJson } from '../engine/safe-fetch.js';
import { renderErrorScreen } from '../widgets/error-screen.js';
import { icon } from '../widgets/ui-icons.js';

function progressKey(number) {
  return `multiplication-tables:${number}`;
}

function generateDistractors(correct, step) {
  const candidates = [correct - step, correct + step, correct + 2 * step, correct - 2 * step, correct + 1, correct - 1];
  const unique = [...new Set(candidates.filter((n) => n > 0 && n !== correct))];
  return unique.slice(0, 3).map(String);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function renderGroupVisual(number, factor) {
  const wrapper = document.createElement('div');
  wrapper.className = 'group-visual';
  for (let g = 0; g < factor; g++) {
    const group = document.createElement('div');
    group.className = 'group-visual-group';
    if (number <= 10) {
      for (let d = 0; d < number; d++) {
        const dot = document.createElement('span');
        dot.className = 'group-visual-dot';
        group.appendChild(dot);
      }
    } else {
      group.classList.add('group-visual-group-label');
      group.textContent = number;
    }
    wrapper.appendChild(group);
  }
  return wrapper;
}

function buildQuizQuestion(table, fact) {
  const correct = fact.answer;
  const options = shuffle([String(correct), ...generateDistractors(correct, table.number)]);
  return {
    id: `mt-${table.number}-${fact.factor}`,
    prompt: `What is ${table.number} x ${fact.factor}?`,
    options,
    correctAnswer: String(correct),
    hints: {
      small: table.trick,
      big: `Count up in ${table.number}s: ${Array.from({ length: fact.factor }, (_, i) => table.number * (i + 1)).join(', ')}.`,
    },
    explanationSteps: [
      `${table.number} x ${fact.factor} means adding ${table.number} together ${fact.factor} times.`,
      `Counting up in ${table.number}s ${fact.factor} times lands on ${correct}.`,
      `So ${table.number} x ${fact.factor} = ${correct}.`,
    ],
  };
}

export async function renderMultiplicationTables(root, { store, router, subjectId, topicId }) {
  let topic;
  try {
    topic = await fetchJson(`js/content/${subjectId}/${topicId}.json`);
  } catch {
    renderErrorScreen(root, { router, message: "Hmm, the tables couldn't be loaded. Let's go back and try again." });
    return;
  }
  const record = store.load();
  renderPicker();

  function renderPicker() {
    root.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    const heading = document.createElement('h1');
    heading.textContent = topic.displayName;
    card.appendChild(heading);

    renderExplanationBlock(card, topic.explanation);

    const sub = document.createElement('h2');
    sub.className = 'section-heading';
    sub.textContent = 'Pick a table to practice';
    card.appendChild(sub);

    const grid = document.createElement('div');
    grid.className = 'button-grid';
    topic.tables.forEach((table) => {
      const status = deriveTopicStatus(record.topics[progressKey(table.number)]?.attempts ?? []);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button secondary';
      button.textContent = status === 'mastered' ? `${table.number}x ✅` : `${table.number}x`;
      button.addEventListener('click', () => renderTable(table));
      grid.appendChild(button);
    });
    card.appendChild(grid);

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button secondary';
    backButton.style.marginTop = 'var(--space-2)';
    backButton.textContent = 'Back to subject';
    backButton.addEventListener('click', () => router.navigate(`/subject/${subjectId}`));
    card.appendChild(backButton);

    root.appendChild(card);
  }

  function renderTable(table) {
    root.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h1>Table of ${table.number}</h1>`;

    const trickBox = document.createElement('div');
    trickBox.className = 'hint-box';
    trickBox.textContent = say(table.trick);
    card.appendChild(trickBox);

    const drillButton = document.createElement('button');
    drillButton.type = 'button';
    drillButton.className = 'button';
    drillButton.innerHTML = `${icon('cards', 18)} Flashcard drill`;
    drillButton.addEventListener('click', () => renderDrill(table, 0));
    card.appendChild(drillButton);

    const quizButton = document.createElement('button');
    quizButton.type = 'button';
    quizButton.className = 'button secondary';
    quizButton.style.marginLeft = '8px';
    quizButton.innerHTML = `${icon('quiz', 18)} Quiz me`;
    quizButton.addEventListener('click', () => renderQuiz(table, shuffle(table.facts).slice(0, 4), 0));
    card.appendChild(quizButton);

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button secondary';
    backButton.style.marginLeft = '8px';
    backButton.textContent = 'Back to tables';
    backButton.addEventListener('click', renderPicker);
    card.appendChild(backButton);

    root.appendChild(card);
  }

  function renderDrill(table, index) {
    root.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';

    if (index >= table.facts.length) {
      card.innerHTML = `<p class="feedback-success"><span class="star-burst">${icon('star', 22)}</span> ${say(`Amazing work, ${LEARNER_NAME}! You drilled the whole table of ${table.number}!`)}</p>`;
      createStarBurst(card.querySelector('.star-burst'));
      if (store.isSoundEnabled()) playCorrectSound();
      const doneButton = document.createElement('button');
      doneButton.type = 'button';
      doneButton.className = 'button';
      doneButton.textContent = 'Back to table';
      doneButton.addEventListener('click', () => renderTable(table));
      card.appendChild(doneButton);
      root.appendChild(card);
      return;
    }

    const fact = table.facts[index];
    const progressLabel = document.createElement('div');
    progressLabel.className = 'progress-label';
    progressLabel.textContent = `Flashcard ${index + 1} of ${table.facts.length} — Table of ${table.number}`;
    card.appendChild(progressLabel);

    const questionEl = document.createElement('p');
    questionEl.className = 'tutor-line';
    questionEl.textContent = `${table.number} x ${fact.factor} = ?`;
    card.appendChild(questionEl);

    card.appendChild(renderGroupVisual(table.number, fact.factor));

    const revealArea = document.createElement('div');
    revealArea.setAttribute('aria-live', 'polite');
    card.appendChild(revealArea);

    const revealButton = document.createElement('button');
    revealButton.type = 'button';
    revealButton.className = 'button secondary';
    revealButton.textContent = 'Reveal answer';
    revealButton.addEventListener('click', () => {
      revealArea.innerHTML = `<div class="hint-box">${table.number} x ${fact.factor} = <strong>${fact.answer}</strong></div>`;
    });
    card.appendChild(revealButton);

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'button';
    nextButton.style.marginLeft = '8px';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => renderDrill(table, index + 1));
    card.appendChild(nextButton);

    root.appendChild(card);
  }

  function renderQuiz(table, facts, index) {
    if (index >= facts.length) {
      root.innerHTML = '';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<p class="feedback-success"><span class="star-burst">${icon('star', 22)}</span> ${say(`Well done, ${LEARNER_NAME}! Quiz complete for the table of ${table.number}!`)}</p>`;
      createStarBurst(card.querySelector('.star-burst'));
      if (store.isSoundEnabled()) playCorrectSound();
      const doneButton = document.createElement('button');
      doneButton.type = 'button';
      doneButton.className = 'button';
      doneButton.textContent = 'Back to table';
      doneButton.addEventListener('click', () => renderTable(table));
      card.appendChild(doneButton);
      root.appendChild(card);
      return;
    }

    const question = buildQuizQuestion(table, facts[index]);
    renderQuestionCard(root, {
      question,
      topicId: progressKey(table.number),
      store,
      progressLabelText: `Quiz ${index + 1} of ${facts.length} — Table of ${table.number}`,
      renderNextAction(actions) {
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'button';
        nextButton.textContent = index + 1 < facts.length ? 'Next question' : 'Finish quiz';
        nextButton.addEventListener('click', () => renderQuiz(table, facts, index + 1));
        actions.appendChild(nextButton);
      },
    });
  }
}
