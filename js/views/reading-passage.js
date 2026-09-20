import { renderQuestionCard } from './question-card.js';
import { isReadAloudSupported, speakPassage, stopSpeaking } from '../voice/read-aloud.js';
import { isReadItYourselfSupported, startListening, compareReadAttempt } from '../voice/read-it-yourself.js';
import { say } from '../engine/tutor-character.js';
import { LEARNER_NAME } from '../config.js';
import { renderExplanationBlock } from '../widgets/explanation-block.js';
import { playCorrectSound, playIncorrectSound } from '../engine/sound.js';
import { fetchJson } from '../engine/safe-fetch.js';
import { renderErrorScreen } from '../widgets/error-screen.js';
import { icon } from '../widgets/ui-icons.js';

export async function renderReadingPassage(root, { store, router, subjectId, topicId }) {
  let topic;
  try {
    topic = await fetchJson(`js/content/${subjectId}/${topicId}.json`);
  } catch {
    renderErrorScreen(root, { router, message: "Hmm, that story couldn't be loaded. Let's go back and try another one." });
    return;
  }
  showLibrary();

  function showLibrary() {
    root.innerHTML = '';
    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `<div class="app-brand">${icon('book', 26)} Story Library</div>`;
    root.appendChild(header);

    const intro = document.createElement('div');
    intro.className = 'card';
    renderExplanationBlock(intro, topic.explanation);
    root.appendChild(intro);

    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.style.marginTop = '0';
    heading.textContent = `Pick a story, ${LEARNER_NAME}!`;
    root.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'story-grid';
    topic.passages.forEach((passage) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'story-tile';
      tile.innerHTML = `
        <span class="story-emoji">${passage.emoji ?? '📖'}</span>
        <span class="story-title">${passage.title ?? topic.displayName}</span>
      `;
      tile.addEventListener('click', () => showPassage(passage));
      grid.appendChild(tile);
    });
    root.appendChild(grid);

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button secondary';
    backButton.style.marginTop = 'var(--space-2)';
    backButton.textContent = 'Back to subject';
    backButton.addEventListener('click', () => router.navigate(`/subject/${subjectId}`));
    root.appendChild(backButton);
  }

  function showPassage(passage) {
    root.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';

    const heading = document.createElement('h1');
    heading.textContent = `${passage.emoji ?? ''} ${passage.title ?? topic.displayName}`;
    card.appendChild(heading);

    const wordSpans = [];
    const textEl = document.createElement('p');
    passage.text.split(/(\s+)/).forEach((token) => {
      if (/^\s+$/.test(token)) {
        textEl.appendChild(document.createTextNode(token));
        return;
      }
      const span = document.createElement('span');
      span.className = 'read-word';
      span.textContent = token;
      textEl.appendChild(span);
      wordSpans.push(span);
    });
    card.appendChild(textEl);

    function resetWordStyles() {
      wordSpans.forEach((s) => s.classList.remove('read-word-current', 'read-word-done', 'read-word-mistake'));
    }

    // Marks words before `completedCount` as done, the word at `completedCount`
    // as the current/next one to read, and leaves the rest as plain upcoming text.
    function highlightProgress(completedCount) {
      wordSpans.forEach((span, i) => {
        span.classList.remove('read-word-current', 'read-word-done');
        if (i < completedCount) span.classList.add('read-word-done');
        else if (i === completedCount) span.classList.add('read-word-current');
      });
    }

    const controls = document.createElement('div');
    controls.className = 'button-grid';

    if (isReadAloudSupported()) {
      const readAloudButton = document.createElement('button');
      readAloudButton.type = 'button';
      readAloudButton.className = 'button secondary';
      readAloudButton.innerHTML = `${icon('speaker', 18)} Read aloud`;
      readAloudButton.addEventListener('click', () => {
        resetWordStyles();
        speakPassage(passage.text, {
          onWordIndex: (i) => highlightProgress(i),
          onEnd: resetWordStyles,
        });
      });
      controls.appendChild(readAloudButton);
    }

    const feedbackArea = document.createElement('div');
    feedbackArea.setAttribute('aria-live', 'polite');
    let activeRecognition = null;

    if (isReadItYourselfSupported()) {
      const readSelfButton = document.createElement('button');
      readSelfButton.type = 'button';
      readSelfButton.className = 'button secondary';
      readSelfButton.innerHTML = `${icon('mic', 18)} Read it yourself`;
      readSelfButton.addEventListener('click', () => {
        resetWordStyles();
        readSelfButton.disabled = true;
        feedbackArea.innerHTML = '';
        const stopButton = document.createElement('button');
        stopButton.type = 'button';
        stopButton.className = 'button';
        stopButton.innerHTML = `${icon('stop', 16)} Stop & check my reading`;
        feedbackArea.appendChild(stopButton);
        const listeningNote = document.createElement('p');
        listeningNote.textContent = say("I'm listening — read at your own pace, then tap Stop when you're done.");
        feedbackArea.appendChild(listeningNote);

        stopButton.addEventListener('click', () => activeRecognition?.stop());

        activeRecognition = startListening({
          onProgress: (wordCount) => highlightProgress(wordCount),
          onFinalResult: (transcript) => {
            activeRecognition = null;
            readSelfButton.disabled = false;
            const mismatches = compareReadAttempt(passage.text, transcript);
            wordSpans.forEach((s) => s.classList.remove('read-word-current', 'read-word-done'));
            mismatches.forEach(({ index }) => wordSpans[index]?.classList.add('read-word-mistake'));
            if (store.isSoundEnabled()) {
              if (mismatches.length === 0) playCorrectSound();
              else playIncorrectSound();
            }
            feedbackArea.innerHTML =
              mismatches.length === 0
                ? `<p class="feedback-success">${say(`Wonderful reading, ${LEARNER_NAME} — every word was spot on!`)}</p>`
                : `<div class="hint-box">${say(`Nice try, ${LEARNER_NAME}! The highlighted words above could use another go: ${mismatches.map((m) => m.word).join(', ')}`)}</div>`;
          },
          onError: () => {
            activeRecognition = null;
            readSelfButton.disabled = false;
            feedbackArea.innerHTML = `<p>${say("I couldn't quite hear that — want to try again?")}</p>`;
          },
        });
      });
      controls.appendChild(readSelfButton);
    }

    card.append(controls, feedbackArea);

    const startQuestionsButton = document.createElement('button');
    startQuestionsButton.type = 'button';
    startQuestionsButton.className = 'button';
    startQuestionsButton.style.marginTop = 'var(--space-2)';
    startQuestionsButton.textContent = "I'm ready for the questions";
    startQuestionsButton.addEventListener('click', () => {
      stopSpeaking();
      renderQuestion(passage, 0);
    });
    card.appendChild(startQuestionsButton);

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button secondary';
    backButton.style.marginLeft = '8px';
    backButton.style.marginTop = 'var(--space-2)';
    backButton.textContent = 'Back to library';
    backButton.addEventListener('click', showLibrary);
    card.appendChild(backButton);

    root.appendChild(card);
  }

  function renderQuestion(passage, questionIndexInPassage) {
    const questionId = passage.comprehensionQuestionIds[questionIndexInPassage];
    const question = topic.questions.find((q) => q.id === questionId);
    renderQuestionCard(root, {
      question,
      topicId,
      store,
      progressLabelText: `Question ${questionIndexInPassage + 1} of ${passage.comprehensionQuestionIds.length} — ${passage.title ?? topic.displayName}`,
      renderNextAction(actions) {
        const isLastQuestion = questionIndexInPassage + 1 >= passage.comprehensionQuestionIds.length;
        if (!isLastQuestion) {
          const nextButton = document.createElement('button');
          nextButton.type = 'button';
          nextButton.className = 'button';
          nextButton.textContent = 'Next question';
          nextButton.addEventListener('click', () => renderQuestion(passage, questionIndexInPassage + 1));
          actions.appendChild(nextButton);
        } else {
          const libraryButton = document.createElement('button');
          libraryButton.type = 'button';
          libraryButton.className = 'button';
          libraryButton.textContent = 'Back to story library';
          libraryButton.addEventListener('click', showLibrary);
          actions.appendChild(libraryButton);
        }

        const homeButton = document.createElement('button');
        homeButton.type = 'button';
        homeButton.className = 'button secondary';
        homeButton.style.marginLeft = '8px';
        homeButton.textContent = 'Back to home';
        homeButton.addEventListener('click', () => router.navigate('/home'));
        actions.appendChild(homeButton);
      },
    });
  }
}
