# 7. Security and privacy

## Threat model (summary)

| Asset | Threat | Mitigation |
|---|---|---|
| Accounts | credential stuffing, brute force | per-IP rate limit on `/auth/*`, uniform error messages, scrypt (N=2¹⁵, r=8, p=1) with per-user salt, timing-safe comparison, minimum password length 10 |
| Sessions | token theft (XSS), replay | access token held **in memory only** (never in localStorage), 15-min TTL; refresh token in an `httpOnly; Secure; SameSite=Strict` cookie scoped to `/api/v1/auth`; rotation on every refresh with **reuse detection** that revokes the whole family |
| API | injection, mass assignment | zod validation of every body/query/param with unknown keys stripped; parameterised SQL through Drizzle; explicit column lists on update |
| AI | prompt injection, abuse, cost blow-up | learner text only goes in user turns; no tools with side effects; the output schema is validated before use; per-user daily quota; `max_tokens` capped; a stable system prompt (cached) |
| Browser | XSS, clickjacking | React escaping, no `dangerouslySetInnerHTML` for user or AI content; CSP via `@fastify/helmet` (`default-src 'self'`; `media-src 'self' blob:`), `frame-ancestors 'none'` |
| Transport | MITM | HTTPS only in production (HSTS). CORS limited to `CORS_ORIGINS` with credentials |
| Data | over-collection, leaks | data minimisation: no audio stored by default, only transcripts; logs redact `authorization`, `cookie` and `password`; per-user data export and hard delete |
| Secrets | exposure | env-only (`JWT_SECRET` ≥ 32 bytes enforced at boot; `ANTHROPIC_API_KEY`), never sent to the client, `.env` git-ignored |
| Availability | request floods, large payloads | global rate limit, 1 MB body limit (2 MB for audio), batch size cap 200 events, request timeouts |

## Privacy (GDPR-oriented)

- **Lawful basis:** contract (providing the service). Analytics, if added, would be opt-in.
- **Minimisation:** microphone audio is processed on-device by the browser's
  recogniser by default. When server STT is enabled, audio is streamed to the
  provider and **not persisted**.
- **Transparency:** onboarding explains why the microphone is used before the permission prompt.
- **Access and portability:** `GET /api/v1/me/export` returns every event, conversation and profile field as JSON.
- **Erasure:** `DELETE /api/v1/me` hard-deletes the user; foreign keys cascade to all learner data.
- **Guest mode:** without an account nothing leaves the device (AI features need an account).
- **Processors:** the AI provider (Anthropic) receives conversation turns. This is disclosed in
  the privacy notice, and no identifiers beyond the conversation text are sent.
- **Children:** the service targets adults (16+); no child-directed features.

## Operational checklist

- [ ] Set `NODE_ENV=production`, `JWT_SECRET` (random, ≥ 32 bytes), `DATABASE_URL`, `CORS_ORIGINS`, `COOKIE_SECURE=true`
- [ ] Terminate TLS at the load balancer and forward `X-Forwarded-*` (`TRUST_PROXY=true`)
- [ ] Run migrations (`npm run db:migrate -w @praat/api`) before starting new versions
- [ ] Rotate `JWT_SECRET` → all access tokens expire within 15 min; refresh tokens stay valid (they are opaque and hashed)
- [ ] Back up Postgres (PITR); `learning_events` alone can rebuild every projection
- [ ] Dependency scanning (`npm audit`) in CI
