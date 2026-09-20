import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareReadAttempt } from '../../js/voice/read-it-yourself.js';

test('identical text produces no mismatches', () => {
  assert.deepEqual(compareReadAttempt('The cat sat', 'The cat sat'), []);
});

test('is case-insensitive and ignores punctuation', () => {
  assert.deepEqual(compareReadAttempt('The cat, sat.', 'the CAT sat'), []);
});

test('flags a single mispronounced word without affecting the rest', () => {
  assert.deepEqual(compareReadAttempt('The cat sat down', 'The dog sat down'), [{ index: 1, word: 'cat' }]);
});

test('flags words beyond a shorter transcript', () => {
  assert.deepEqual(compareReadAttempt('The cat sat down', 'The cat'), [
    { index: 2, word: 'sat' },
    { index: 3, word: 'down' },
  ]);
});

test('repeated words are each checked independently', () => {
  assert.deepEqual(compareReadAttempt('see the see', 'see the sea'), [{ index: 2, word: 'see' }]);
});

test('a single dropped word does not cascade into flagging every word after it', () => {
  // Regression test: the old position-by-position comparison would flag 6 of
  // these 7 words wrong just because the recognizer skipped one word ("cat").
  // The LCS-based alignment should flag only the actual dropped word.
  const mismatches = compareReadAttempt('The cat sat on the mat today', 'the sat on the mat today');
  assert.deepEqual(mismatches, [{ index: 1, word: 'cat' }]);
});

test('an inserted extra word in the transcript does not cascade either', () => {
  const mismatches = compareReadAttempt('The cat sat down', 'the big cat sat down');
  assert.deepEqual(mismatches, []);
});
