import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleQuickChallenge } from '../../js/engine/quick-challenge.js';

const topics = [
  { id: 'a', questions: [{ id: 'a1' }, { id: 'a2' }] },
  { id: 'b', questions: [{ id: 'b1' }, { id: 'b2' }] },
  { id: 'c', questions: [{ id: 'c1' }] },
];

test('only samples from opened topics', () => {
  const sample = sampleQuickChallenge(['a'], topics, 5);
  assert.ok(sample.every((q) => q.topicId === 'a'));
});

test('returns at most `count` questions, capped by available pool', () => {
  const sample = sampleQuickChallenge(['a', 'b'], topics, 3);
  assert.equal(sample.length, 3);
});

test('never exceeds the available pool size', () => {
  const sample = sampleQuickChallenge(['c'], topics, 5);
  assert.equal(sample.length, 1);
});

test('empty opened list yields no questions', () => {
  assert.deepEqual(sampleQuickChallenge([], topics, 5), []);
});

test('excludes recently-seen questions when enough fresh ones remain', () => {
  // 4 questions available across a+b, excluding 1 still leaves 3 — enough to
  // fill a count of 3 without needing to fall back to the full pool.
  const sample = sampleQuickChallenge(['a', 'b'], topics, 3, ['a1']);
  const ids = sample.map((q) => q.id);
  assert.ok(!ids.includes('a1'));
});

test('falls back to the full pool if excluding recent ones leaves too few', () => {
  const sample = sampleQuickChallenge(['c'], topics, 1, ['c1']);
  // only one question exists in the opened pool ('c1'); excluding it would
  // leave zero, so it must still be returned rather than coming up empty.
  assert.deepEqual(sample.map((q) => q.id), ['c1']);
});
