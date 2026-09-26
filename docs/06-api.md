# 6. API design

Base path `/api/v1`. JSON in and out, and every body is validated by zod schemas from
`@praat/core`. Errors use a single shape:

```json
{ "error": { "code": "validation_error", "message": "…", "details": { } } }
```

Auth: `Authorization: Bearer <accessToken>` (JWT, HS256, 15 min). The refresh
token lives in an httpOnly `praat_rt` cookie scoped to `/api/v1/auth`.

## Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{email, password, displayName}` | `201 {user, accessToken}` + refresh cookie |
| POST | `/auth/login` | `{email, password}` | `200 {user, accessToken}` + refresh cookie |
| POST | `/auth/refresh` | none (cookie) | `200 {user, accessToken}` + rotated cookie |
| POST | `/auth/logout` | none (cookie) | `204`, family revoked, cookie cleared |

Passwords: 10–200 characters. Login failures return the same generic error for an unknown
email and for a wrong password.

## Me / profile

| Method | Path | Notes |
|---|---|---|
| GET | `/me` | `{user, profile}` |
| PATCH | `/me/profile` | partial `ProfileInput` |
| GET | `/me/export` | full data export (GDPR art. 15/20): profile, events, conversations |
| DELETE | `/me` | deletes the account and all data (cascade); `204` |

## Sync and progress

| Method | Path | Notes |
|---|---|---|
| POST | `/sync/events` | `{deviceId?, events: LearningEvent[1..200]}` → `{accepted, duplicates, state: LearnerState}`. Idempotent by event `id`. |
| GET | `/sync/events?after=<seq>&limit=` | pull the event log (new-device restore) → `{events, nextCursor}` |
| GET | `/progress/state` | authoritative `LearnerState` |
| GET | `/progress/plan` | `DailyPlan` (also computable offline on the client) |

## Conversations (Talk)

| Method | Path | Notes |
|---|---|---|
| POST | `/conversations` | `{mode: tutor\|friend\|scenario, level, personaId?, scenarioId?, topic?}` → `201 {conversation, opening: TurnResponse}` |
| GET | `/conversations?limit=` | `{conversations}`: the user's recent conversations |
| GET | `/conversations/:id` | `{conversation, messages}` |
| POST | `/conversations/:id/turns` | `{text, inputMode: text\|voice, latencyMs?}` → `{conversationId, turn: TurnResponse, events: LearningEvent[]}` |

The server derives learning events from each turn (`utterance.produced`, one
`mistake.recorded` per correction, `scenario.completed` at the end of a scenario) and
stores them before answering. The client applies `events` to its local learner state
and does **not** queue them for sync, since they are already on the server. A turn on a
finished scenario returns `409`; two turns racing on the same conversation return `409`
for the loser.

`turn` (`TurnResponse`):

```json
{
  "reply": { "nl": "Ah, leuk! Waar kom je vandaan?", "en": "Oh nice! Where are you from?" },
  "feedback": {
    "understood": true,
    "corrections": [{
      "original": "Ik ben heet Amira",
      "corrected": "Ik heet Amira",
      "explanation": "People understand you, but 'Ik ben heet' means 'I am hot (temperature)'. To give your name, use the verb heten: 'Ik heet…'.",
      "category": "vocabulary",
      "patternId": "ik-ben-heet",
      "severity": "meaning"
    }],
    "natural": { "nl": "Ik ben Amira, hoi!", "en": "I'm Amira, hi!", "note": "Very common and relaxed." },
    "praise": "Nice use of 'leuk'!"
  },
  "glossary": [{ "term": "leuk", "meaning": "nice, fun", "note": "The all-purpose positive word." }],
  "task": { "beatId": "introduce", "achieved": true, "completed": false, "progress": 0.33 },
  "source": "ai"
}
```

`source` is `ai` or `offline`. The client shows a subtle badge when the
offline engine answered (no key configured, quota reached, or provider outage).

## Evaluate

| Method | Path | Notes |
|---|---|---|
| POST | `/evaluate/sentence` | `{text, level, task?: {prompt, mustInclude?, modelAnswers?, register?}}` → `{achieved, feedback, score, source, quotaExceeded?}`. Used by lesson speaking tasks when online; the same check runs offline on the client (rules only). |

## Speech

| Method | Path | Notes |
|---|---|---|
| GET | `/speech/tts?text=&voice=&rate=` | audio (cached). `501 not_configured` when no provider is set, and the client falls back to on-device TTS. |
| POST | `/speech/transcribe` | `audio/webm` or `audio/mp4` body (≤ 2 MB) → `{transcript, confidence, alternatives}`. `501` when not configured. |

## Health

`GET /health` → `{status: "ok", db: "ok", ai: "anthropic" | "offline", version, contentVersion}` (`503` with `status: "degraded"` when the database is unreachable)

## Rate limits

| Scope | Limit |
|---|---|
| Global per IP | 300 req / min |
| `/auth/register`, `/auth/login`, `/auth/refresh` per IP | 10 req / min |
| `/conversations/:id/turns` per user | 20 req / min |
| `/evaluate/sentence` per IP | 30 req / min |
| AI turns per user | `AI_DAILY_TURN_LIMIT` (default 200/day); over the limit → the offline engine answers with `source: "offline"` and `quotaExceeded: true` |

## AI request shape

Each AI turn is one `client.beta.messages.create` call with structured output
(`output_config.format` from a zod schema) and `output_config.effort` (default `low`):

- **System:** the stable core prompt, then the per-conversation prompt (character,
  scenario, learner profile). Both carry `cache_control`, so repeated turns read the
  prefix from the prompt cache.
- **Messages:** the recent history as alternating user/assistant turns, with a cache
  breakpoint on the last history message. The final user message holds the volatile
  `<turn_context>` (current scenario step, rule-checker findings) and the learner's
  message.
- **Fallbacks:** `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`) is on by
  default. If the model declines, the API retries server-side on a fallback model. Set
  `AI_FALLBACKS=false` to turn this off, for example behind a gateway that rejects beta
  parameters.
- **Refusals and failures:** a refusal, truncated or invalid output, or a network error
  is logged, and the offline engine answers instead (`source: "offline"`).
