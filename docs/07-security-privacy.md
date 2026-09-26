# 7. Security and privacy

## Threat model (summary)

| Asset | Threat | Mitigation |
|---|---|---|
| Accounts | credential stuffing, brute force | per-IP rate limit on `/auth/*`, uniform error messages, scrypt (N=2¹⁵, r=8, p=3, 64-byte key) with per-user salt, and a dummy hash verified for unknown emails so timing doesn't reveal which accounts exist, timing-safe comparison, minimum password length 10 |
| Sessions | token theft (XSS), replay, CSRF | access token held **in memory only** (never in localStorage), 15-min TTL; refresh token in an `httpOnly; Secure; SameSite=Strict` cookie scoped to `/api/v1/auth`; rotation on every refresh with **reuse detection** that revokes the whole family; the client refreshes single-flight so parallel requests never replay a rotated token. `SameSite=Strict` and the CORS allowlist block cross-site use of the cookie |
| API | injection, mass assignment | zod validation of every body/query/param with unknown keys stripped; parameterised SQL through Drizzle; explicit column lists on update |
| AI | prompt injection, abuse, cost blow-up | learner text only goes in user turns, inside `<learner_message>` tags, and the system prompt says it never changes the rules; no tools; structured output validated with zod before use (invalid, truncated or refused output → offline engine); unknown mistake-pattern ids mapped to `other`; per-user daily quota plus a 20-turns-per-minute burst limit; `max_tokens` capped; SDK timeout 45 s with one retry |
| Browser | XSS, clickjacking | React escaping, no `dangerouslySetInnerHTML` for user or AI content; CSP via `@fastify/helmet` (`default-src 'self'`; `script-src 'self'`; `media-src 'self' blob:`; `upgrade-insecure-requests` on HTTPS deployments), `frame-ancestors 'none'`; `Permissions-Policy` allows only the microphone (same origin) |
| Transport | MITM | HTTPS only in production (HSTS). CORS limited to `CORS_ORIGINS` with credentials |
| Data | over-collection, leaks | data minimisation: no audio stored by default, only transcripts; request bodies are never logged, and headers `authorization`, `cookie` and `set-cookie` are redacted; per-user data export and hard delete |
| Secrets | exposure | env-only (`JWT_SECRET` ≥ 32 bytes enforced at boot; `ANTHROPIC_API_KEY`), never sent to the client, `.env` git-ignored |
| Availability | request floods, large payloads | global rate limit (300/min per IP), 64 KB default body limit (1 MB for event sync, 2 MB for audio), batch size cap 200 events, 120 s request timeout |

## Privacy (GDPR-oriented)

- **Lawful basis:** contract (providing the service). Analytics, if added, would be opt-in.
- **Minimisation:** speech recognition uses the browser's built-in Web Speech API. Depending
  on the browser this runs on the device (e.g. recent Safari) or on the browser vendor's
  servers (Chrome sends the audio to Google). Praat itself never receives or stores
  microphone audio; only the recognised text is used. Shadowing recordings ("record
  yourself") stay in memory on the device and are discarded when you leave the screen. When
  server STT is enabled later, audio is streamed to the provider and **not persisted**.
- **Transparency:** onboarding explains why the microphone is used before the permission prompt.
- **Access and portability:** `GET /api/v1/me/export` returns every event, conversation and profile field as JSON.
- **Erasure:** `DELETE /api/v1/me` hard-deletes the user; foreign keys cascade to all learner data.
- **Guest mode:** without an account, learning data never leaves the device (the browser's own speech recognition aside, see above). AI features need an account.
- **Processors:** the AI provider (Anthropic) receives conversation turns. This is disclosed in
  the privacy notice, and no identifiers beyond the conversation text are sent.
- **Children:** the service targets adults (16+); no child-directed features.

## Operational checklist

- [ ] Set `NODE_ENV=production`, `JWT_SECRET` (random, ≥ 32 bytes), `DATABASE_URL`, `CORS_ORIGINS`, `COOKIE_SECURE=true`
- [ ] Terminate TLS at the load balancer and forward `X-Forwarded-*` (`TRUST_PROXY=true`)
- [ ] Run migrations (`npm run db:migrate -w @praat/api`) before starting new versions
- [ ] Rotate `JWT_SECRET` → all access tokens expire within 15 min; refresh tokens stay valid (they are opaque and hashed)
- [ ] Back up Postgres (PITR); `learning_events` alone can rebuild every projection
- [x] Dependency scanning in CI: `npm audit --omit=dev --audit-level=high` fails the build on
  runtime vulnerabilities

## Dependency audit status

`npm audit --omit=dev` reports **0 vulnerabilities** in runtime dependencies. The full audit
lists 4 moderate advisories, all in dev tooling: `drizzle-kit` (migration generator) depends on
`@esbuild-kit/*`, which bundles an old `esbuild` with GHSA-67mh-4wv8-2f99. That advisory
concerns esbuild's development **server**, which drizzle-kit never starts. It is not in
the production image (`npm ci --omit=dev`) and runs only on developer machines to generate SQL
migrations. The API bundle itself is built with a current `esbuild`.
