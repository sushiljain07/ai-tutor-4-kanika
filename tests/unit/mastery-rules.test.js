import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveTopicStatus } from '../../js/engine/mastery-rules.js';

test('no attempts is inProgress', () => {
  assert.equal(deriveTopicStatus([]), 'inProgress');
});

test('3 correct in a row with 0 big hints is mastered', () => {
  const attempts = [
    { correct: true, hintLevelUsed: 0 },
    { correct: true, hintLevelUsed: 1 },
    { correct: true, hintLevelUsed: 0 },
  ];
  assert.equal(deriveTopicStatus(attempts), 'mastered');
});

test('3 correct in a row with 2 big hints is not mastered', () => {
  const attempts = [
    { correct: true, hintLevelUsed: 2 },
    { correct: true, hintLevelUsed: 2 },
    { correct: true, hintLevelUsed: 0 },
  ];
  assert.notEqual(deriveTopicStatus(attempts), 'mastered');
});

test('fewer than 3 correct in last 5 (with >=3 attempts) needs attention', () => {
  const attempts = [
    { correct: false, hintLevelUsed: 1 },
    { correct: false, hintLevelUsed: 1 },
    { correct: true, hintLevelUsed: 0 },
  ];
  assert.equal(deriveTopicStatus(attempts), 'needsAttention');
});

test('big hint used on more than half of last 5 needs attention', () => {
  const attempts = [
    { correct: true, hintLevelUsed: 2 },
    { correct: true, hintLevelUsed: 2 },
    { correct: true, hintLevelUsed: 2 },
  ];
  assert.equal(deriveTopicStatus(attempts), 'needsAttention');
});

test('a single incorrect attempt does not trigger needsAttention (minimum sample)', () => {
  const attempts = [{ correct: false, hintLevelUsed: 2 }];
  assert.equal(deriveTopicStatus(attempts), 'inProgress');
});

test('mixed but healthy performance is inProgress', () => {
  const attempts = [
    { correct: true, hintLevelUsed: 0 },
    { correct: false, hintLevelUsed: 1 },
    { correct: true, hintLevelUsed: 0 },
    { correct: true, hintLevelUsed: 1 },
  ];
  assert.equal(deriveTopicStatus(attempts), 'inProgress');
});
