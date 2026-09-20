import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createProgressStore,
  defaultRecord,
  applyAttempt,
  computeNextStreak,
} from '../../js/engine/progress-store.js';

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, v),
  };
}

test('applyAttempt caps attempts at 5 per topic', () => {
  let record = defaultRecord();
  for (let i = 0; i < 8; i++) {
    record = applyAttempt(record, 'topic-a', { correct: true, hintLevelUsed: 0 }, '2026-09-20', 't');
  }
  assert.equal(record.topics['topic-a'].attempts.length, 5);
});

test('applyAttempt caps recentActivity at 20 entries', () => {
  let record = defaultRecord();
  for (let i = 0; i < 25; i++) {
    record = applyAttempt(record, 'topic-a', { correct: true, hintLevelUsed: 0 }, '2026-09-20', `t${i}`);
  }
  assert.equal(record.recentActivity.length, 20);
  assert.equal(record.recentActivity[19].timestamp, 't24');
});

test('applyAttempt only increments stars on correct answers', () => {
  let record = defaultRecord();
  record = applyAttempt(record, 'a', { correct: true, hintLevelUsed: 0 }, '2026-09-20', 't');
  record = applyAttempt(record, 'a', { correct: false, hintLevelUsed: 1 }, '2026-09-20', 't');
  assert.equal(record.stars, 1);
});

test('applyAttempt attaches skillTag only when provided', () => {
  let record = defaultRecord();
  record = applyAttempt(record, 'wp', { correct: false, hintLevelUsed: 0, skillTag: 'operation-identification' }, '2026-09-20', 't');
  assert.equal(record.recentActivity[0].skillTag, 'operation-identification');

  record = applyAttempt(record, 'a', { correct: true, hintLevelUsed: 0 }, '2026-09-20', 't2');
  assert.equal('skillTag' in record.recentActivity[1], false);
});

test('computeNextStreak resets to 1 after a gap, increments on consecutive day', () => {
  const first = computeNextStreak({ count: 0, lastPracticedDate: null }, '2026-09-20');
  assert.deepEqual(first, { count: 1, lastPracticedDate: '2026-09-20' });

  const consecutive = computeNextStreak({ count: 1, lastPracticedDate: '2026-09-20' }, '2026-09-21');
  assert.deepEqual(consecutive, { count: 2, lastPracticedDate: '2026-09-21' });

  const gap = computeNextStreak({ count: 2, lastPracticedDate: '2026-09-21' }, '2026-09-25');
  assert.deepEqual(gap, { count: 1, lastPracticedDate: '2026-09-25' });

  const sameDay = computeNextStreak({ count: 3, lastPracticedDate: '2026-09-25' }, '2026-09-25');
  assert.deepEqual(sameDay, { count: 3, lastPracticedDate: '2026-09-25' });
});

test('createProgressStore persists and reloads via injected storage', () => {
  const store = createProgressStore(createMemoryStorage());
  store.recordAttempt('addition-subtraction', { correct: true, hintLevelUsed: 0 });
  const loaded = store.load();
  assert.equal(loaded.stars, 1);
  assert.equal(loaded.topics['addition-subtraction'].attempts.length, 1);
});

test('clearAll resets everything', () => {
  const store = createProgressStore(createMemoryStorage());
  store.recordAttempt('a', { correct: true, hintLevelUsed: 0 });
  store.clearAll();
  const loaded = store.load();
  assert.equal(loaded.stars, 0);
  assert.deepEqual(loaded.topics, {});
});

test('sound is enabled by default and can be toggled off and back on', () => {
  const store = createProgressStore(createMemoryStorage());
  assert.equal(store.isSoundEnabled(), true);
  store.setSoundEnabled(false);
  assert.equal(store.isSoundEnabled(), false);
  store.setSoundEnabled(true);
  assert.equal(store.isSoundEnabled(), true);
});
