# Phase 1 Data Model: Foundational Tutor

Two data surfaces exist: **Content** (static, authored, read-only at runtime — ships with the
app) and **Progress** (dynamic, per-device, read/write — lives in `localStorage`). Exact JSON
shapes are formalized in `contracts/content-schema.md` and `contracts/progress-schema.md`;
this file describes the entities and their relationships.

## Content entities (static, authored)

### Subject
Represents one of Math, English, or Computer Studies.
- `id`: one of `math` | `english` | `computer-studies`
- `displayName`: child-facing subject name
- `topics`: ordered list of Topic `id`s belonging to this subject

### Topic
A unit of learning within a Subject (e.g., "Multiplication Tables").
- `id`: unique, kebab-case, stable across content edits (used as the localStorage key for
  progress on this topic)
- `subjectId`: the owning Subject
- `displayName`: child-facing topic name
- `sourceReference` *(optional, internal/authoring metadata, never shown to the child)*: which
  textbook this topic's scope/level was aligned to (e.g., "New Mathematics Today - 3", "Gul
  Mohar Reader 3", "Good Grammar with Composition Book 3", "CompWiz - Class 3") — traces spec
  FR-008/009/010 back to source; not rendered in the UI.
- `explanation`: short text + a worked example, shown before any practice question
- `questions`: ordered list of Practice Question objects (see below)

### Practice Question
A single question belonging to a Topic.
- `id`: unique within its Topic
- `prompt`: the question text (and, for Reading Comprehension, a reference to its Reading
  Passage)
- `options` *(optional)*: multiple-choice options, where applicable
- `correctAnswer`: the correct option or expected value
- `hints`: `{ small: string, big: string }` — the two staged hints shown before the answer
- `explanationSteps`: ordered list of short strings — the step-by-step solution, shown
  automatically after the staged hints, or on request (per FR-007)
- `followUpQuestionId`: the `id` of a similar question offered after this one's explanation is
  shown, to confirm understanding (per FR-010)
- `widget` *(optional, Addition & Subtraction topic only)*: `{ type: "number-line", min:
  number, max: number, start: number }` — configuration for the flagship interactive control
  (FR-013); absent for every other topic's questions
- `skillTag` *(optional, Simple Word Problems topic only)*: an id identifying the specific
  skill this question exercises (e.g., `operation-identification`, `computation`), used by
  the parent insight engine (FR-015, FR-026); absent for topics that don't yet use skill
  tagging

### Reading Passage
A Reading Comprehension-specific extension of Topic content.
- `id`: unique within Reading Comprehension
- `text`: the passage body (plain text, segmented into words for read-aloud highlighting)
- `comprehensionQuestionIds`: 2-3 Practice Question `id`s tied to this passage

## Tutor Character (dynamic, per-device)

The learner's chosen name for the tutor persona (spec FR-001/FR-002), stored in the Progress
Record rather than as content, since it's a per-learner choice, not authored data.
- `name`: the chosen or entered name (e.g., "Milo")
- Presented via one small, static illustration bundled as a static asset (not per-name
  generated); the illustration doesn't vary by chosen name in this iteration.

## Progress entities (dynamic, per-device, in `localStorage`)

### Progress Record
The single top-level object persisted in `localStorage` (one per device/browser profile).
- `stars`: total stars earned across all subjects
- `streak`: `{ count: number, lastPracticedDate: ISO date string }` — gentle streak indicator
- `tutorName`: the learner's chosen tutor character name (FR-001); a sensible default is used
  until she names it
- `topics`: map of Topic `id` → **Topic Progress**
- `parentPinHash`: salted hash of the parent PIN (absent until first set)
- `recentActivity`: bounded list (e.g., last 20 entries) of `{ topicId, timestamp, correct,
  hintLevelUsed, skillTag? }` — raw observed events, feeding both the home streak/stars
  display and the parent view's "recent activity" (FR-025) and its observed-vs-derived
  distinction (FR-027); `skillTag` is present only for Simple Word Problems attempts

### Topic Progress
Per-topic progress, keyed by Topic `id` inside Progress Record.
- `attempts`: bounded rolling window (last 5, per research.md mastery-rules decision) of
  `{ correct: boolean, hintLevelUsed: 0|1|2 }`
- `masteryStatus`: derived, not stored redundantly — computed from `attempts` by
  `mastery-rules.js` (`mastered` / `needsAttention` / `inProgress`) each time it's read, so
  there is exactly one source of truth for the rule

## Relationships

```
Subject 1---* Topic 1---* Practice Question
                 \
                  *---1 Reading Passage (Reading Comprehension topic only)

Progress Record 1---* Topic Progress (keyed by Topic.id)
Progress Record 1---* recentActivity entry
```

## Validation rules (from spec Functional Requirements)

- Every Topic MUST have a non-empty `explanation` before any `questions` are shown (FR-006).
- Every Practice Question MUST define both `hints.small` and `hints.big` before its
  `explanationSteps` are reachable (FR-008), and `explanationSteps` MUST contain at least one
  step (FR-007).
- Every Practice Question MUST define a `followUpQuestionId` pointing to another question in
  the same Topic (FR-010); content validation should fail a topic file that breaks this link.
- Only Addition & Subtraction questions may define `widget`; content validation should fail a
  topic file that sets `widget` outside that topic (FR-012).
- Only Simple Word Problems questions may define `skillTag`; content validation should flag
  (not necessarily fail) other topics defining it, since skill tagging may extend to more
  topics later (FR-015 is scoped to Simple Word Problems only, for now).
- `recentActivity` entries are append-only from the app's perspective; only the parent's
  explicit "clear progress" action (FR-028) empties Progress Record state.
- `masteryStatus` and the revision nudge are always derived from `attempts`/`recentActivity`
  at read time — never separately hand-set — so the two can never drift out of sync. The same
  applies to skill-tag insight statements (FR-026): always derived from `recentActivity`, and
  a tag with fewer than 3 attempts logged MUST NOT produce a statement.
