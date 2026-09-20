import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSkillInsights } from '../../js/engine/skill-insights.js';

test('no insight below the 3-attempt threshold', () => {
  const activity = [
    { skillTag: 'operation-identification', correct: false },
    { skillTag: 'operation-identification', correct: true },
  ];
  assert.equal(buildSkillInsights(activity).length, 0);
});

test('produces a statement once 3+ attempts are logged for a tag', () => {
  const activity = [
    { skillTag: 'operation-identification', correct: false },
    { skillTag: 'operation-identification', correct: false },
    { skillTag: 'operation-identification', correct: true },
  ];
  const insights = buildSkillInsights(activity);
  assert.equal(insights.length, 1);
  assert.equal(insights[0].skillTag, 'operation-identification');
  assert.equal(insights[0].correctAttempts, 1);
  assert.equal(insights[0].totalAttempts, 3);
  assert.match(insights[0].statement, /operation/);
});

test('entries without a skillTag are ignored', () => {
  const activity = [{ correct: true }, { correct: false }, { correct: true }];
  assert.equal(buildSkillInsights(activity).length, 0);
});

test('tracks multiple skill tags independently', () => {
  const activity = [
    { skillTag: 'computation', correct: true },
    { skillTag: 'computation', correct: true },
    { skillTag: 'computation', correct: false },
    { skillTag: 'operation-identification', correct: false },
  ];
  const insights = buildSkillInsights(activity);
  assert.equal(insights.length, 1);
  assert.equal(insights[0].skillTag, 'computation');
});
