# 4. Technical architecture

## 4.1 Overview

```
┌──────────────────────────── Mobile device ─────────────────────────────┐
│  apps/web  (React 19 PWA, installable on Android & iOS)                │
│  ┌──────────────┐ ┌─────────────────┐ ┌────────────────────────────┐   │
│  │ UI (routes,  │ │ Learner store   │ │ Audio services             │   │
│  │ features)    │◄┤ IndexedDB state │ │ TTS (speechSynthesis/API)  │   │
│  └──────┬───────┘ │ + event outbox  │ │ STT (SpeechRecognition/API)│   │
│         │         └──────┬──────────┘ │ Recorder (MediaRecorder)   │   │
│         │  @praat/core (same code as server: FSRS, detector,       │   │
│         │  evaluator, skill model, planner, offline tutors)        │   │
│         │  @praat/content (curriculum, precached by service worker)│   │
└─────────┼────────────────┼──────────────────────────────────────────────┘
          │ HTTPS/JSON     │ POST /sync/events (batched, idempotent)
┌─────────▼────────────────▼──────────────────────────────────────────────┐
│  apps/api  (Node 22, Fastify 5, TypeScript)                             │
│  auth · profile · sync/progress · conversations · evaluate · speech     │
│  ┌─────────────────────┐   ┌────────────────────────────────────────┐   │
│  │ Projections via     │   │ AI gateway                             │   │
│  │ @praat/core reducers│   │  AnthropicProvider (Claude, structured │   │
│  └─────────┬───────────┘   │  outputs) · OfflineProvider (rules)    │   │
│            │               └────────────────────────────────────────┘   │
│  ┌─────────▼───────────┐   ┌───────────────┐                            │
│  │ PostgreSQL 16       │   │ Speech/TTS    │ (pluggable, optional)      │
│  │ (PGlite in dev/test)│   │ providers     │                            │
│  └─────────────────────┘   └───────────────┘                            │
└──────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Repository layout

```
.
├── apps/
│   ├── api/                 Fastify API server
│   │   ├── src/
│   │   │   ├── config.ts            env parsing (zod), fail-fast
│   │   │   ├── server.ts            buildServer(): plugins, routes, error handler
│   │   │   ├── db/                  drizzle schema, client (pg | pglite), migrations
│   │   │   ├── auth/                password hashing, JWT, refresh-token rotation
│   │   │   ├── modules/             route modules (auth, me, sync, progress,
│   │   │   │                        conversations, evaluate, speech, health)
│   │   │   ├── ai/                  provider interface, Claude provider,
│   │   │   │                        offline provider, prompts
│   │   │   └── services/            progress projection, conversation service
│   │   └── test/                    integration tests (fastify.inject + PGlite)
│   └── web/                 React PWA
│       └── src/
│           ├── app/                 shell, router, bottom nav
│           ├── features/            home, learn, practice, talk, culture,
│           │                        progress, profile, onboarding
│           ├── components/          design-system primitives
│           └── lib/                 audio, api client, learner store, sync
├── packages/
│   ├── core/                Pure domain logic, no I/O, shared by web + api
│   │   └── src/
│   │       ├── schemas/             zod schemas + types (content, events, API)
│   │       ├── srs/                 FSRS-4.5 scheduler
│   │       ├── language/            text normalisation, mistake detector,
│   │       │                        de/het lexicon, answer evaluator
│   │       ├── pronunciation/       transcript alignment + sound attribution
│   │       ├── learner/             skill model, event reducer, planner,
│   │       │                        mistake-diary analytics, can-do
│   │       └── conversation/        offline scenario engine + friend engine
│   └── content/             Curriculum data (validated by core schemas)
│       └── src/
│           ├── lessons/             A0 … C1 lessons
│           ├── pronunciation.ts     sound modules + minimal pairs
│           ├── listening.ts         listening trainer items
│           ├── expressions.ts       Speak Like a Dutch Person
│           ├── culture.ts           culture articles
│           ├── scenarios.ts         Life Simulator scenarios
│           └── personas.ts          Dutch Friend personas, tutor persona
└── docs/                    This design documentation
```

## 4.3 Key decisions

| Decision | Choice | Why |
|---|---|---|
| Client platform | **PWA** (React + Vite + Workbox) | One codebase for Android and iOS, installable, offline-capable, instant updates. Mic and speech APIs are available in modern mobile browsers. It can be wrapped with Capacitor for store distribution without rewriting (see roadmap). |
| Shared domain logic | `@praat/core`, pure TypeScript | The same FSRS, mistake detector, evaluator and planner run offline on the phone and authoritatively on the server. No logic drift. |
| Progress model | **Event-sourced**, local-first | Every learning action is an immutable event with a client-generated UUID. The client applies it locally (offline-ready) and queues it. The server ingests idempotently and maintains relational projections. Guest mode works for free, and signing up simply uploads the log. |
| API style | REST + JSON, `/api/v1`, zod-validated | Simple, cacheable, easy to consume from mobile. Schemas are shared with the client. |
| Server framework | Fastify 5 | Fast, schema-friendly, first-class TypeScript, mature plugin ecosystem (helmet, CORS, rate limiting, cookies). |
| Database | PostgreSQL 16 via Drizzle ORM | Relational integrity for users and progress, JSONB for event payloads and feedback, horizontal read scaling. Drizzle is typed and lightweight, with SQL-first migrations. |
| Dev/test database | **PGlite** (Postgres compiled to WASM) | Real Postgres semantics with zero setup. Tests run in-process in milliseconds. |
| Auth | Email + password (scrypt), short-lived JWT access token (15 min) plus rotating refresh token in an httpOnly cookie, with reuse detection | Standard, stateless API auth and revocable sessions. OAuth/Sign in with Apple is on the roadmap. |
| AI | Claude via `@anthropic-ai/sdk`, **structured outputs** (`messages.parse` + zod) | Reply and corrections come back as validated JSON, so there is no fragile text parsing. A provider interface allows an **offline provider** (rule-based) for development, tests, guests and outages. |
| Speech | Browser Web Speech API by default; pluggable server STT/TTS | Works today on Chrome/Android and Safari/iOS at no cost. The server providers (neural TTS with caching, Whisper-class STT) are behind an interface. |

## 4.4 Event-sourced progress

```
Client action  ──► LearningEvent {id: uuid, type, payload, occurredAt}
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
  applyEvent(state, e)     outbox (IndexedDB)
  (@praat/core)                 │  when online & signed in
          │                     ▼
  local LearnerState     POST /api/v1/sync/events  (≤ 200 per batch)
  (IndexedDB)                   │
                                ▼
                     INSERT … ON CONFLICT (id) DO NOTHING   ← idempotent
                     load LearnerState (projections)
                     applyEvent() for new events            ← same reducer
                     upsert changed projection rows         (one transaction,
                                ▼                            per-user advisory lock)
                     response: authoritative LearnerState
                                ▼
                     client replaces local state (outbox already flushed)
```

Event types (`packages/core/src/schemas/events.ts`):

| Type | Payload (abridged) | Projection effects |
|---|---|---|
| `lesson.step_completed` | lessonId, step, score? | lesson progress |
| `lesson.completed` | lessonId, scores by skill | lesson progress, skill evidence, cards seeded |
| `card.reviewed` | itemId, rating 1–4 | FSRS card state |
| `card.added` | itemId, source | new card (personal vocabulary) |
| `exercise.attempted` | skill, level, score, patternId? | skill evidence, drill stats |
| `mistake.recorded` | patternId, category, original, correction, explanation, source | mistake diary |
| `speech.attempted` | targetText, transcript, score, sounds[] | pronunciation + per-sound stats |
| `utterance.produced` | mode, words, sentences, latencyMs?, level | speaking and fluency evidence, sentence counter |
| `scenario.completed` | scenarioId, achieved, score | can-do demonstrated, speaking evidence |
| `listening.completed` | itemId, speed, score | listening evidence |
| `profile.updated` | partial profile | profile (local); server stores it in `user_profiles` |

Ordering: events are applied in the server's received order. The
reducer is deterministic and robust to reordering where it matters (FSRS
uses each event's `occurredAt` for elapsed time).

## 4.5 AI conversation pipeline

```
learner text (typed or STT)
   │
   ├─► rule-based detector (@praat/core)  → high-precision corrections (patternIds)
   │
   ├─► AiProvider.respond({mode, persona, level, scenario beat, history, text,
   │                        detectorHints})
   │      AnthropicProvider:
   │        system = persona + pedagogy rules + pattern catalogue (stable, cached)
   │        messages = trimmed history + learner turn
   │        output_config.format = zod schema (TurnResponse)
   │      OfflineProvider:
   │        scenario engine (beats + intents) / friend engine (topics)
   │
   ├─► merge + dedupe corrections (detector wins on the same span)
   │
   ├─► persist message + feedback; emit mistake.recorded + utterance.produced events
   │
   └─► response {reply {nl, en}, feedback {corrections[], natural?, praise?},
                 glossary[], task {beatId, achieved, done}}
```

`TurnResponse` is a single zod schema in `@praat/core` and is used for the
Claude structured-output format, the offline provider and the client.

Prompt design (see `apps/api/src/ai/prompts.ts`):

- **Meaning first:** the character responds to what the learner *meant*, so the conversation continues.
- **Correction policy:** at most 3 corrections per turn in *gentle* mode. Tag each with a known `patternId` when possible. Explain in English at the learner's level. Offer a "natural alternative" when the sentence is correct but textbook-like.
- **Level control:** CEFR descriptors for the character's language (A1: short
  present-tense sentences, high-frequency words; B2: natural speed, idioms with glosses).
- **Register:** personas and scenarios declare formal (*u*) or informal (*je*). The model flags register mismatches as a cultural note, not an error.
- **Safety:** user text only goes into user turns. The model has no tools with side effects, and output is schema-validated before it reaches the client.

## 4.6 Audio system

| Capability | Default (free, on-device) | Pluggable server provider |
|---|---|---|
| Text-to-speech | `speechSynthesis` with the best `nl-NL` / `nl-BE` voice; rate 1.0 normal, 0.75 slow; per-speaker voice/pitch in dialogues | `GET /api/v1/speech/tts?text&voice&rate` → cached audio (content-hash key), e.g. neural voices; the client caches responses (Cache API) for offline replay |
| Speech-to-text | `SpeechRecognition` (`nl-NL`, interim results, 3 alternatives) | `POST /api/v1/speech/transcribe` (audio/webm, opus) → transcript + confidence |
| Recording | `MediaRecorder` (webm/opus or mp4/aac on iOS) for shadowing and self-comparison | the same blob can be sent to STT |
| Pronunciation scoring | `@praat/core` alignment of target vs transcript → per-word match, sound attribution (g, ch, ui, eu, ij, r, oe, uu, long/short vowels) | a phoneme-level scorer (e.g. a pronunciation-assessment API) can replace the heuristic behind the same interface |

**Native audio.** The content schema has an optional `audioUrl` per line and
per phrase. Production content should be recorded by native speakers (NL and
BE). Until those recordings exist, high-quality neural TTS is the stand-in, and
the UI never pretends otherwise.

## 4.7 Performance budget (mobile)

- Initial JS under 180 KB gzip. Routes and content by level are code-split (`import()`).
- Time to interactive under 2.5 s on a mid-range Android over 4G. Repeat visits are instant thanks to the precache.
- API p95 under 150 ms for non-AI endpoints. AI turns stream a typing indicator; the target is p50 under 3 s.
- Images are optional, lazy-loaded, and sized with `srcset`.

## 4.8 Scaling

- The API is stateless (JWT access tokens), so it scales horizontally behind a load balancer.
- Postgres: primary plus read replicas. `learning_events` is partitioned by
  month (`received_at`) once volume warrants it. Projections are small per user.
- The AI gateway is rate-limited per user (daily quota) with prompt caching
  on the stable system prompt, so the per-turn cost is dominated by the short dialogue history.
- TTS audio goes into object storage (S3-compatible) behind a CDN, keyed by
  `sha256(voice|rate|text)`. It is generated once and served forever.
- Content is versioned with the app bundle. A headless CMS can publish JSON
  that validates against the same zod schemas (roadmap).

## 4.9 Observability

- Structured JSON logs (pino via Fastify) with request IDs. PII is redacted
  (`authorization`, `cookie`, `password`).
- Health endpoint `/api/v1/health` (DB ping, AI provider mode).
- Metrics (roadmap): AI latency/tokens per turn, sync lag, error rates.
- Learning analytics are computed from `learning_events` (the source of truth), so any metric can be backfilled.
