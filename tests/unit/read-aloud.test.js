import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitWords, wordIndexForCharIndex, pickIndianFemaleVoice } from '../../js/voice/read-aloud.js';

test('splitWords finds each word with its start/end offsets', () => {
  const words = splitWords('Hi there friend');
  assert.deepEqual(words.map((w) => w.text), ['Hi', 'there', 'friend']);
  assert.equal(words[1].start, 3);
  assert.equal(words[1].end, 8);
});

test('wordIndexForCharIndex maps a char offset to the containing word', () => {
  const words = splitWords('Hi there friend');
  assert.equal(wordIndexForCharIndex(words, 0), 0);
  assert.equal(wordIndexForCharIndex(words, 3), 1);
  assert.equal(wordIndexForCharIndex(words, 20), 2);
});

test('pickIndianFemaleVoice prefers an en-IN voice with a female-sounding name', () => {
  const voices = [
    { name: 'Microsoft Ravi - English (India)', lang: 'en-IN' },
    { name: 'Microsoft Heera - English (India)', lang: 'en-IN' },
    { name: 'Google US English', lang: 'en-US' },
  ];
  assert.equal(pickIndianFemaleVoice(voices).name, 'Microsoft Heera - English (India)');
});

test('pickIndianFemaleVoice falls back to any en-IN voice if none sound female', () => {
  const voices = [
    { name: 'Microsoft Ravi - English (India)', lang: 'en-IN' },
    { name: 'Google US English', lang: 'en-US' },
  ];
  assert.equal(pickIndianFemaleVoice(voices).name, 'Microsoft Ravi - English (India)');
});

test('pickIndianFemaleVoice falls back to any English voice if no en-IN exists', () => {
  const voices = [{ name: 'Google US English Female', lang: 'en-US' }];
  assert.equal(pickIndianFemaleVoice(voices).name, 'Google US English Female');
});

test('pickIndianFemaleVoice returns null for an empty list', () => {
  assert.equal(pickIndianFemaleVoice([]), null);
});
