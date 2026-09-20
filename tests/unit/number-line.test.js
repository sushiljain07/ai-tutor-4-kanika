import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampValue, positionRatioToValue } from '../../js/widgets/number-line.js';

test('clampValue constrains to [min, max]', () => {
  assert.equal(clampValue(-5, 0, 20), 0);
  assert.equal(clampValue(25, 0, 20), 20);
  assert.equal(clampValue(7, 0, 20), 7);
});

test('positionRatioToValue maps ratio to a rounded, clamped value', () => {
  assert.equal(positionRatioToValue(0, 0, 20), 0);
  assert.equal(positionRatioToValue(1, 0, 20), 20);
  assert.equal(positionRatioToValue(0.5, 0, 20), 10);
  assert.equal(positionRatioToValue(-0.5, 0, 20), 0);
  assert.equal(positionRatioToValue(1.5, 0, 20), 20);
});
