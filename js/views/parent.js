import { hashPin, verifyPin } from '../engine/pin.js';
import { deriveTopicStatus } from '../engine/mastery-rules.js';
import { buildSkillInsights } from '../engine/skill-insights.js';
import { LEARNER_NAME } from '../config.js';
import { fetchJson } from '../engine/safe-fetch.js';
import { renderErrorScreen } from '../widgets/error-screen.js';
import { lastNDaysStats, summarizeRange } from '../engine/trends.js';
import { icon } from '../widgets/ui-icons.js';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function renderTrendCard(record) {
  const today = new Date().toISOString().slice(0, 10);
  const last14 = lastNDaysStats(record.dailyStats ?? {}, today, 14);
  const thisWeek = last14.slice(7);
  const lastWeek = last14.slice(0, 7);
  const thisWeekTotals = summarizeRange(thisWeek);
  const lastWeekTotals = summarizeRange(lastWeek);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2 class="section-heading" style="margin-top:0">This week's trend</h2>`;

  const chart = document.createElement('div');
  chart.className = 'trend-chart';
  thisWeek.forEach((day) => {
    const bar = document.createElement('div');
    bar.className = 'trend-bar';
    const accuracyPct = day.attempts > 0 ? Math.round((day.correct / day.attempts) * 100) : 0;
    const fill = document.createElement('div');
    fill.className = 'trend-bar-fill';
    fill.style.height = day.attempts > 0 ? `${Math.max(accuracyPct, 6)}%` : '0%';
    fill.title = day.attempts > 0 ? `${day.correct}/${day.attempts} correct (${accuracyPct}%)` : 'No practice';
    const label = document.createElement('span');
    label.className = 'trend-bar-label';
    label.textContent = DAY_LABELS[new Date(`${day.date}T00:00:00Z`).getUTCDay()];
    bar.append(fill, label);
    chart.appendChild(bar);
  });
  card.appendChild(chart);

  const summary = document.createElement('p');
  if (thisWeekTotals.attempts === 0) {
    summary.textContent = 'No practice recorded yet this week.';
  } else {
    const pct = Math.round(thisWeekTotals.accuracy * 100);
    let comparison = '';
    if (lastWeekTotals.attempts > 0) {
      const lastPct = Math.round(lastWeekTotals.accuracy * 100);
      const diff = pct - lastPct;
      if (diff > 0) comparison = ` — up ${diff} points from last week`;
      else if (diff < 0) comparison = ` — down ${Math.abs(diff)} points from last week`;
      else comparison = ' — same as last week';
    }
    summary.textContent = `${thisWeekTotals.attempts} questions attempted, ${pct}% correct${comparison}.`;
  }
  card.appendChild(summary);

  return card;
}

export async function renderParent(root, { store, router }) {
  const record = store.load();

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `<div class="app-brand">${icon('parent', 26)} Parent View</div>`;
  root.appendChild(header);

  if (!record.parentPinHash) {
    renderSetPin();
  } else {
    renderPinGate();
  }

  function renderSetPin() {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h1>Set a parent PIN</h1>
      <p>This keeps ${LEARNER_NAME} out of the parent view — it isn't meant to stop a determined adult.</p>
    `;
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.placeholder = '4-digit PIN';
    card.appendChild(input);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button';
    button.style.marginTop = 'var(--space-2)';
    button.textContent = 'Save PIN';
    button.addEventListener('click', async () => {
      if (!/^\d{4,}$/.test(input.value)) return;
      const hash = await hashPin(input.value);
      store.setParentPinHash(hash);
      root.innerHTML = '';
      root.appendChild(header);
      renderSummary();
    });
    card.appendChild(button);
    root.appendChild(card);
  }

  function renderPinGate() {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h1>Enter parent PIN</h1>`;
    const input = document.createElement('input');
    input.type = 'password';
    input.inputMode = 'numeric';
    input.placeholder = 'PIN';
    card.appendChild(input);

    const feedback = document.createElement('p');
    card.appendChild(feedback);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button';
    button.style.marginTop = 'var(--space-2)';
    button.textContent = 'Unlock';
    button.addEventListener('click', async () => {
      const ok = await verifyPin(input.value, record.parentPinHash);
      if (ok) {
        root.innerHTML = '';
        root.appendChild(header);
        renderSummary();
      } else {
        feedback.textContent = 'That PIN is not correct — try again.';
      }
    });
    card.appendChild(button);

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button secondary';
    backButton.style.marginLeft = '8px';
    backButton.style.marginTop = 'var(--space-2)';
    backButton.textContent = 'Back to home';
    backButton.addEventListener('click', () => router.navigate('/home'));
    card.appendChild(backButton);

    root.appendChild(card);
  }

  async function renderSummary() {
    let subjects;
    const topicIndex = {};
    try {
      subjects = await fetchJson('js/content/subjects.json');
      for (const subject of subjects) {
        const topics = await fetchJson(`js/content/${subject.id}/index.json`);
        for (const t of topics) topicIndex[t.id] = { ...t, subjectId: subject.id, subjectName: subject.displayName };
      }
    } catch {
      renderErrorScreen(root, { router, message: "Hmm, the summary couldn't load. Let's try again." });
      return;
    }

    root.appendChild(renderTrendCard(record));

    const summaryCard = document.createElement('div');
    summaryCard.className = 'card';
    summaryCard.innerHTML = `<h2 class="section-heading" style="margin-top:0">Per-subject summary</h2>`;
    for (const subject of subjects) {
      const topics = Object.values(topicIndex).filter((t) => t.subjectId === subject.id);
      const attemptedCount = topics.filter((t) => (record.topics[t.id]?.attempts.length ?? 0) > 0).length;
      const p = document.createElement('p');
      p.textContent = `${subject.displayName}: ${attemptedCount} of ${topics.length} topics started`;
      summaryCard.appendChild(p);
    }
    root.appendChild(summaryCard);

    const attentionCard = document.createElement('div');
    attentionCard.className = 'card';
    attentionCard.innerHTML = `<h2 class="section-heading" style="margin-top:0">Topics needing attention</h2>`;
    const attentionTopics = Object.values(topicIndex).filter(
      (t) => deriveTopicStatus(record.topics[t.id]?.attempts ?? []) === 'needsAttention'
    );
    if (attentionTopics.length === 0) {
      attentionCard.innerHTML += '<p>Nothing flagged right now.</p>';
    } else {
      attentionTopics.forEach((t) => {
        const attempts = record.topics[t.id].attempts;
        const correct = attempts.filter((a) => a.correct).length;
        const div = document.createElement('div');
        div.className = 'attention-item';
        div.innerHTML = `<strong>${t.displayName}</strong> <span class="observed-count">(${correct} of ${attempts.length} of the last attempts correct)</span>`;
        attentionCard.appendChild(div);
      });
    }
    root.appendChild(attentionCard);

    const insights = buildSkillInsights(record.recentActivity);
    const insightCard = document.createElement('div');
    insightCard.className = 'card';
    insightCard.innerHTML = `<h2 class="section-heading" style="margin-top:0">What ${LEARNER_NAME} might need help with</h2>`;
    if (insights.length === 0) {
      insightCard.innerHTML += '<p>Not enough practice yet to spot a specific pattern — check back after a few more Word Problems.</p>';
    } else {
      insights.forEach((insight) => {
        const p = document.createElement('p');
        p.innerHTML = `${LEARNER_NAME} ${insight.statement} <br><span class="observed-count">Observed: ${insight.correctAttempts} of ${insight.totalAttempts} recent attempts correct.</span>`;
        insightCard.appendChild(p);
      });
    }
    root.appendChild(insightCard);

    const activityCard = document.createElement('div');
    activityCard.className = 'card';
    activityCard.innerHTML = `<h2 class="section-heading" style="margin-top:0">Recent activity</h2>`;
    const recent = [...record.recentActivity].reverse().slice(0, 10);
    if (recent.length === 0) {
      activityCard.innerHTML += '<p>No activity yet.</p>';
    } else {
      recent.forEach((entry) => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        const name = topicIndex[entry.topicId]?.displayName ?? entry.topicId;
        div.textContent = `${entry.correct ? '✅' : '↻'} ${name} — ${new Date(entry.timestamp).toLocaleString()}`;
        activityCard.appendChild(div);
      });
    }
    root.appendChild(activityCard);

    const settingsCard = document.createElement('div');
    settingsCard.className = 'card';
    settingsCard.innerHTML = `<h2 class="section-heading" style="margin-top:0">Settings</h2>`;
    const soundButton = document.createElement('button');
    soundButton.type = 'button';
    soundButton.className = 'button secondary';
    const renderSoundLabel = () => {
      soundButton.innerHTML = `${icon('speaker', 18)} Sound effects: ${store.isSoundEnabled() ? 'On' : 'Off'}`;
    };
    renderSoundLabel();
    soundButton.addEventListener('click', () => {
      store.setSoundEnabled(!store.isSoundEnabled());
      renderSoundLabel();
    });
    settingsCard.appendChild(soundButton);
    root.appendChild(settingsCard);

    const dangerCard = document.createElement('div');
    dangerCard.className = 'card';
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'button secondary';
    clearButton.textContent = 'Clear all progress data';
    clearButton.addEventListener('click', () => {
      if (confirm(`This will erase all of ${LEARNER_NAME}'s stars, streak, and progress. Are you sure?`)) {
        store.clearAll();
        router.navigate('/home');
      }
    });
    dangerCard.appendChild(clearButton);
    root.appendChild(dangerCard);

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'button secondary';
    backButton.style.marginLeft = '8px';
    backButton.textContent = 'Back to home';
    backButton.addEventListener('click', () => router.navigate('/home'));
    dangerCard.appendChild(backButton);
  }
}
