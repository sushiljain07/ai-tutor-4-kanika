import { createHintFlow, HINT_STAGE } from '../engine/hint-flow.js';
import { createNumberLine } from '../widgets/number-line.js';
import { say } from '../engine/tutor-character.js';
import { LEARNER_NAME } from '../config.js';
import { mascotSVG } from '../widgets/mascot.js';
import { createStarBurst } from '../widgets/star-burst.js';
import { isReadAloudSupported, speakPassage } from '../voice/read-aloud.js';
import { playCorrectSound, playIncorrectSound } from '../engine/sound.js';
import { icon } from '../widgets/ui-icons.js';

export function renderQuestionCard(root, { question, topicId, store, progressLabelText, renderNextAction, onAnswered }) {
  root.innerHTML = '';
  const hintFlow = createHintFlow();
  const card = document.createElement('div');
  card.className = 'card';

  if (progressLabelText) {
    const progressLabel = document.createElement('div');
    progressLabel.className = 'progress-label';
    progressLabel.textContent = progressLabelText;
    card.appendChild(progressLabel);
  }

  const tutorMsg = document.createElement('div');
  tutorMsg.className = 'tutor-message';
  const avatar = document.createElement('div');
  avatar.className = 'tutor-avatar';
  avatar.innerHTML = mascotSVG(48);
  const promptText = document.createElement('p');
  promptText.className = 'tutor-line';
  promptText.textContent = say(question.prompt);

  if (isReadAloudSupported()) {
    const readAloudButton = document.createElement('button');
    readAloudButton.type = 'button';
    readAloudButton.className = 'read-aloud-inline';
    readAloudButton.setAttribute('aria-label', 'Read the question aloud');
    readAloudButton.innerHTML = icon('speaker', 20);
    readAloudButton.addEventListener('click', () => speakPassage(question.prompt));
    promptText.appendChild(readAloudButton);
  }

  tutorMsg.append(avatar, promptText);
  card.appendChild(tutorMsg);

  if (question.visualEmoji) {
    const visual = document.createElement('div');
    visual.className = 'question-visual';
    visual.textContent = question.visualEmoji;
    visual.setAttribute('aria-hidden', 'true');
    card.appendChild(visual);
  }

  let getAnswer = () => null;

  if (question.widget?.type === 'number-line') {
    const numberLine = createNumberLine(card, question.widget);
    getAnswer = () => String(numberLine.getValue());
  } else if (question.options) {
    const grid = document.createElement('div');
    grid.className = 'button-grid';
    // Content authors often list the correct answer first; shuffle at render
    // time so the correct option isn't predictably in the same position.
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    shuffledOptions.forEach((option) => {
      const optionButton = document.createElement('button');
      optionButton.type = 'button';
      optionButton.className = 'button secondary';
      optionButton.textContent = option;
      optionButton.addEventListener('click', () => {
        getAnswer = () => option;
        submit();
      });
      grid.appendChild(optionButton);
    });
    card.appendChild(grid);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your answer';
    // Every free-text question in this app's content is a numeric answer
    // (word problems, division, multi-digit multiplication) — a numeric
    // keypad on mobile is a real usability win for a young child typing
    // numbers, and there's no current content this would be wrong for.
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submit();
    });
    card.appendChild(input);
    getAnswer = () => input.value.trim();
    requestAnimationFrame(() => input.focus());
  }

  const hintArea = document.createElement('div');
  hintArea.setAttribute('aria-live', 'polite');
  card.appendChild(hintArea);
  const feedbackArea = document.createElement('div');
  feedbackArea.setAttribute('aria-live', 'polite');
  card.appendChild(feedbackArea);

  const actionRow = document.createElement('div');
  actionRow.style.marginTop = 'var(--space-2)';

  if (!question.options) {
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.className = 'button';
    submitButton.textContent = 'Check my answer';
    submitButton.addEventListener('click', submit);
    actionRow.appendChild(submitButton);
  }

  const explainButton = document.createElement('button');
  explainButton.type = 'button';
  explainButton.className = 'button secondary';
  explainButton.style.marginLeft = question.options ? '0' : '8px';
  explainButton.textContent = 'Show me how to solve it';
  explainButton.addEventListener('click', () => {
    hintFlow.requestExplanation();
    finishIncorrect();
  });
  actionRow.appendChild(explainButton);
  card.appendChild(actionRow);

  root.appendChild(card);

  function submit() {
    const answer = getAnswer();
    if (answer === null || answer === '') return;
    const isCorrect = String(answer).trim() === String(question.correctAnswer).trim();
    if (isCorrect) {
      finishCorrect();
      return;
    }
    if (store.isSoundEnabled()) playIncorrectSound();
    hintFlow.onIncorrectAnswer();
    if (hintFlow.stage === HINT_STAGE.EXPLANATION) {
      finishIncorrect();
    } else {
      showHint();
    }
  }

  function showHint() {
    const text = hintFlow.stage === HINT_STAGE.SMALL ? question.hints.small : question.hints.big;
    hintArea.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'hint-box';
    box.textContent = say(text);
    hintArea.appendChild(box);
  }

  function recordAttempt(correct) {
    const hintLevelUsed = Math.min(hintFlow.stage, 2);
    store.recordAttempt(topicId, {
      correct,
      hintLevelUsed,
      ...(question.skillTag ? { skillTag: question.skillTag } : {}),
    });
    onAnswered?.({ correct, hintLevelUsed });
  }

  function finishCorrect() {
    recordAttempt(true);
    if (store.isSoundEnabled()) playCorrectSound();
    feedbackArea.innerHTML = '';
    const message = document.createElement('p');
    message.className = 'feedback-success';
    message.innerHTML = `<span class="star-burst">${icon('star', 22)}</span> ${say(`Great job, ${LEARNER_NAME}! Keep it up!`)}`;
    feedbackArea.appendChild(message);
    createStarBurst(message.querySelector('.star-burst'));
    disableInputs();
    showNext();
  }

  function finishIncorrect() {
    recordAttempt(false);
    hintArea.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'hint-box';
    const list = document.createElement('ol');
    list.className = 'explanation-steps';
    question.explanationSteps.forEach((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      list.appendChild(item);
    });
    box.appendChild(list);
    hintArea.appendChild(box);

    feedbackArea.innerHTML = '';
    const message = document.createElement('p');
    message.textContent = say(`That's a tricky one, ${LEARNER_NAME} — but now you know how it works!`);
    feedbackArea.appendChild(message);

    disableInputs();
    showNext();
  }

  function disableInputs() {
    card.querySelectorAll('button, input').forEach((el) => {
      el.disabled = true;
    });
  }

  function showNext() {
    const actions = document.createElement('div');
    actions.style.marginTop = 'var(--space-2)';
    renderNextAction(actions);
    card.appendChild(actions);
  }
}
