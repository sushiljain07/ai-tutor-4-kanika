import { renderQuestionCard } from './question-card.js';
import { renderVisual } from '../widgets/visuals.js';
import { renderExplanationBlock } from '../widgets/explanation-block.js';
import { mascotSVG } from '../widgets/mascot.js';
import { say } from '../engine/tutor-character.js';
import { fetchJson } from '../engine/safe-fetch.js';
import { renderErrorScreen } from '../widgets/error-screen.js';

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export async function renderTopic(root, { store, router, subjectId, topicId }) {
  let topic;
  try {
    topic = await fetchJson(`js/content/${subjectId}/${topicId}.json`);
  } catch {
    renderErrorScreen(root, { router, message: "Hmm, that topic couldn't be loaded. Let's go back and try another one." });
    return;
  }

  renderExplanation();

  function renderExplanation() {
    root.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';

    const heading = document.createElement('h1');
    heading.textContent = topic.displayName;
    card.appendChild(heading);

    const tutorMsg = document.createElement('div');
    tutorMsg.className = 'tutor-message';
    tutorMsg.innerHTML = `
      <div class="tutor-avatar">${mascotSVG(44)}</div>
      <p class="tutor-line">${say(`Let's learn about ${topic.displayName}!`)}</p>
    `;
    card.appendChild(tutorMsg);

    renderExplanationBlock(card, topic.explanation);

    if (topic.visual) {
      renderVisual(topic.visual, card);
    }

    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.className = 'button';
    startButton.style.marginTop = 'var(--space-2)';
    startButton.textContent = 'Start practicing';
    startButton.addEventListener('click', () => {
      // Shuffle once per session start so the same fixed order isn't repeated
      // every time this topic is practiced. Reinforcement pairs are looked up
      // by id, not position, so shuffling doesn't affect which pairs exist.
      topic.questions = shuffle(topic.questions);
      renderQuestion(topic.questions[0], new Set());
    });
    card.appendChild(startButton);

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button secondary';
    backButton.style.marginLeft = '8px';
    backButton.style.marginTop = 'var(--space-2)';
    backButton.textContent = 'Back to subject';
    backButton.addEventListener('click', () => router.navigate(`/subject/${subjectId}`));
    card.appendChild(backButton);

    root.appendChild(card);
  }

  function makeButton(text, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  function findNextUnvisited(visited) {
    for (let i = 0; i < topic.questions.length; i++) {
      if (!visited.has(i)) return i;
    }
    return null;
  }

  // `visited` is the set of question indices already settled this session
  // (answered and, if needed, reinforced). Advancing always looks up the next
  // *unvisited* index rather than doing index arithmetic — after shuffling,
  // a reinforcement partner can land anywhere in the array, so "skip to
  // max(base, reinforcement) + 1" would silently skip over real, unvisited
  // questions sitting in between. `isReinforcementRound` stops a reinforcement
  // question from chaining into a second reinforcement of its own.
  function renderQuestion(question, visited, isReinforcementRound = false) {
    const displayIndex = topic.questions.findIndex((q) => q.id === question.id);
    let lastOutcome = null;

    renderQuestionCard(root, {
      question,
      topicId,
      store,
      progressLabelText: `Question ${displayIndex + 1} of ${topic.questions.length} — ${topic.displayName}`,
      onAnswered(outcome) {
        lastOutcome = outcome;
      },
      renderNextAction(actions) {
        const neededHelp = lastOutcome && (!lastOutcome.correct || lastOutcome.hintLevelUsed > 0);
        const followUp = topic.questions.find((q) => q.id === question.followUpQuestionId);
        const updatedVisited = new Set(visited).add(displayIndex);
        // Follow-up pairs are mutual (q1's follow-up is q2 and vice versa), so if the
        // partner was already answered earlier in this session, re-offering it here
        // would show an already-completed question again instead of a fresh one.
        const followUpAlreadyVisited =
          followUp && updatedVisited.has(topic.questions.findIndex((q) => q.id === followUp.id));

        if (neededHelp && !isReinforcementRound && followUp && !followUpAlreadyVisited) {
          actions.appendChild(
            makeButton('Try a similar one', 'button', () => renderQuestion(followUp, updatedVisited, true))
          );
        } else {
          const nextIndex = findNextUnvisited(updatedVisited);
          if (nextIndex !== null) {
            actions.appendChild(
              makeButton('Next question', 'button', () =>
                renderQuestion(topic.questions[nextIndex], updatedVisited, false)
              )
            );
          } else {
            const doneMessage = document.createElement('p');
            doneMessage.className = 'feedback-success';
            doneMessage.textContent = `You've completed every question in ${topic.displayName}!`;
            actions.appendChild(doneMessage);
            actions.appendChild(
              makeButton('Practice again', 'button secondary', () => {
                topic.questions = shuffle(topic.questions);
                renderQuestion(topic.questions[0], new Set());
              })
            );
          }
        }

        actions.appendChild(makeButton('Back to home', 'button secondary', () => router.navigate('/home')));
      },
    });
  }
}
