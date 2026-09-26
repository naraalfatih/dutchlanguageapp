# 5. Data model

Two kinds of data:

1. **Content** (curriculum, scenarios, culture…) is versioned with the app,
   typed by zod schemas in `@praat/core`, and authored in `@praat/content`. It is the same for every user.
2. **Learner data** is per user: an append-only **event log** plus
   **projections** derived from it by the shared reducer.

## 5.1 Entity-relationship overview

```
users 1──1 user_profiles
  │
  ├──* refresh_tokens                (session families, rotation)
  ├──* learning_events               (append-only source of truth)
  │
  ├──* lesson_progress         ┐
  ├──* srs_cards               │
  ├──* mistakes                │  projections of learning_events
  ├──* mistake_pattern_stats   │  (rebuilt deterministically by
  ├──* skill_estimates         │   @praat/core applyEvent)
  ├──* can_do_progress         │
  ├──1 learner_stats           ┘
  │
  ├──* conversations 1──* conversation_messages
  └──* ai_usage                      (per-day quota accounting)

tts_cache                            (global, content-addressed audio)
```

## 5.2 Tables

Types are PostgreSQL. The Drizzle source of truth is `apps/api/src/db/schema.ts`,
and generated SQL migrations live in `apps/api/drizzle/`.

### users
| column | type | notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| email | text UNIQUE NOT NULL | stored lower-cased and trimmed |
| password_hash | text NOT NULL | `scrypt$N$r$p$salt$hash` |
| display_name | text NOT NULL | |
| created_at / updated_at | timestamptz | |

### user_profiles
| column | type | notes |
|---|---|---|
| user_id | uuid PK FK→users ON DELETE CASCADE | |
| goals | jsonb (`string[]`) | moving, work, study, travel, partner, culture |
| region | text | `nl` or `be` |
| self_reported_level | text | A0 … C1 |
| daily_minutes | int | 5, 10, 20 or 30 |
| native_language | text | ISO 639-1, default `en` |
| correction_style | text | `gentle` or `thorough` |
| speech_rate | real | 0.6 – 1.2 |
| onboarded_at / updated_at | timestamptz | |

### refresh_tokens
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK CASCADE | |
| family_id | uuid | all rotations of one login share a family |
| token_hash | text UNIQUE | SHA-256 of the opaque token (the raw token is never stored) |
| expires_at | timestamptz | 30 days |
| revoked_at | timestamptz NULL | set on rotation or logout |
| replaced_by | uuid NULL | successor in the family |
| user_agent | text | |
| created_at | timestamptz | |

Reuse of a revoked token → the **whole family is revoked** (theft detection).

### learning_events
| column | type | notes |
|---|---|---|
| id | uuid PK | **client-generated**, which makes sync idempotent |
| seq | bigserial UNIQUE | server ordering and sync cursor |
| user_id | uuid FK CASCADE | index (user_id, seq) |
| type | text | see event catalogue |
| payload | jsonb | validated by the zod discriminated union |
| occurred_at | timestamptz | device time (clamped to not be in the future) |
| received_at | timestamptz | server time |
| device_id | text NULL | |

### lesson_progress
PK (user_id, lesson_id). `status` (started, completed), `steps_completed`
jsonb `string[]`, `best_score` real, `started_at`, `completed_at`.

### srs_cards (FSRS state)
| column | type | notes |
|---|---|---|
| user_id, item_id | PK | item_id = content phrase ID, e.g. `a1.greetings.v.hoe-gaat-het` |
| state | smallint | 0 new, 1 learning, 2 review, 3 relearning |
| stability | real | days until retrievability drops to 90% |
| difficulty | real | 1 – 10 |
| reps / lapses | int | |
| due_at | timestamptz | index (user_id, due_at) |
| last_review_at | timestamptz NULL | |
| source | text | lesson, lookup, mistake, manual |

### mistakes
Individual mistakes, for the diary detail view and "fix your own sentence" drills.
`id`, `user_id`, `pattern_id`, `category` (grammar, vocabulary,
pronunciation, naturalness, register), `original`, `correction`,
`explanation`, `source` (lesson, tutor, friend, scenario, exercise, speech),
`occurred_at`. Index (user_id, pattern_id, occurred_at desc).

### mistake_pattern_stats
PK (user_id, pattern_id). `category`, `occurrences`, `drill_attempts`,
`drill_correct`, `errors_by_day` jsonb `{ "2026-09-01": 2 }`, `drills_by_day`
jsonb `{ day: [attempts, correct] }` (both capped to 120 days), `first_seen_at`, `last_seen_at`.

These feed the diary dashboard: *errors per 100 sentences, last 14 days vs the
previous period* → "Improved 35%", "Needs practice", "Improving", "Mastered".

### skill_estimates
PK (user_id, skill ∈ speaking, listening, vocabulary, grammar,
pronunciation, fluency). `rating` real (CEFR scale 0–6), `evidence_count`
int, `history` jsonb `[{day, rating}]` (last 120 days), `updated_at`.

### can_do_progress
PK (user_id, can_do_id). `demonstrated_at`, `evidence` (e.g. `scenario:gp-appointment`).

### learner_stats
PK user_id. `sentences_produced`, `words_produced`, `speaking_turns`,
`voice_turns`, `reviews_done`, `listening_completed`, `sentences_by_day` jsonb,
`active_days` jsonb `string[]`, `updated_at`.

### conversations / conversation_messages
`conversations`: `id`, `user_id`, `mode` (tutor, friend, scenario),
`persona_id`, `scenario_id` NULL, `level`, `engine_state` jsonb (scenario
beat pointer, turn counts), `title`, `created_at`, `updated_at`, `completed_at`.

`conversation_messages`: `id`, `conversation_id` FK CASCADE, `role` (learner,
character), `text`, `translation`, `feedback` jsonb (the `TurnFeedback` schema),
`glossary` jsonb, `input_mode` (text, voice), `created_at`. Index (conversation_id, created_at).

### ai_usage
PK (user_id, day). `requests`, `input_tokens`, `output_tokens`. This is used to enforce
`AI_DAILY_TURN_LIMIT` and to observe cost.

### tts_cache
PK `key` = sha256(voice | rate | text). `voice`, `rate`, `text`,
`content_type`, `storage_key` (object-storage path), `created_at`.

## 5.3 Content model (`@praat/core/src/schemas/content.ts`)

```
Level        = "A0" | "A1" | "A2" | "B1" | "B2" | "C1"
Register     = "formal" | "neutral" | "informal"

Lesson {
  id, level, unit, order, title, canDo, minutes, tags[]
  situation   { setting, dialogue: Line[] }              Line = {speaker, nl, en, audioUrl?}
  vocabulary  Phrase[]                                   Phrase = {id, nl, en, example{nl,en},
                                                                   article?, register?, band, note?, emoji?}
  pronunciation { focus: SoundId, tip, items: {nl, en?, hint?}[] }
  listening   { intro, lines: Line[], questions: Question[] }
  speaking    { prompt, context, modelAnswers[], mustInclude?: Intent[], register?, hints[] }
  grammar     { title, explanation, examples: {nl,en,highlight?}[], commonMistake? {wrong,right,why} }
  culture     { title, body }
  review      Exercise[]                                 translate | fill | order | choose | respond | dictation
}

Scenario  { id, category, title, level, goal, canDoId, register, setting,
            character{name, role}, beats: Beat[], debrief }
Beat      { id, npc{nl,en}, task, intents: Intent[], modelAnswers[], hint, culturalNote?,
            onSuccess?{nl,en} }
Intent    { id, description, anyOf: string[][] }         each inner array = alternative keyword set

SoundModule   { id, title, ipa, howTo, englishHint, commonMistakes[], minimalPairs[], practice[] }
ListeningItem { id, level, kind, title, speakers[], lines: Line[], questions[], vocab[], slang[] }
Expression    { id, textbook?, natural, en, register, whoUses, when, examples[], category }
CultureArticle{ id, title, summary, sections[], keyPhrases[], tryScenarioId? }
Persona       { id, name, age, city, region, bio, style, interests[], register }
CanDo         { id, level, text, skill, scenarioIds[] }
```

Stable string IDs make content diffable and let learner data (`item_id`,
`lesson_id`, `can_do_id`) survive content updates. A content test fails the
build on duplicate IDs, dangling references, missing lesson components or invalid exercises.
