# Contract: Topic Content JSON Schema

This is the contract content authors (including a future you, editing JSON by hand) and the
`js/views/topic.js` / `js/views/reading-passage.js` renderers both code against. One file per
Topic, at `js/content/<subjectId>/<topicId>.json`.

## Shape

```jsonc
{
  "id": "addition-subtraction",             // must match the filename (without .json)
  "subjectId": "math",                      // one of: math | english | computer-studies
  "displayName": "Addition & Subtraction",
  "sourceReference": "New Mathematics Today - 3",  // authoring metadata only, never rendered
  "explanation": {
    "text": "Adding means putting numbers together to make a bigger number.",
    "example": "7 + 5 means starting at 7 and counting forward 5 more."
  },
  "questions": [
    {
      "id": "as-q1",
      "prompt": "What is 7 + 5?",
      "correctAnswer": "12",                // free-text/number answer; "options" omitted here
      "widget": { "type": "number-line", "min": 0, "max": 20, "start": 7 },  // Addition &
                                             // Subtraction topic ONLY — omit for every other topic
      "hints": {
        "small": "Try counting forward from 7.",
        "big": "Count forward 5 steps from 7: 8, 9, 10, 11, ?"
      },
      "explanationSteps": [
        "Start at 7 on the number line.",
        "Count forward 5 steps: 8, 9, 10, 11, 12.",
        "You land on 12, so 7 + 5 = 12."
      ],
      "followUpQuestionId": "as-q2"
    }
  ],
  // Reading Comprehension topics only — omit for every other topic:
  "passages": [
    {
      "id": "rc-p1",
      "text": "Ravi went to the market with his mother...",
      "comprehensionQuestionIds": ["rc-q1", "rc-q2", "rc-q3"]
    }
  ]
}
```

**Simple Word Problems questions** additionally carry a `skillTag` (this topic only), e.g.:

```jsonc
{
  "id": "wp-q3",
  "prompt": "There are 4 baskets with 6 apples each. How many apples in all?",
  "skillTag": "operation-identification",   // vs. e.g. "computation" for a pure calculation slip
  "options": ["10", "24", "46", "4"],
  "correctAnswer": "24",
  "hints": { "small": "...", "big": "..." },
  "explanationSteps": ["...", "..."],
  "followUpQuestionId": "wp-q4"
}
```

## Field rules

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Kebab-case, unique within its subject, stable once shipped (used as a localStorage key) |
| `subjectId` | yes | One of the three fixed subject ids |
| `displayName` | yes | Shown to the child; simple language (Constitution Principle II) |
| `sourceReference` | no | Which textbook this topic's level/scope was aligned to; internal only |
| `explanation.text` / `.example` | yes | Must exist before any question is reachable (spec FR-006) |
| `questions[].hints.small` / `.big` | yes | Both required before `explanationSteps` is shown (FR-008) |
| `questions[].explanationSteps` | yes | Non-empty ordered list; rendered as numbered steps, never one paragraph (FR-007) |
| `questions[].followUpQuestionId` | yes | Must reference another `id` in the same file's `questions` (FR-010) |
| `questions[].widget` | Addition & Subtraction topic only | `{ type: "number-line", min, max, start }`; omit for every other topic (FR-012/FR-013) |
| `questions[].skillTag` | Simple Word Problems topic only | Identifies the specific skill this question tests, feeding the parent insight engine (FR-015); omit elsewhere |
| `passages` | only for Reading Comprehension | Each passage's `comprehensionQuestionIds` must reference entries in `questions` |

## Consumers

- `js/views/topic.js` reads a Topic file to render explanation → practice flow, and renders
  `js/widgets/number-line.js` when a question defines `widget` (Addition & Subtraction only).
- `js/views/reading-passage.js` additionally reads `passages` and drives `js/voice/*`.
- `js/engine/quick-challenge.js` reads across all Topic files for a Subject to sample
  questions for Quick Challenge (FR-021), restricted to topics the learner has already opened
  (tracked via Progress Record, not this content file).
- `js/engine/skill-insights.js` reads each attempted question's `skillTag` (via the logged
  `recentActivity` entry, not this file directly) to build the parent view's skill-specific
  insight statements (FR-026).

## Compatibility

Adding a new Topic file, or appending new `questions`/`passages` to an existing one, requires
no code change (spec FR-022). Renaming an existing `id` (Topic, question, or passage) is a
breaking change to Progress Record data keyed by that id — avoid renaming shipped ids; add a
new one instead if a topic needs to be replaced.
