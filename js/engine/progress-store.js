import { applyDailyStat } from './trends.js';

const STORAGE_KEY = 'kanika-tutor:progress:v1';
const MAX_ATTEMPTS_PER_TOPIC = 5;
const MAX_RECENT_ACTIVITY = 20;

export function defaultRecord() {
  return {
    version: 1,
    stars: 0,
    streak: { count: 0, lastPracticedDate: null },
    topics: {},
    parentPinHash: null,
    recentActivity: [],
    soundEnabled: true,
    dailyStats: {},
  };
}

export function parseRecord(raw) {
  if (!raw) return defaultRecord();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) return defaultRecord();
    return { ...defaultRecord(), ...parsed };
  } catch {
    return defaultRecord();
  }
}

export function serializeRecord(record) {
  return JSON.stringify(record);
}

export function computeNextStreak(streak, todayISODate) {
  const { count, lastPracticedDate } = streak;
  if (lastPracticedDate === todayISODate) return { count, lastPracticedDate };
  if (isConsecutiveDay(lastPracticedDate, todayISODate)) {
    return { count: count + 1, lastPracticedDate: todayISODate };
  }
  return { count: 1, lastPracticedDate: todayISODate };
}

function isConsecutiveDay(previousISODate, todayISODate) {
  if (!previousISODate) return false;
  const previous = new Date(previousISODate + 'T00:00:00Z');
  const today = new Date(todayISODate + 'T00:00:00Z');
  const diffDays = Math.round((today - previous) / 86400000);
  return diffDays === 1;
}

export function applyAttempt(record, topicId, { correct, hintLevelUsed, skillTag }, todayISODate, timestamp) {
  const topics = { ...record.topics };
  const existing = topics[topicId]?.attempts ?? [];
  const attempts = [...existing, { correct, hintLevelUsed }].slice(-MAX_ATTEMPTS_PER_TOPIC);
  topics[topicId] = { attempts };

  const recentActivity = [
    ...record.recentActivity,
    { topicId, timestamp, correct, hintLevelUsed, ...(skillTag ? { skillTag } : {}) },
  ].slice(-MAX_RECENT_ACTIVITY);

  return {
    ...record,
    stars: correct ? record.stars + 1 : record.stars,
    streak: computeNextStreak(record.streak, todayISODate),
    topics,
    recentActivity,
    dailyStats: applyDailyStat(record.dailyStats ?? {}, todayISODate, correct),
  };
}

export function createProgressStore(storage = globalThis.localStorage) {
  function load() {
    return parseRecord(storage.getItem(STORAGE_KEY));
  }

  function save(record) {
    storage.setItem(STORAGE_KEY, serializeRecord(record));
  }

  return {
    load,
    save,
    recordAttempt(topicId, attempt) {
      const today = new Date().toISOString().slice(0, 10);
      const record = applyAttempt(load(), topicId, attempt, today, new Date().toISOString());
      save(record);
      return record;
    },
    getParentPinHash() {
      return load().parentPinHash;
    },
    setParentPinHash(hash) {
      const record = { ...load(), parentPinHash: hash };
      save(record);
      return record;
    },
    clearAll() {
      const record = defaultRecord();
      save(record);
      return record;
    },
    isSoundEnabled() {
      return load().soundEnabled !== false;
    },
    setSoundEnabled(enabled) {
      const record = { ...load(), soundEnabled: enabled };
      save(record);
      return record;
    },
  };
}
