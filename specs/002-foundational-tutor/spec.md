# Feature Specification: Foundational Tutor (Math, English, Computer Studies)

**Feature Branch**: `002-foundational-tutor`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Expand the existing static, no-login, no-backend learning app (specs/001-practice-hub) into a broader foundational tutor covering Math, English, and Computer Studies for a Class 3 ICSE student (Kanika, age 7-8), superseding it. Fully static: no backend, no AI/LLM API, no live chat, no accounts beyond a parent PIN gate; all content hand-authored; progress in localStorage; deployed as a static site on Vercel via GitHub. Give the tutor a named character (encouraging, not distracting). Prioritize one excellent, fully interactive learning loop (choose topic → learn → try → hint → solve → understand mistake → practice similar) over breadth; for Math specifically, support a visual/interactive answer input (not just text/MCQ) for the flagship topic. Give the parent view specific, plain-language insight into *why* the learner is struggling (e.g. which skill within a topic), not just a score, using rule-based tagging rather than machine learning. Voice input and image-based questions beyond the existing English reading-guide feature are noted as future enhancements, not built now. Home screen with greeting from the tutor character, a recommended 'today's mission', subject shortcuts, and a shared stars/streak/mastery progress summary. Math topics: Addition & Subtraction (flagship, built first, with an interactive number-line), Place Value, Multiplication Tables, Division basics, Simple Word Problems (tagged by skill for parent insight). English topics: Reading Comprehension (with read-aloud/word-highlighting and 'read it yourself' pronunciation practice), Vocabulary, Grammar Basics, Sentence Formation. Computer Studies topics: Parts of a Computer, Input & Output Devices, Keyboard & Mouse Basics, Internet Safety Basics. Every topic: short explanation broken into numbered steps with example, then practice questions with staged hints (small hint, then bigger hint) before the answer is shown, followed by a similar follow-up question; all feedback positive, no penalties. A Quick Challenge mode (3-5 questions across topics). A rule-based (non-ML) Revision nudge for topics with low accuracy or heavy hint use. A PIN-gated parent view showing per-subject summaries, skill-specific insight statements (with a minimum sample size before speaking to a pattern), topics needing attention, and recent activity, distinguishing observed activity from derived suggestions, with a way to clear local progress data. Gamification limited to stars and a gentle streak. Out of scope for now: open-ended AI/LLM chat, a backend or server, real user authentication, parent-uploaded syllabus/content management, subjects/topics beyond those listed, voice/image input beyond English reading, and interactive visual widgets for Math topics beyond the Addition & Subtraction flagship (all addable later)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Master the Core Learning Loop: Addition & Subtraction (Priority: P1)

Kanika meets her tutor character for the first time and picks its name. She then opens Math,
goes to Addition & Subtraction, reads a short, step-by-step explanation with an interactive
number line, and tries a practice question by dragging or tapping along the number line. If
she's stuck, she gets a small hint, then a bigger hint, before seeing the full step-by-step
solution — and is then offered a similar question to prove she's got it.

**Why this priority**: This is the one loop the whole app is judged by before anything else is
built out: choose topic → learn → try → hint → solve → understand mistake → practice similar.
It must work exceptionally well, using a real interactive visual (not just text/multiple
choice), before any other topic or subject receives the same polish.

**Independent Test**: Can be fully tested by naming the tutor character, opening Addition &
Subtraction, reading its stepped explanation, answering a practice question using the number
line (both correctly and incorrectly, exercising both hint stages), seeing the step-by-step
solution, and completing the follow-up question — with no other topic or subject built yet.

**Acceptance Scenarios**:

1. **Given** this is the learner's first time opening the app, **When** she reaches the home
   screen, **Then** she is invited to name her tutor character (from a short list of suggested
   names or a name she types herself) before continuing.
2. **Given** the tutor character has been named, **When** she sees any greeting, hint, or
   encouraging message anywhere in the app, **Then** it is presented as coming from that named
   character, consistently.
3. **Given** the home screen, **When** Kanika taps the Math shortcut and then Addition &
   Subtraction, **Then** she sees a step-by-step explanation (numbered steps, not one block of
   text) with a worked example using a number line.
4. **Given** a practice question in this topic, **When** she answers it, **Then** she can do so
   by dragging or tapping her way along an interactive number line, not only by typing or
   choosing from text options.
5. **Given** she answers incorrectly, **When** she tries again, **Then** she is offered a small
   hint, then a bigger hint if still stuck, before the step-by-step solution is shown.
6. **Given** the step-by-step solution has been shown (via hints or on request), **When** she
   continues, **Then** she is offered a similar follow-up question to confirm she now
   understands.
7. **Given** she answers correctly, **When** the answer is submitted, **Then** the named tutor
   character awards a star with an encouraging message, with no penalty ever applied for
   earlier incorrect attempts or hint use.

---

### User Story 2 - Expand Math to the Remaining Topics (Priority: P2)

Once Addition & Subtraction is working exceptionally well, Kanika can also practice Place
Value, Multiplication Tables, Division basics, and Simple Word Problems, using the same
explain → practice → hint → follow-up loop and the same named tutor character, via
multiple-choice or typed answers (these topics do not yet have their own bespoke interactive
visual widget).

**Why this priority**: These topics reuse the loop proven in User Story 1 rather than
introducing new mechanics, and Multiplication Tables carries forward already-proven content
from the current MVP — so this is natural, lower-risk breadth once the flagship loop is solid.

**Independent Test**: Can be fully tested by opening each of the four remaining Math topics,
completing an explanation and practice set (including hints and the follow-up question) in
each, and confirming stars and topic mastery are recorded — independent of English, Computer
Studies, and without needing a second interactive widget to exist.

**Acceptance Scenarios**:

1. **Given** the Math topic list, **When** Kanika opens Place Value, Multiplication Tables,
   Division basics, or Simple Word Problems, **Then** she sees the same stepped-explanation-
   then-practice-with-hints pattern as Addition & Subtraction, using text/multiple-choice or
   typed answers.
2. **Given** a Simple Word Problems question, **When** she answers it incorrectly, **Then** the
   attempt is recorded against the specific skill that question targets (e.g., choosing the
   right operation, versus carrying out the calculation), for later use in the parent view.
3. **Given** she has practiced a topic enough to meet its mastery criteria, **When** she
   returns to the progress summary, **Then** that topic is shown as mastered.

---

### User Story 3 - Practice English Topics with Reading Guide (Priority: P3)

Kanika goes to English, and can read short passages (with read-aloud and word-highlighting
support, plus a "read it yourself" pronunciation practice), browse vocabulary word cards,
and practice grammar basics and sentence formation — each with the same explain-then-practice
pattern and gentle hint-based feedback as Math.

**Why this priority**: English carries forward the most content from the current MVP
(reading passages, vocabulary) and adds the reading-guide/pronunciation feature, which is
this feature's most distinctive addition beyond the shared topic pattern.

**Independent Test**: Can be fully tested by opening each English topic, using read-aloud and
"read it yourself" on a passage, completing a vocabulary match-the-meaning quiz, and
completing a grammar/sentence-formation practice set with hints — independent of Math and
Computer Studies.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** Kanika taps the English shortcut, **Then** she sees the
   English topics: Reading Comprehension, Vocabulary, Grammar Basics, and Sentence Formation.
2. **Given** a reading passage is open, **When** she taps "read aloud", **Then** the passage
   is read aloud with the currently spoken word highlighted as a reading guide.
3. **Given** a reading passage is open, **When** she taps "read it yourself" and reads the
   passage aloud, **Then** the app listens and gives her gentle, encouraging feedback
   indicating which words she may want to try again, without a pass/fail grade or penalty.
4. **Given** her browser does not support the microphone-based "read it yourself" feature,
   **When** she opens a passage, **Then** the read-aloud and comprehension question flow still
   works normally, with only that one control unavailable.
5. **Given** a passage's comprehension questions, vocabulary quiz, grammar, or sentence
   formation exercise, **When** she answers, **Then** the same star-and-hint feedback pattern
   from Math applies (small hint, bigger hint, then step-by-step explanation, then a similar
   follow-up question).

---

### User Story 4 - Practice Computer Studies Topics (Priority: P4)

Kanika goes to Computer Studies and works through Parts of a Computer, Input & Output
Devices, Keyboard & Mouse Basics, and Internet Safety Basics using the same explain-then-
practice pattern as the other subjects.

**Why this priority**: Computer Studies reuses the same interaction pattern already proven by
Math and English, and introduces no new mechanics, so it is the last subject to build.

**Independent Test**: Can be fully tested by opening each Computer Studies topic, reading its
explanation, and completing its practice questions with hints — independent of Math and
English.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** Kanika taps the Computer Studies shortcut, **Then** she
   sees its four topics.
2. **Given** a Computer Studies topic, **When** she opens it, **Then** she sees a short,
   age-appropriate, step-by-step explanation followed by practice questions using the same
   hint-then-answer pattern as the other subjects.

---

### User Story 5 - Parent Understands Why, Not Just the Score (Priority: P5)

A parent opens a PIN-protected view and sees a per-subject summary of what Kanika has
practiced, plain-language insight into *specific* skills she's struggling with (not just a
percentage), which topics may need attention, and recent activity — with the option to clear
her locally stored progress.

**Why this priority**: This is the most valuable parent-facing feature, but it depends on
Math/English/Computer Studies already generating enough tagged activity to say anything
meaningful, so it is built last.

**Independent Test**: Can be fully tested by entering the correct PIN, viewing the summary,
skill-specific insight statements, and recent activity for topics already practiced under the
other stories, and clearing progress data — independent of any further learner-facing changes.

**Acceptance Scenarios**:

1. **Given** the parent view entry point, **When** an incorrect PIN is entered, **Then** access
   is denied and the child's practice screens remain unaffected.
2. **Given** the correct PIN is entered, **When** the parent view opens, **Then** it shows a
   per-subject practice summary and a list of topics currently flagged as needing attention.
3. **Given** at least 3 attempts have been logged against a specific skill tag (e.g.,
   "identifying the operation in a word problem"), **When** the parent views that subject,
   **Then** they see a specific, plain-language statement about that skill (e.g., "she
   understands multiplication but struggles when a word problem requires identifying the
   operation"), clearly separated from the raw observed numbers it's based on (e.g., "missed 4
   of the last 10 questions").
4. **Given** a skill tag has fewer than 3 logged attempts, **When** the parent views that
   subject, **Then** no pattern statement is shown for that skill yet, to avoid overstating a
   conclusion from too little data.
5. **Given** the parent chooses to clear progress data, **When** the action is confirmed,
   **Then** all locally stored stars, streaks, skill-tag history, and mastery/attention status
   are reset.

---

### Edge Cases

- What happens when Kanika answers the same question incorrectly several times in a row? She
  keeps receiving encouraging, staged hints and is never blocked, shamed, or penalized; after
  a reasonable number of attempts the step-by-step solution is shown automatically rather than
  repeating hints indefinitely.
- What happens if she drags the number-line marker to an invalid or out-of-range position? The
  control gently constrains her to the valid range rather than accepting or erroring on an
  out-of-bounds value.
- What happens if a device has no reliable touch/mouse precision for the number line (e.g., a
  very small screen)? The number line remains usable via simple tap/step controls (e.g.,
  tap-to-move-one-step) rather than requiring a precise drag gesture.
- What happens if Kanika wants to rename her tutor character later? A simple way to rename it
  is available (e.g., from the parent view or a settings entry point), and the new name applies
  consistently going forward without affecting stored progress.
- What happens if browser storage is unavailable or is cleared? The app still works for the
  current session; progress simply does not persist to the next visit, without an error.
- What happens if a subject or topic runs out of unseen practice questions? The app cycles
  back through the existing question set rather than dead-ending.
- What happens if text-to-speech or speech-recognition is unsupported in the browser? Read-
  aloud/"read it yourself" controls are simply hidden or disabled; the rest of the Reading
  Comprehension flow (reading the text, answering questions) is unaffected.
- What happens if the child mumbles or the microphone mishears her during "read it yourself"?
  Feedback stays encouraging and non-punitive (e.g., "let's try that word again") rather than
  reporting a strict error count.
- What happens if the wrong PIN is entered repeatedly for the parent view? Access continues to
  be denied; the app does not lock out or alarm, it simply does not grant entry.
- What happens when a Quick Challenge draws from a subject/topic Kanika hasn't practiced yet?
  Quick Challenge only pulls questions from topics whose explanation she has already seen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On first use, the system MUST invite the learner to name her tutor character,
  either by choosing from a short list of suggested names or entering her own.
- **FR-002**: Every greeting, hint, encouraging message, and piece of feedback anywhere in the
  app MUST be presented as coming from the named tutor character, consistently.
- **FR-003**: The tutor character MUST be presented as a simple, consistent visual presence
  (e.g., one small static illustration) that is encouraging without being distracting — no
  continuously looping animation and no more than one character shown at a time.
- **FR-004**: The home screen MUST show the tutor character's greeting, one recommended
  "today's mission" (a suggested topic or a Quick Challenge), and shortcuts to all three
  subjects (Math, English, Computer Studies).
- **FR-005**: The home screen MUST show a shared progress summary: total stars earned, a
  gentle practice-streak indicator, and which topics/tables are currently mastered.
- **FR-006**: Every topic, in every subject, MUST present a short, age-appropriate explanation
  with a worked example before any practice question on that topic.
- **FR-007**: Every explanation MUST be broken into a short sequence of numbered steps rather
  than a single block of text, so the learner can follow how an answer is reached.
- **FR-008**: For every practice question, an incorrect attempt MUST first offer a small hint,
  then a bigger hint if still incorrect, before the full step-by-step explanation/answer is
  shown.
- **FR-009**: The full step-by-step explanation/answer for a practice question MUST become
  available on request at any time, in addition to appearing automatically after the staged
  hints.
- **FR-010**: After a question's explanation is shown (via hints or on request), the system
  MUST offer a similar follow-up question to confirm understanding.
- **FR-011**: A correct answer MUST always award a star and an encouraging message from the
  tutor character; an incorrect answer MUST never apply a penalty, lockout, or negative-toned
  message, regardless of how many attempts or hints were used.
- **FR-012**: The Addition & Subtraction topic MUST be the first Math topic built and MUST be
  brought to a complete, polished standard — including FR-013's interactive number line —
  before any other Math topic receives its own bespoke interactive visual widget.
- **FR-013**: Addition & Subtraction practice questions MUST provide an interactive number-line
  control that the learner can drag or tap along to reach and submit her answer, in addition to
  (or instead of) typing a number; the control MUST constrain her to the valid range and MUST
  remain usable without a precise drag gesture (e.g., via step taps).
- **FR-014**: The system MUST offer the remaining Math topics — Place Value, Multiplication
  Tables, Division basics, and Simple Word Problems — following FR-006 through FR-011, aligned
  in level, scope, and terminology to the learner's school textbook, *New Mathematics Today -
  3* (S. Chand School publication). These topics use multiple-choice or typed answers and do
  not require their own bespoke interactive visual widget in this iteration.
- **FR-015**: Every Simple Word Problems question MUST be tagged with the specific skill it
  targets (e.g., "identifying the correct operation" versus "carrying out the calculation"), so
  that a pattern of misses can later be attributed to a specific gap rather than a generic
  score.
- **FR-016**: The system MUST offer the English topics: Reading Comprehension, Vocabulary,
  Grammar Basics, and Sentence Formation, each following FR-006 through FR-011. Reading
  Comprehension, Vocabulary, and Sentence Formation content MUST be aligned in level, themes,
  and vocabulary to the learner's school reader, *Gul Mohar – Language for Life Reader 3*
  (Orient BlackSwan). Grammar Basics content MUST be aligned in level, scope, and terminology
  to the learner's school grammar textbook, *Good Grammar with Composition Book 3* by Peter
  Clutterbuck (Ratna Sagar publication).
- **FR-017**: The system MUST offer the Computer Studies topics: Parts of a Computer, Input &
  Output Devices, Keyboard & Mouse Basics, and Internet Safety Basics, each following FR-006
  through FR-011, with content aligned in level, scope, and terminology to the learner's
  school textbook, *CompWiz - Class 3* (5G Learning).
- **FR-018**: Within Reading Comprehension, the system MUST offer a read-aloud control that
  reads the current passage aloud, highlighting each word as it is spoken, using the
  learner's browser's built-in capabilities.
- **FR-019**: Within Reading Comprehension, the system MUST offer a "read it yourself" control
  that listens to the child reading the passage aloud (via the browser's built-in speech
  recognition, where available) and gives gentle, encouraging feedback on words that may need
  another try, without a strict pass/fail score.
- **FR-020**: If the browser does not support read-aloud or "read it yourself", the system
  MUST hide or disable only that specific control while keeping the rest of the Reading
  Comprehension flow (passage text, comprehension questions) fully usable.
- **FR-021**: The system MUST offer a Quick Challenge mode: an optional, low-pressure session
  of 3-5 questions drawn only from topics whose explanation the learner has already seen.
- **FR-022**: The system MUST identify topics needing revision using simple, rule-based
  thresholds (e.g., recent accuracy below a set level, or frequent reliance on the bigger
  hint) and surface them as a gentle nudge, not a judgment.
- **FR-023**: The system MUST persist stars, streak, mastery status, skill-tag history, tutor
  character name, and revision-nudge data in the learner's browser so they remain visible on
  the next visit on the same device.
- **FR-024**: The system MUST provide a parent view protected by a PIN that is separate from
  the child's normal navigation.
- **FR-025**: The parent view MUST show a per-subject practice summary, the topics currently
  flagged as needing attention, and a list of recent activity.
- **FR-026**: The parent view MUST derive specific, plain-language insight statements from
  patterns of missed skill-tagged questions (e.g., "she understands multiplication but
  struggles when a word problem requires identifying the operation"), and MUST require at
  least 3 logged attempts against a given skill tag before stating any pattern about it.
- **FR-027**: The parent view MUST clearly distinguish observed activity (raw counts, e.g.
  "missed 4 of the last 10 questions") from any statement derived from it, whether a
  skill-specific insight (FR-026) or a general revision nudge (FR-022).
- **FR-028**: The parent view MUST provide a way to clear the learner's locally stored
  progress data, with confirmation before the data is erased.
- **FR-029**: The system MUST remain fully usable, across all subjects and the parent view,
  without a user account, login, backend service, or active internet connection after the
  app has first loaded (voice features additionally require browser support, per FR-020).
- **FR-030**: All topic content (explanations, examples, questions, hints, answers, skill
  tags) MUST be organized so that new topics or subjects can be added later as data alone,
  without changing how the app behaves.
- **FR-031**: All UI text, feedback, and interactions across every subject MUST use simple
  language, large tap targets, and an encouraging tone appropriate for a 7-8 year old learner.
- **FR-032**: This feature explicitly excludes, for now: open-ended AI/LLM chat; any backend
  or server; real user authentication; parent-uploaded syllabus/content management tools;
  subjects or topics beyond those listed in FR-014, FR-016, and FR-017; voice input or
  image-based questions beyond the English reading-guide feature (FR-018/FR-019); and
  interactive visual widgets for any Math topic other than Addition & Subtraction (FR-013).
  All of these may be added later as pure content or as a follow-on feature.

### Key Entities

- **Subject**: One of Math, English, or Computer Studies; groups a set of Topics.
- **Topic**: A unit of learning within a subject (e.g., "Addition & Subtraction"); has a
  step-by-step explanation with example, a set of Practice Questions, and a mastery/attention
  status.
- **Practice Question**: A question tied to a topic, with staged hints, a correct answer, a
  step-by-step explanation, a linked follow-up question, and — for Addition & Subtraction —
  an interactive number-line configuration; for Simple Word Problems, a skill tag identifying
  what the question specifically tests.
- **Reading Passage**: A Reading Comprehension topic item with associated comprehension
  questions and, uniquely, read-aloud/"read it yourself" support.
- **Tutor Character**: The named, consistent persona (chosen or entered by the learner) behind
  every greeting, hint, and encouraging message in the app.
- **Progress Record**: The learner's accumulated stars, streak, per-topic mastery and
  attention status, skill-tag attempt history, tutor character name, and recent activity log,
  persisted locally on the device.
- **Parent PIN**: A locally stored code gating access to the parent view; not tied to any
  external account or identity system.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time learner can name her tutor character and reach her first Addition &
  Subtraction practice question within a few taps of opening the app.
- **SC-002**: Kanika can complete a full explanation-plus-practice session for the Addition &
  Subtraction flagship loop, including using the number line, in under 10 minutes.
- **SC-003**: Every hint, encouraging message, and piece of feedback in the app is attributed
  to the same named tutor character throughout a session — no unnamed or inconsistent voice.
- **SC-004**: 100% of incorrect answers across every subject result in a staged hint or
  encouraging retry, never a penalty or blocking response.
- **SC-005**: On returning to the app on the same device, previously earned stars, streaks,
  tutor character name, and topic mastery are visible immediately with no setup or sign-in
  step.
- **SC-006**: A parent can enter the correct PIN and find a specific, skill-level insight
  statement (not just a percentage) for a subject where at least 3 relevant attempts have
  been logged, within two taps of entering the PIN.
- **SC-007**: All subjects, the parent view, and progress tracking remain fully usable with no
  internet connection after the app's first load.
- **SC-008**: A new topic, question, or passage can be added to any subject by a content
  editor alone, with no change to the app's behavior or code logic.
- **SC-009**: On a browser that supports it, a child can use "read it yourself" on a passage
  and receive feedback identifying specific words to retry within the same session, without
  needing to leave the Reading Comprehension screen.

## Assumptions

- This remains a single-user, single-device experience for Kanika; the parent PIN gate is a
  lightweight barrier to keep the child out of the parent view, not a multi-user account
  system.
- The tutor character's suggested-name list is a small, fixed set of friendly, gender-neutral
  names (e.g., Milo, Tara, Coco) plus a free-text option; the exact list is a content detail
  decided during implementation, not a scope decision.
- The interactive number-line widget is scoped to the Addition & Subtraction topic only for
  this feature. Extending visual/interactive widgets (drag-and-drop counters, area models,
  etc.) to other Math topics is intentionally deferred until the flagship loop has proven
  itself, per FR-012 — this is a phased-rollout decision, not a rejection of the idea.
- Content for all three subjects' topics will be authored to Class 3 ICSE level as part of
  building this feature; exact curriculum sequencing is a content-authoring concern.
- Reading Comprehension, Vocabulary, and Sentence Formation content will match the scope,
  themes, and vocabulary of the learner's actual school reader, *Gul Mohar – Language for
  Life Reader 3* (Orient BlackSwan), but passages will be originally written rather than
  reproduced verbatim from that textbook, to avoid copyright concerns.
- Grammar Basics content will match the scope, sequencing, and terminology of the learner's
  actual school grammar textbook, *Good Grammar with Composition Book 3* by Peter Clutterbuck
  (Ratna Sagar publication), but explanations and practice questions will be originally
  authored rather than copied verbatim from that textbook, to avoid copyright concerns.
- Computer Studies content will match the scope and terminology of the learner's actual
  school textbook, *CompWiz - Class 3* (5G Learning), but explanations and practice questions
  will be originally authored rather than copied verbatim from that textbook, to avoid
  copyright concerns.
- Math content will match the scope, sequencing, and terminology of the learner's actual
  school textbook, *New Mathematics Today - 3* (S. Chand School publication), but worked
  examples and practice questions will be originally authored rather than copied verbatim
  from that textbook, to avoid copyright concerns.
- Mastery and revision-nudge thresholds, and the minimum sample size for a skill-specific
  parent insight (set at 3 attempts per FR-026), are specific, testable rules to be finalized
  during planning, informed by common practice for this age group and by the explicit "don't
  over-conclude from a few answers" principle already established in this project.
- Read-aloud, word-highlighting, and "read it yourself" rely entirely on the learner's
  browser's built-in speech capabilities; no external speech service or API key is used, and
  where a browser lacks support, only the affected control is unavailable (per FR-020). Voice
  input and image-based questions beyond this are explicitly deferred as future enhancements,
  not built as part of this feature.
- The Reading Comprehension, Vocabulary, and Multiplication Tables content and interactions
  already defined in `specs/001-practice-hub` carry forward into this feature's Math and
  English topics unchanged; `001-practice-hub` is superseded by this spec going forward.
- No caregiver/parent reporting beyond the PIN-gated view described here (e.g., notifications,
  exports, multi-parent access) is needed for this feature.
- Progress data lives only in the browser's local storage on Kanika's device; loss of that
  storage (e.g., clearing browser data) is an accepted risk and does not require backend
  backup.
