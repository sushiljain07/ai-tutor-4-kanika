# Contract: Progress Record `localStorage` Schema

This is the contract between `js/engine/progress-store.js` (the only module allowed to read or
write this key) and every view/engine module that displays or updates progress. Stored under
a single `localStorage` key, e.g. `kanika-tutor:progress:v1`.

## Shape

```jsonc
{
  "version": 1,                       // bump if this shape changes; progress-store.js migrates or resets
  "stars": 42,
  "streak": {
    "count": 3,
    "lastPracticedDate": "2026-09-19" // ISO date (no time); a gap of >1 day resets count to 1 on next practice
  },
  "tutorName": "Milo",                // set on first run (FR-001); a default is used until then
  "topics": {
    "addition-subtraction": {
      "attempts": [
        { "correct": true, "hintLevelUsed": 0 },
        { "correct": false, "hintLevelUsed": 2 },
        { "correct": true, "hintLevelUsed": 1 }
      ]                                // most recent last; capped at the last 5 (see mastery-rules.js)
    }
  },
  "parentPinHash": "…salted hash, absent until parent sets a PIN…",
  "recentActivity": [
    {
      "topicId": "addition-subtraction",
      "timestamp": "2026-09-19T14:03:00Z",
      "correct": true,
      "hintLevelUsed": 0
      // "skillTag": "operation-identification"   <- present only for Simple Word Problems attempts
    }
  ]                                    // capped at the last 20 entries, oldest dropped first
}
```

## Field rules

| Field | Owner | Notes |
|---|---|---|
| `stars` | `progress-store.js` | Incremented only on a correct answer (FR-011); never decremented |
| `streak.count` / `.lastPracticedDate` | `progress-store.js` | Updated at most once per calendar day; missing a day resets to 1, not 0 (never punitive — "gentle streak," per spec) |
| `tutorName` | `js/views/onboarding.js` (write, first run) / `js/engine/tutor-character.js` (read) | Set once on first run (FR-001); renaming later (edge case) overwrites this field only, no history kept |
| `topics[topicId].attempts` | `progress-store.js` | Rolling window, max 5 entries; `mastery-rules.js` derives `mastered` / `needsAttention` / `inProgress` from this — never stored as a separate field, to avoid drift |
| `parentPinHash` | `js/views/parent.js` (write) / `progress-store.js` (read) | Salted hash only, never the raw PIN (research.md §6) |
| `recentActivity[].skillTag` | `progress-store.js` (write, from the answered question's content) | Present only for Simple Word Problems attempts; `js/engine/skill-insights.js` reads this to build parent insight statements, requiring ≥3 attempts per tag before stating a pattern (FR-026) |
| `recentActivity` | `progress-store.js` | Append-only from the app; only the parent's "clear progress" action (FR-028) empties this and every other field |

## Consumers

- `js/views/home.js` — reads `stars`, `streak`, `tutorName`, and derived mastery per topic for
  the shared progress summary (FR-004/FR-005).
- `js/views/topic.js` / `reading-passage.js` — append an attempt after each answered question
  (including `skillTag` when the question defines one); read derived mastery to show "topic
  mastered" state.
- `js/engine/mastery-rules.js` — pure function(s) taking `attempts`/`recentActivity`, returning
  derived status; has no write access to the record.
- `js/engine/skill-insights.js` — pure function(s) taking `recentActivity`, returning
  skill-tagged insight statements once the ≥3-attempt threshold is met (FR-026); has no write
  access to the record.
- `js/views/parent.js` — reads the whole record for the summary/insight/recent-activity view
  (FR-025, FR-026, FR-027); the only writer of `parentPinHash` and the only caller of the
  "clear progress" reset (FR-028).

## Compatibility / migration

`version` exists so a future shape change can either migrate old records or, at minimum,
detect and reset cleanly rather than crash on an unexpected shape — consistent with the
"browser storage unavailable/cleared" edge case already accepted in the spec (loss of
progress is a tolerated failure mode, never a hard error).
