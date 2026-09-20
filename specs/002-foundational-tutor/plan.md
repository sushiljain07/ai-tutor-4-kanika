# Implementation Plan: Foundational Tutor (Math, English, Computer Studies)

**Branch**: `002-foundational-tutor` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-foundational-tutor/spec.md`

## Summary

Expand the current static, offline, no-login learning app into a three-subject foundational
tutor (Math, English, Computer Studies) for a Class 3 ICSE student, each subject built from
hand-authored topics that follow one shared explain → practice → staged-hint → follow-up
pattern, fronted by a named, consistent tutor character, plus a PIN-gated parent view that
gives skill-specific insight (not just a score). The Addition & Subtraction topic is the one
flagship "excellent learning loop" — built first, with an interactive number-line answer
control — before any other Math topic gets its own visual widget. Technical approach: a plain
HTML/CSS/JS static site (no framework, no bundler, no backend), content stored as versioned
JSON files loaded at runtime, progress (including tutor name and skill-tag history) persisted
in `localStorage`, offline support via a small hand-written service worker, the number-line
widget built with native pointer events (no drag/gesture library), and the English
reading-guide/pronunciation features built entirely on the browser-native Web Speech API.
Deployed to Vercel as a static site via GitHub, matching the project's "no fixed stack,
decide per-feature" governance and its simplicity principle.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022, native ES modules), HTML5, CSS3 — no
transpilation or bundler required.

**Primary Dependencies**: None at runtime. Dev-only dependency: a lightweight test runner
(`node:test`, Node's built-in runner) for pure-logic unit tests — see research.md for
rationale on why a framework was rejected.

**Storage**: Browser `localStorage` for the Progress Record and Parent PIN (client-only, no
server, no database). Topic/question/passage content lives in static JSON files bundled with
the app and fetched at runtime; there is no writable content store.

**Testing**: `node:test` (Node's built-in test runner) for the engine's pure logic (hint
staging, mastery/revision rule evaluation, answer checking); a manual quickstart scenario
checklist (`quickstart.md`) for UI and voice-feature validation, run in a real browser per
Constitution Principle III ("validated manually... against a realistic tutoring scenario").

**Target Platform**: Modern evergreen browsers (Chrome, Edge, Safari, Firefox) on desktop,
tablet, and mobile. Voice features (read-aloud, "read it yourself") depend on the Web Speech
API, whose support varies by browser — see research.md; the app degrades gracefully where
unsupported, per spec FR-020.

**Project Type**: Single-page frontend web application (no backend project).

**Performance Goals**: Initial page load usable within 2 seconds on a typical home broadband
connection; all in-app interactions (navigating topics, submitting an answer, revealing a
hint) feel instant (<100ms) since everything runs client-side against local data.

**Constraints**: Must remain fully usable offline after the first successful load (spec
FR-029, SC-007); must work with no user account, login, or backend of any kind; voice features
must use only browser-native APIs (no external speech service or API key).

**Scale/Scope**: Single learner, single family, single device at a time. Roughly 13 topics
across 3 subjects, each with an explanation plus a small practice-question bank (order of a
few hundred questions total) and a handful of reading passages/vocabulary sets — no
concurrency or multi-tenancy concerns. Exactly one topic (Addition & Subtraction) ships with a
bespoke interactive widget in this iteration; every other topic uses multiple-choice/typed
answers, per spec FR-012/FR-032 (phased rollout, not a permanent restriction).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

| Principle / Constraint | Check | Result |
|---|---|---|
| I. Accurate & Pedagogically Sound Content | Content authored to match learner's actual textbooks per subject (spec FR-014, FR-016, FR-017), reviewed before shipping, no live/generative content that could hallucinate | PASS |
| II. Learner-Centered Simplicity | No framework, no backend, no build step, no speculative abstractions; a generic "pluggable subject" system was explicitly rejected in favor of 3 concrete subject implementations; the interactive widget is deliberately scoped to one topic (FR-012) rather than a general manipulatives library, and the tutor character is a copy/persona layer, not a chat system | PASS |
| III. Iterative, Verified Delivery | Unit tests for engine logic + a mandatory manual quickstart run per user story before any story is marked done; tech stack chosen for this feature specifically, not inherited by default | PASS |
| Content & Safety Constraints | UI/interaction plan (large tap targets, simple language, gentle non-punitive feedback) applies app-wide; no fixed stack was mandated by the constitution, so this plan's stack choice is this feature's own decision | PASS |
| Development Workflow | Following spec → plan → tasks → implement; each user story's quickstart scenario doubles as its "realistic tutoring scenario" verification | PASS |

No violations identified. Complexity Tracking table below is left empty.

**Post-Phase 1 re-check**: `data-model.md` and `contracts/` were reviewed against the same
five rows above after design — no new dependencies, no backend, no generic subject-plugin
abstraction were introduced (content stays as concrete per-subject JSON files per
`contracts/content-schema.md`); mastery/revision logic stays rule-based and isolated in one
module (`js/engine/mastery-rules.js`), not a modeling framework. Gate still PASSES.

## Project Structure

### Documentation (this feature)

```text
specs/002-foundational-tutor/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── content-schema.md
│   └── progress-schema.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html                    # app shell: single entry point, loads app.js as a module
sw.js                          # hand-written network-first (cache-fallback) service worker
css/
└── styles.css                # shared design tokens, layout, child-friendly component styles

js/
├── app.js                     # boots the app, wires the simple hash-based router
├── router.js                  # minimal hash-route -> view dispatch (home/subject/topic/parent)
├── engine/
│   ├── progress-store.js      # localStorage read/write for the Progress Record
│   ├── hint-flow.js           # shared staged-hint state machine used by every topic
│   ├── mastery-rules.js       # mastery + revision-nudge threshold evaluation
│   ├── skill-insights.js      # aggregates skill-tag attempts into parent insight statements
│   │                          # (enforces the FR-026 minimum-sample-size rule)
│   ├── tutor-character.js     # stores/retrieves the chosen tutor name; supplies it to views
│   └── quick-challenge.js     # cross-topic question sampling for Quick Challenge
├── voice/
│   ├── read-aloud.js          # SpeechSynthesis wrapper + word-boundary highlighting
│   └── read-it-yourself.js    # SpeechRecognition wrapper + gentle mismatch feedback
├── widgets/
│   └── number-line.js         # flagship interactive number-line control (native pointer
│                              # events; drag + step-tap fallback), used only by the
│                              # Addition & Subtraction topic per FR-012/FR-013
├── views/
│   ├── onboarding.js          # first-run "name your tutor" flow (FR-001)
│   ├── home.js                # tutor greeting, today's mission, subject shortcuts, progress
│   ├── subject.js              # topic list for a subject
│   ├── topic.js                # explanation + practice-question flow (shared by all subjects;
│   │                          # renders number-line.js only for Addition & Subtraction questions)
│   ├── reading-passage.js     # Reading Comprehension view (extends topic.js with voice controls)
│   └── parent.js               # PIN gate + parent summary + skill-insight view
└── content/
    ├── math/                  # place-value.json, addition-subtraction.json,
    │                          # multiplication-tables.json, division.json, word-problems.json
    ├── english/                # reading-passages.json, vocabulary.json, grammar.json,
    │                          # sentence-formation.json
    └── computer-studies/       # parts-of-computer.json, io-devices.json,
                                # keyboard-mouse.json, internet-safety.json

tests/
└── unit/                       # node:test files mirroring js/engine/*.js
```

**Structure Decision**: Single static frontend project at the repository root (no `backend/`
or `api/` directory — none is needed since the app has no server-side behavior). Content is
organized as JSON data files under `js/content/`, one file per topic, so new topics can be
added without touching application code (spec FR-030). `js/engine/` holds all subject-agnostic
logic (hints, mastery, progress) so the three subjects share one implementation rather than
duplicating it per subject.

## Complexity Tracking

*No Constitution Check violations were identified; this table is intentionally empty.*
