import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDailyStat, pruneDailyStats, lastNDaysStats, summarizeRange } from '../../js/engine/trends.js';

test('applyDailyStat accumulates attempts and correct counts for the same day', () => {
  let stats = applyDailyStat({}, '2026-09-20', true);
  stats = applyDailyStat(stats, '2026-09-20', false);
  stats = applyDailyStat(stats, '2026-09-20', true);
  assert.deepEqual(stats['2026-09-20'], { attempts: 3, correct: 2 });
});

test('applyDailyStat keeps separate days distinct', () => {
  let stats = applyDailyStat({}, '2026-09-19', true);
  stats = applyDailyStat(stats, '2026-09-20', true);
  assert.deepEqual(stats['2026-09-19'], { attempts: 1, correct: 1 });
  assert.deepEqual(stats['2026-09-20'], { attempts: 1, correct: 1 });
});

test('pruneDailyStats drops entries older than keepDays', () => {
  const stats = {
    '2026-08-01': { attempts: 5, correct: 5 },
    '2026-09-19': { attempts: 2, correct: 1 },
    '2026-09-20': { attempts: 3, correct: 3 },
  };
  const pruned = pruneDailyStats(stats, '2026-09-20', 30);
  assert.deepEqual(Object.keys(pruned).sort(), ['2026-09-19', '2026-09-20']);
});

test('lastNDaysStats returns a fixed-length series with zeros for missing days', () => {
  const stats = { '2026-09-20': { attempts: 4, correct: 3 } };
  const days = lastNDaysStats(stats, '2026-09-20', 3);
  assert.equal(days.length, 3);
  assert.equal(days[0].date, '2026-09-18');
  assert.deepEqual(days[0], { date: '2026-09-18', attempts: 0, correct: 0 });
  assert.deepEqual(days[2], { date: '2026-09-20', attempts: 4, correct: 3 });
});

test('summarizeRange totals attempts/correct and computes accuracy', () => {
  const days = [
    { date: 'a', attempts: 2, correct: 1 },
    { date: 'b', attempts: 3, correct: 3 },
  ];
  assert.deepEqual(summarizeRange(days), { attempts: 5, correct: 4, accuracy: 0.8 });
});

test('summarizeRange reports null accuracy when there were no attempts', () => {
  const days = [{ date: 'a', attempts: 0, correct: 0 }];
  assert.equal(summarizeRange(days).accuracy, null);
});
