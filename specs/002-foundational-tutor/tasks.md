---

description: "Task list for Foundational Tutor (Math, English, Computer Studies)"
---

# Tasks: Foundational Tutor (Math, English, Computer Studies)

**Input**: Design documents from `/specs/002-foundational-tutor/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Automated tests are limited to the pure logic in `js/engine/`, `js/widgets/`, and
`js/voice/`, per the testing approach decided in research.md §4 (`node:test`, no framework).
UI and voice interaction flows are validated manually via the `quickstart.md` scenarios,
per Constitution Principle III — there is no separate TDD contract-test phase.

**Organization**: Tasks are grouped by user story (spec.md priorities P1-P5) so each story can
be implemented, validated via its quickstart section, and considered done independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on another incomplete task)
- **[Story]**: Which user story this task belongs to (US1-US5); Setup/Foundational/Polish tasks
  carry no story label
- File paths are relative to the repository root

## Path Conventions

Single static frontend project at the repository root (no backend), per plan.md:
`index.html`, `sw.js`, `css/`, `js/{engine,voice,widgets,views,content}/`, `tests/unit/`.

---

## Phase 1: Setup

**Purpose**: Project scaffolding — no application logic yet.

- [X] T001 Create the project directory structure per plan.md: `index.html` placeholder,
      `css/`, `js/engine/`, `js/voice/`, `js/widgets/`, `js/views/`,
      `js/content/{math,english,computer-studies}/`, `sw.js` placeholder, `tests/unit/`.
- [X] T002 Create `index.html`: single entry point with a root container, a `<link>` to
      `css/styles.css`, a `<script type="module" src="js/app.js">`, and inline registration
      of `sw.js` (`navigator.serviceWorker.register(...)`, feature-detected). Depends on T001.
- [X] T003 [P] Create `css/styles.css` with shared design tokens (colors, spacing, type scale)
      and base component styles satisfying spec FR-031 (large tap targets, simple language
      readability, encouraging tone) and the constitution's Content & Safety Constraints
      (age-appropriate visuals app-wide).
- [X] T004 [P] Initialize `package.json`: `"private": true`, no runtime dependencies, and a
      `"test": "node --test tests/unit"` script, per plan.md's `node:test`-only decision
      (research.md §4).
- [X] T005 [P] Add a static-site deployment config (`vercel.json`, or explicit confirmation
      that Vercel's zero-config static/"Other" preset needs no file) and a `README.md` section
      documenting local dev (`npx serve .`) and the GitHub → Vercel deploy flow, per
      research.md's Deployment decision.

**Checkpoint**: Repository scaffolding exists; nothing runs yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared engine/infrastructure every user story depends on. No learner-facing
content exists yet — this phase is not independently demoable.

**⚠️ CRITICAL**: No user story phase may begin until this phase is complete.

- [X] T006 [P] Implement `js/engine/progress-store.js`: get/set the Progress Record in
      `localStorage` per `contracts/progress-schema.md` — fields `version`, `stars`, `streak`
      (`{count, lastPracticedDate}`, resets to 1 not 0 after a missed day), `tutorName`,
      `topics` (map of topic id → `{attempts}`, `attempts` capped at the last 5 entries),
      `parentPinHash` (absent until set), `recentActivity` (capped at the last 20 entries,
      oldest dropped first, entries `{topicId, timestamp, correct, hintLevelUsed, skillTag?}`).
      Also implement the full-reset function used by "clear progress data" (FR-028).
- [X] T007 [P] Implement `js/engine/mastery-rules.js`: pure functions deriving, from a topic's
      `attempts`, `mastered` (last 3 attempts correct, at most 1 needing the bigger hint) /
      `needsAttention` (fewer than 3 correct in the last 5, OR the bigger hint used on more
      than half of them) / `inProgress`, per research.md §7. Covers both mastery (FR-005) and
      the revision nudge (FR-022). No write access to the Progress Record.
- [X] T008 [P] Implement `js/engine/hint-flow.js`: the shared staged-hint state machine used by
      every topic — incorrect attempt → small hint → incorrect again → bigger hint → auto-show
      `explanationSteps` (FR-008), plus an on-request path to show `explanationSteps` at any
      time (FR-009).
- [X] T009 [P] Implement `js/engine/tutor-character.js`: read/write `tutorName` via
      `progress-store.js`; supplies a sensible default name until the learner names it
      (FR-001), and a single helper views call to phrase any message as coming from that name
      (FR-002).
- [X] T010 [P] Implement `js/router.js`: minimal hash-route dispatch for
      `#/onboarding`, `#/home`, `#/subject/:subjectId`, `#/topic/:subjectId/:topicId`,
      `#/parent`.
- [X] T011 Implement `js/app.js`: boot sequence — read the Progress Record via
      `progress-store.js`; if `tutorName` is unset, route to `#/onboarding`, else `#/home`;
      register `sw.js`. Depends on T006, T009, T010.
- [X] T012 [P] Implement `sw.js`: a hand-written cache-first-with-runtime-population strategy
      for same-origin GET requests (app shell + `js/content/**` fetched at runtime) — no
      hardcoded precache manifest, so new content files are cached automatically as they're
      fetched, per research.md §3.
- [X] T013 [P] Unit test `tests/unit/progress-store.test.js`: capping rules (5 attempts, 20
      recent-activity entries), streak reset-to-1 behavior, and the full-reset function.
- [X] T014 [P] Unit test `tests/unit/mastery-rules.test.js`: the exact thresholds from
      research.md §7 (mastered / needsAttention / inProgress boundary cases).
- [X] T015 [P] Unit test `tests/unit/hint-flow.test.js`: small hint → bigger hint → auto-shown
      `explanationSteps` sequencing, and the on-request shortcut.

**Checkpoint**: Shared engine and app shell exist. User story implementation can now begin.

---

## Phase 3: User Story 1 - Master the Core Learning Loop: Addition & Subtraction (Priority: P1) 🎯 MVP

**Goal**: A first-time learner names her tutor character, then opens Addition & Subtraction
and completes one full explain → try (via an interactive number line) → hint → solve →
understand-mistake → similar-practice loop, polished enough to be genuinely good to use.

**Independent Test**: Name the tutor, open Addition & Subtraction, answer a question via the
number line (both correctly and incorrectly through both hint stages), see the step-by-step
solution, complete the follow-up question, and confirm a star + persistence — with no other
topic or subject built yet (quickstart.md Story P1).

### Implementation for User Story 1

- [X] T016 [P] [US1] Author `js/content/math/addition-subtraction.json` per
      `contracts/content-schema.md`: `explanation.text`/`.example`; at least 4 practice
      questions, each with `hints.small`/`.big`, a non-empty `explanationSteps` array, a
      `followUpQuestionId` pointing to another question in the file, and a `widget:
      {type: "number-line", min, max, start}`; content leveled to *New Mathematics Today - 3*.
- [X] T017 [US1] Implement `js/widgets/number-line.js`: an interactive number-line control
      built on native Pointer Events (drag + a step-tap fallback per the edge case for
      imprecise touch), constrained to the question's `widget.min`/`.max` range (FR-013),
      emitting the selected value for `topic.js` to check.
- [X] T018 [US1] Implement `js/views/onboarding.js`: first-run flow inviting the learner to
      pick a tutor name from a short preset list or type her own (FR-001); writes the choice
      via `js/engine/tutor-character.js` (T009), then routes to `#/home`.
- [X] T019 [US1] Implement `js/views/topic.js`: renders a topic's `explanationSteps` as a
      numbered list (FR-007) before any question; renders `js/widgets/number-line.js` (T017)
      when a question defines `widget`, otherwise a text/multiple-choice input; on submit,
      checks the answer, drives `js/engine/hint-flow.js` (T008) on incorrect attempts, awards
      a star and a tutor-voiced encouraging message via `js/engine/progress-store.js` (T006)
      and `js/engine/tutor-character.js` (T009) on correct, and offers the linked
      `followUpQuestionId` afterward (FR-010). Depends on T006, T008, T009, T017.
- [X] T020 [US1] Implement `js/views/subject.js`: lists a subject's topics and links to
      `#/topic/:subjectId/:topicId`. Depends on T010.
- [X] T021 [US1] Implement `js/views/home.js`: tutor greeting (via T009), a "today's mission"
      pointing at the next topic to practice, subject shortcuts, and the shared progress
      summary (stars/streak/mastery via T006/T007) (FR-004, FR-005). Depends on T006, T007,
      T009.
- [X] T022 [US1] Wire `js/router.js` (T010) to `js/views/onboarding.js` (T018),
      `js/views/home.js` (T021), `js/views/subject.js` (T020), and `js/views/topic.js` (T019).
- [X] T023 [P] [US1] Unit test `tests/unit/number-line.test.js`: the pure position ↔ value
      mapping and range-clamping logic extracted from `js/widgets/number-line.js` (T017).
- [ ] T024 [US1] Manual validation: run `quickstart.md` Story P1, steps 1-7, in a real browser.
      Do not proceed to Phase 4 until this loop feels genuinely good to use, not just
      functionally correct, per spec's explicit "one excellent loop first" direction.

**Checkpoint**: The flagship loop is fully functional and independently testable.

---

## Phase 4: User Story 2 - Expand Math to the Remaining Topics (Priority: P2)

**Goal**: Place Value, Multiplication Tables, Division basics, and Simple Word Problems reuse
the proven loop from User Story 1, via multiple-choice/typed answers (no bespoke widget).

**Independent Test**: Open each of the four remaining Math topics, complete an explanation and
practice set (with hints and the follow-up question) in each, and confirm stars/mastery are
recorded and Simple Word Problems attempts carry a `skillTag` (quickstart.md Story P2).

### Implementation for User Story 2

- [X] T025 [P] [US2] Author `js/content/math/place-value.json` per
      `contracts/content-schema.md` (no `widget` field), leveled to *New Mathematics Today - 3*.
- [X] T026 [P] [US2] Author `js/content/math/multiplication-tables.json`, carrying forward the
      content and interactions already proven in `specs/001-practice-hub` (spec Assumptions),
      reshaped to this feature's schema.
- [X] T027 [P] [US2] Author `js/content/math/division.json`, leveled to *New Mathematics
      Today - 3*.
- [X] T028 [P] [US2] Author `js/content/math/word-problems.json`: every question additionally
      carries a `skillTag` (e.g. `operation-identification` vs. `computation`) identifying the
      specific skill it targets (FR-015).
- [X] T029 [US2] Implement `js/engine/quick-challenge.js`: samples 3-5 questions across topics
      whose explanation the learner has already seen (FR-021). Depends on T006.
- [X] T030 [P] [US2] Unit test `tests/unit/quick-challenge.test.js`: sampling only pulls from
      "already seen" topics and returns 3-5 questions.
- [X] T031 [US2] Extend `js/views/home.js` (T021) "today's mission" to also offer a Quick
      Challenge (via T029) once more than one topic has been opened. Depends on T021, T029.
- [X] T032 [US2] Extend `js/views/topic.js`'s answer-recording path (T019) to pass a question's
      `skillTag` through to `js/engine/progress-store.js` (T006) when present, so it lands in
      `recentActivity`. Depends on T019, T006, T028.
- [X] T033 [US2] Update `js/views/subject.js` (T020) Math topic ordering: Addition &
      Subtraction, then Place Value, Multiplication Tables, Division, Simple Word Problems.
      Depends on T020, T025, T026, T027, T028.
- [X] T034 [US2] Manual validation: run `quickstart.md` Story P2, steps 1-3.

**Checkpoint**: All five Math topics work independently and together; skill tags are flowing
into progress data for User Story 5 to consume later.

---

## Phase 5: User Story 3 - Practice English Topics with Reading Guide (Priority: P3)

**Goal**: Reading Comprehension (with read-aloud/word-highlighting and "read it yourself"),
Vocabulary, Grammar Basics, and Sentence Formation, all on the shared explain-practice-hint
loop.

**Independent Test**: Open each English topic; use read-aloud and "read it yourself" on a
passage; complete a vocabulary match-the-meaning quiz and a grammar/sentence-formation set —
independent of Math and Computer Studies (quickstart.md Story P3).

### Implementation for User Story 3

- [X] T035 [P] [US3] Author `js/content/english/reading-passages.json`, carrying forward and
      extending the passages from `specs/001-practice-hub`, leveled to *Gul Mohar – Language
      for Life Reader 3*; each passage has `comprehensionQuestionIds` referencing entries in
      `questions`.
- [X] T036 [P] [US3] Author `js/content/english/vocabulary.json`, carrying forward and
      extending the word cards from `specs/001-practice-hub` (word, definition, example
      sentence) plus a match-the-meaning quiz question set.
- [X] T037 [P] [US3] Author `js/content/english/grammar.json`, leveled to *Good Grammar with
      Composition Book 3* by Peter Clutterbuck.
- [X] T038 [P] [US3] Author `js/content/english/sentence-formation.json` (fill-in-the-blank
      style), leveled to *Gul Mohar – Language for Life Reader 3*.
- [X] T039 [US3] Implement `js/voice/read-aloud.js`: `SpeechSynthesis` wrapper that speaks a
      passage and highlights the current word via boundary events (FR-018).
- [X] T040 [US3] Implement `js/voice/read-it-yourself.js`: `SpeechRecognition` wrapper that
      compares the transcript against the passage text and produces a gentle, non-strict list
      of words that may need another try (FR-019).
- [X] T041 [US3] Implement `js/views/reading-passage.js`: renders passage text, wires the
      read-aloud (T039) and "read it yourself" (T040) controls with feature-detection so each
      hides/disables independently when unsupported (FR-020), then hands off to the shared
      practice-question flow in `js/views/topic.js` (T019) for its comprehension questions.
      Depends on T019, T039, T040.
- [X] T042 [US3] Extend `js/views/subject.js`/`js/router.js` (T020/T010) so Reading
      Comprehension routes to `js/views/reading-passage.js` (T041) and the other three English
      topics route to `js/views/topic.js` (T019). Depends on T020, T041, T036, T037, T038.
- [X] T043 [P] [US3] Unit test `tests/unit/read-it-yourself.test.js`: the pure
      transcript-vs-expected-text comparison logic extracted from T040 (not the
      `SpeechRecognition` API itself).
- [ ] T044 [US3] Manual validation: run `quickstart.md` Story P3, steps 1-5, in Chrome/Edge,
      then repeat to confirm graceful degradation in Firefox and Safari.

**Checkpoint**: English is fully usable independently of Math and Computer Studies.

---

## Phase 6: User Story 4 - Practice Computer Studies Topics (Priority: P4)

**Goal**: Parts of a Computer, Input & Output Devices, Keyboard & Mouse Basics, and Internet
Safety Basics, on the same shared loop — no new mechanics.

**Independent Test**: Open each Computer Studies topic and complete its explanation and
practice set with hints, independent of Math and English (quickstart.md Story P4).

### Implementation for User Story 4

- [X] T045 [P] [US4] Author `js/content/computer-studies/parts-of-computer.json`, leveled to
      *CompWiz - Class 3*.
- [X] T046 [P] [US4] Author `js/content/computer-studies/io-devices.json`, leveled to *CompWiz
      - Class 3*.
- [X] T047 [P] [US4] Author `js/content/computer-studies/keyboard-mouse.json`, leveled to
      *CompWiz - Class 3*.
- [X] T048 [P] [US4] Author `js/content/computer-studies/internet-safety.json`, leveled to
      *CompWiz - Class 3*.
- [X] T049 [US4] Extend `js/views/subject.js`/`js/router.js` (T020/T010) to route all four
      Computer Studies topics through the shared `js/views/topic.js` (T019) flow. Depends on
      T020, T045, T046, T047, T048.
- [ ] T050 [US4] Manual validation: run `quickstart.md` Story P4, steps 1-2.

**Checkpoint**: All three subjects are independently functional end to end.

---

## Phase 7: User Story 5 - Parent Understands Why, Not Just the Score (Priority: P5)

**Goal**: A PIN-gated parent view showing per-subject summaries, specific skill-based insight
statements (gated by a minimum sample size), topics needing attention, recent activity, and a
way to clear progress.

**Independent Test**: Enter the PIN, view the summary and skill-specific insight statements for
topics already practiced in the earlier stories (confirming the ≥3-attempt gate), and clear
progress data (quickstart.md Story P5).

### Implementation for User Story 5

- [X] T051 [US5] Implement the PIN set/check flow in `js/views/parent.js`: first-time PIN
      setup and later checks store/compare a salted hash via `parentPinHash` in
      `js/engine/progress-store.js` (T006) — never the raw PIN (FR-024).
- [X] T052 [US5] Implement `js/engine/skill-insights.js`: aggregates `recentActivity` entries
      by `skillTag`, and emits a plain-language statement for a tag only once at least 3
      attempts against it are logged, using small hand-written template strings keyed by tag
      (research.md §10, FR-026). No write access to the Progress Record.
- [X] T053 [P] [US5] Unit test `tests/unit/skill-insights.test.js`: no statement is produced
      below the 3-attempt threshold; the correct template text is produced once the threshold
      is met.
- [X] T054 [US5] Implement the parent per-subject summary, "needs attention" topic list (via
      `js/engine/mastery-rules.js`, T007), skill-specific insight statements (via T052), and
      recent activity list in `js/views/parent.js`, always showing raw observed counts
      separately from any derived statement — skill insight or revision nudge alike (FR-025,
      FR-026, FR-027). Depends on T007, T052.
- [X] T055 [US5] Implement "clear progress data" in `js/views/parent.js`: a confirmation
      prompt, then the full-reset function from `js/engine/progress-store.js` (T006) (FR-028).
      Depends on T006, T051.
- [ ] T056 [US5] Manual validation: run `quickstart.md` Story P5, steps 1-5.

**Checkpoint**: All five user stories work independently and together.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Whole-app verification once every story exists.

- [X] T057 [P] Confirm `sw.js` (T012)'s runtime caching covers every shipped static asset and
      content file; re-run the offline cross-cutting check from `quickstart.md` (FR-029,
      SC-007).
- [ ] T058 [P] Run an accessibility/UI consistency pass across every view against FR-031 and
      the constitution's Content & Safety Constraints (large tap targets, simple language,
      encouraging tone, no interface pattern assuming adult/teen fluency).
- [ ] T059 Run the remaining `quickstart.md` cross-cutting checks: Quick Challenge scoping
      (FR-021), no network calls beyond the app's own static files (FR-032), and tutor
      character consistency across all five stories (SC-003).
- [X] T060 Run `node --test tests/unit` and confirm every unit test passes.
- [X] T061 [P] Update `README.md` with any local-dev or deployment notes that changed during
      implementation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS every user story.
- **User Story 1 (Phase 3)**: Depends on Foundational only. This is the flagship loop; do not
  start Phase 4 until Phase 3's checkpoint (T024) is genuinely satisfied.
- **User Story 2 (Phase 4)**: Depends on Foundational; reuses `js/views/topic.js` and
  `js/views/subject.js` from Phase 3, so in practice follows it, though it introduces no new
  dependency on Phase 3's number-line widget specifically.
- **User Story 3 (Phase 5)**: Depends on Foundational and on `js/views/topic.js` (Phase 3) for
  its comprehension-question flow; otherwise independent of Phases 4 and 6-7.
- **User Story 4 (Phase 6)**: Depends on Foundational and on `js/views/topic.js` (Phase 3);
  independent of Phases 4-5 and 7.
- **User Story 5 (Phase 7)**: Depends on Foundational; its skill-insight feature is only
  meaningful once Phase 4 (Simple Word Problems' `skillTag`s) has produced data, so it follows
  Phase 4 in practice even though its own code has no import-time dependency on it.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- Setup: T003, T004, T005 in parallel once T001-T002 land.
- Foundational: T006-T010 and T012 in parallel; T013-T015 in parallel once their respective
  implementation tasks land.
- Content-authoring tasks within any story phase (e.g., T025-T028, T035-T038, T045-T048) are
  all `[P]` — different files, no shared state, and each only needs `contracts/
  content-schema.md`, not another content file.
- Across stories: once Phase 3 lands, Phases 5 and 6 (English, Computer Studies) have no
  dependency on each other and can proceed in parallel if staffed; Phase 4 (remaining Math)
  can also proceed in parallel with them, though Phase 7 (parent insights) benefits from Phase
  4 landing first.

---

## Parallel Example: User Story 1

```bash
# Once Phase 2 (Foundational) is complete, in parallel:
Task: "Author js/content/math/addition-subtraction.json per contracts/content-schema.md"
Task: "Implement js/widgets/number-line.js interactive control"

# Then, once the widget exists, topic.js/subject.js/home.js/onboarding.js proceed together
# where file boundaries allow, converging on T022's router wiring.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1) — the flagship loop.
3. **STOP and VALIDATE**: run `quickstart.md` Story P1 in a real browser; confirm it feels
   genuinely good to use, not just functionally correct (per spec's explicit direction).
4. Only then proceed to Phase 4 onward.

### Incremental Delivery

1. Setup + Foundational → shell ready, nothing learner-facing yet.
2. Phase 3 (US1) → flagship loop demoable (MVP).
3. Phase 4 (US2) → full Math subject demoable.
4. Phase 5 (US3) and Phase 6 (US4) → English and Computer Studies, addable in either order or
   in parallel.
5. Phase 7 (US5) → parent insight view, most useful once Phase 4's word-problem skill tags
   have real data behind them.
6. Phase 8 (Polish) → whole-app verification.

## Notes

- `[P]` tasks touch different files with no dependency on another incomplete task.
- Every task lists an exact file path; there are no vague "implement the feature" tasks.
- Unit tests exist only for pure logic (`js/engine/*`, the number-line's value math, the
  read-it-yourself comparison), per research.md §4 — UI and voice interaction are verified
  manually via `quickstart.md`, not automated.
- Commit after each task or logical group; stop at any phase checkpoint to validate that
  story independently before continuing.
