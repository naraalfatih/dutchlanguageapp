# Praat: learn to actually speak Dutch

Praat is a mobile-first Dutch learning app for adults who need to **speak and understand real
Dutch**. It isn't built around streaks, points or cartoon mascots. Success is measured by one
question: _can this person communicate naturally in Dutch?_

- **Speaking from day one.** Onboarding ends with your first spoken sentence. Every lesson
  has a speaking task, and Talk is one tap away.
- **Communication first.** Feedback starts with whether you were understood, then shows
  what to fix and why: _"People understand you, but 'Ik ben heet' means 'I am hot
  (temperature)'. If you mean your name, say: 'Ik heet…'"_.
- **Natural Dutch.** _Hoe gaat-ie?_ instead of _Hoe gaat het met jou?_; particles like
  _toch, hoor, gewoon, eigenlijk_; Flemish where it differs.
- **Retention.** FSRS spaced review with production first, a Mistake Diary built from your
  own sentences, and can-do goals demonstrated in real situations.

## What's inside

| Area         | Features                                                                                                                                                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**     | Daily plan with the reason behind it ("You understand Dutch well but hesitate while speaking…"), due reviews, expression of the day                                                                                                                                                                                           |
| **Learn**    | 31 lessons, A0 → C1. Each has 9 parts: situation dialogue, words in context, pronunciation, listening challenge, grammar, speaking task, culture, review, can-do summary                                                                                                                                                      |
| **Practice** | Spaced review (FSRS-4.5) · Pronunciation Coach (G, CH, UI, EU, IJ, R, vowels… with minimal-pair ear training, say-it scoring, record yourself) · Listening Trainer (normal/slow, transcript, vocabulary and slang notes, incl. Flemish) · Mistake drills from your own sentences · Speak like a Dutch person (38 expressions) |
| **Talk**     | AI Tutor · Dutch Friend Mode (Sanne from Utrecht, Daan from Amsterdam, Lien from Gent, with slang explained) · Dutch Life Simulator (17 scenarios: housing viewing, gemeente, GP, pharmacy, birthday, borrel, job interview, meetings…). The difficulty level is adjustable                                                   |
| **Culture**  | 12 articles: directness, gezelligheid, birthdays, cycling, work culture, Flanders… each with key phrases and a "try it" scenario                                                                                                                                                                                              |
| **Progress** | Overall level, six skills (speaking, listening, vocabulary, grammar, pronunciation, fluency), Mistake Diary ("Word order: Improved 35%", "de/het: Needs practice"), 37 can-do statements, retention                                                                                                                           |
| **Profile**  | Goals, level, region (NL/BE), voice and speed, correction style (gentle/thorough), theme, sync, data export and account deletion                                                                                                                                                                                              |

It works offline: the curriculum ships in the app, progress is written locally first,
and practice conversations run on the device. Signing in adds sync and the Claude-powered
conversation partner.

## Architecture

```
packages/core      Pure TypeScript domain logic shared by app and server: zod schemas,
                   FSRS scheduler, Dutch mistake detector, answer evaluator, learner
                   model (event reducer, skills, Mistake Diary, planner), offline
                   conversation engines
packages/content   Curriculum data A0–C1, validated by the core schemas
apps/api           Fastify 5 API: auth, event sync, conversations (Claude + offline
                   fallback), evaluation, GDPR export/delete; Drizzle on PostgreSQL
                   (PGlite in dev/tests)
apps/web           React 19 + Vite PWA: local-first IndexedDB store with an outbox,
                   Web Speech API for TTS/STT, MediaRecorder for shadowing
docs/              Product vision, learning science, UX, architecture, data model,
                   API, security & privacy
```

Progress is **event-sourced**: every learning action is an event with a client UUID. The same
reducer builds the learner state on the phone and on the server, so sync is idempotent and
guest progress uploads when you create an account. See [docs/04-architecture.md](docs/04-architecture.md).

## Getting started

Requirements: Node.js 22+.

```bash
npm install
npm run dev          # API on :8787 (embedded PGlite) + web app on :5173
```

Open http://localhost:5173. No database or API key is needed for development: the API uses an
in-memory PGlite database and the offline conversation partner.

To enable the AI partner, set a Claude API key before starting the API:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

AI turns use `claude-opus-5` (`AI_MODEL`) with low effort, structured output and prompt
caching. **Server-side refusal fallbacks are on by default** (`fallbacks: "default"`, beta
`server-side-fallback-2026-07-01`): if the model declines a request, the API retries it
server-side on a fallback model. Set `AI_FALLBACKS=false` to turn this off, for example
behind a gateway that rejects beta parameters. A refusal, invalid output or an outage always
falls back to the offline partner. See [.env.example](.env.example) for all settings.

## Tests and checks

```bash
npm run lint && npm run format:check && npm run typecheck
npm test                                   # core, content, API (PGlite + fake Claude client), web unit tests
npm run build                              # web (PWA) + API bundle
npm run e2e -w @praat/web                  # Playwright smoke tests (needs `npm run build -w @praat/web`)
```

The content tests play every Life Simulator scenario to completion and run the mistake
detector over all curriculum text, so authored Dutch can't trigger false corrections.

## Deployment

One container serves the API and the built PWA:

```bash
JWT_SECRET=$(openssl rand -base64 48) docker compose up --build   # PostgreSQL + app on :8787
```

In production, set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (≥ 32 characters),
`CORS_ORIGINS`, and `TRUST_PROXY=true` behind a TLS-terminating proxy. Run migrations with
`node dist/db/migrate.js` or set `MIGRATE_ON_START=true`. See
[docs/07-security-privacy.md](docs/07-security-privacy.md) for the operational checklist.

## Known limitations

- Audio uses the device's text-to-speech voices until native-speaker recordings are added
  (the content schema already supports `audioUrl`). Server TTS/STT endpoints are defined but
  return `501` until a provider is configured.
- Speech recognition depends on the browser (Chrome and Safari support Dutch; Firefox users
  type instead). Pronunciation feedback comes from the recogniser's transcript, not
  phoneme-level scoring.
- The initial bundle is about 260 KB gzip because the whole curriculum loads up front.
  Splitting content per level is the next performance step.
