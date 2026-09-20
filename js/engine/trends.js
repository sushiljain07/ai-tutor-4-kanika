const MAX_DAILY_STATS_DAYS = 30;

export function applyDailyStat(dailyStats, todayISODate, correct) {
  const existing = dailyStats[todayISODate] ?? { attempts: 0, correct: 0 };
  const updated = {
    ...dailyStats,
    [todayISODate]: { attempts: existing.attempts + 1, correct: existing.correct + (correct ? 1 : 0) },
  };
  return pruneDailyStats(updated, todayISODate, MAX_DAILY_STATS_DAYS);
}

export function pruneDailyStats(dailyStats, todayISODate, keepDays = MAX_DAILY_STATS_DAYS) {
  const cutoff = new Date(`${todayISODate}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - keepDays);
  const result = {};
  for (const [date, stat] of Object.entries(dailyStats)) {
    if (new Date(`${date}T00:00:00Z`) >= cutoff) result[date] = stat;
  }
  return result;
}

// Returns the last `n` days ending on `todayISODate`, oldest first, filling in
// zeroed entries for days with no recorded activity so charts have a fixed length.
export function lastNDaysStats(dailyStats, todayISODate, n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(`${todayISODate}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, ...(dailyStats[iso] ?? { attempts: 0, correct: 0 }) });
  }
  return days;
}

export function summarizeRange(days) {
  const attempts = days.reduce((sum, d) => sum + d.attempts, 0);
  const correct = days.reduce((sum, d) => sum + d.correct, 0);
  return { attempts, correct, accuracy: attempts > 0 ? correct / attempts : null };
}
