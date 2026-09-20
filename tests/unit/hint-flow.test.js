import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHintFlow, advanceHintStage, HINT_STAGE } from '../../js/engine/hint-flow.js';

test('advanceHintStage goes none -> small -> big -> explanation', () => {
  assert.equal(advanceHintStage(HINT_STAGE.NONE), HINT_STAGE.SMALL);
  assert.equal(advanceHintStage(HINT_STAGE.SMALL), HINT_STAGE.BIG);
  assert.equal(advanceHintStage(HINT_STAGE.BIG), HINT_STAGE.EXPLANATION);
});

test('createHintFlow advances one stage per incorrect answer', () => {
  const flow = createHintFlow();
  assert.equal(flow.stage, HINT_STAGE.NONE);
  flow.onIncorrectAnswer();
  assert.equal(flow.stage, HINT_STAGE.SMALL);
  flow.onIncorrectAnswer();
  assert.equal(flow.stage, HINT_STAGE.BIG);
  flow.onIncorrectAnswer();
  assert.equal(flow.stage, HINT_STAGE.EXPLANATION);
});

test('requestExplanation jumps straight to explanation on demand', () => {
  const flow = createHintFlow();
  flow.requestExplanation();
  assert.equal(flow.stage, HINT_STAGE.EXPLANATION);
});

test('reset returns to none', () => {
  const flow = createHintFlow();
  flow.onIncorrectAnswer();
  flow.reset();
  assert.equal(flow.stage, HINT_STAGE.NONE);
});
