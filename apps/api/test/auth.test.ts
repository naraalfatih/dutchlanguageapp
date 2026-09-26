import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp, freshIp, signUp, type TestApp } from './helpers.js';

let t: TestApp;
beforeAll(async () => {
  t = await createTestApp();
});
afterAll(async () => {
  await t.close();
});

describe('health', () => {
  it('reports database and AI status', async () => {
    const res = await t.app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok', db: 'ok', ai: 'offline' });
  });

  it('sets security headers', async () => {
    const res = await t.app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['permissions-policy']).toContain('microphone=(self)');
  });

  it('answers unknown routes with the error shape', async () => {
    const res = await t.app.inject({ method: 'GET', url: '/api/v1/nope' });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('not_found');
  });
});

describe('registration and login', () => {
  it('registers, sets an httpOnly refresh cookie and returns an access token', async () => {
    const res = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      remoteAddress: freshIp(),
      payload: { email: '  Nieuw@Example.com ', password: 'lang genoeg wachtwoord', displayName: 'Jo' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.email).toBe('nieuw@example.com');
    expect(body.accessToken).toMatch(/^ey/);
    expect(body.user).not.toHaveProperty('passwordHash');
    const cookie = res.cookies.find((c) => c.name === 'praat_rt')!;
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.path).toBe('/api/v1/auth');
    expect(cookie.sameSite).toBe('Strict');
  });

  it('rejects duplicate emails and weak passwords', async () => {
    await signUp(t.app, 'dup@example.com');
    const dup = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      remoteAddress: freshIp(),
      payload: { email: 'DUP@example.com', password: 'another long password', displayName: 'X' },
    });
    expect(dup.statusCode).toBe(409);

    const weak = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      remoteAddress: freshIp(),
      payload: { email: 'weak@example.com', password: 'short', displayName: 'X' },
    });
    expect(weak.statusCode).toBe(400);
    expect(weak.json().error.code).toBe('validation_error');
  });

  it('logs in with the right password and gives one generic error otherwise', async () => {
    await signUp(t.app, 'login@example.com');
    const ip = freshIp();
    const ok = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      remoteAddress: ip,
      payload: { email: 'login@example.com', password: 'correct horse battery' },
    });
    expect(ok.statusCode).toBe(200);

    const wrong = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      remoteAddress: ip,
      payload: { email: 'login@example.com', password: 'wrong password!!' },
    });
    const unknown = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      remoteAddress: ip,
      payload: { email: 'nobody@example.com', password: 'wrong password!!' },
    });
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(wrong.json()).toEqual(unknown.json());
  });

  it('rate-limits credential endpoints per IP', async () => {
    const ip = freshIp();
    const attempts = [];
    for (let i = 0; i < 11; i++) {
      attempts.push(
        await t.app.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          remoteAddress: ip,
          payload: { email: 'nobody@example.com', password: 'x' },
        }),
      );
    }
    expect(attempts.at(-1)!.statusCode).toBe(429);
    expect(attempts.at(-1)!.json().error.code).toBe('rate_limited');
  });
});

describe('refresh tokens', () => {
  it('rotates the refresh token and revokes the family on reuse', async () => {
    const s = await signUp(t.app);
    const first = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      remoteAddress: freshIp(),
      cookies: { praat_rt: s.refreshCookie },
    });
    expect(first.statusCode).toBe(200);
    const rotated = first.cookies.find((c) => c.name === 'praat_rt')!.value;
    expect(rotated).not.toBe(s.refreshCookie);

    // Replaying the old token (e.g. stolen) kills the whole family, including the new token.
    const replay = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      remoteAddress: freshIp(),
      cookies: { praat_rt: s.refreshCookie },
    });
    expect(replay.statusCode).toBe(401);
    const afterReplay = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      remoteAddress: freshIp(),
      cookies: { praat_rt: rotated },
    });
    expect(afterReplay.statusCode).toBe(401);
  });

  it('logout revokes the session', async () => {
    const s = await signUp(t.app);
    const out = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      remoteAddress: s.ip,
      cookies: { praat_rt: s.refreshCookie },
    });
    expect(out.statusCode).toBe(204);
    const refresh = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      remoteAddress: freshIp(),
      cookies: { praat_rt: s.refreshCookie },
    });
    expect(refresh.statusCode).toBe(401);
  });
});

describe('me and profile', () => {
  it('requires a valid access token', async () => {
    expect((await t.app.inject({ method: 'GET', url: '/api/v1/me' })).statusCode).toBe(401);
    const forged = await t.app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { authorization: 'Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.' },
    });
    expect(forged.statusCode).toBe(401);
  });

  it('returns and updates the profile', async () => {
    const s = await signUp(t.app);
    const me = await s.inject({ method: 'GET', url: '/api/v1/me' });
    expect(me.json().profile).toMatchObject({ level: 'A0', correctionStyle: 'gentle', onboarded: false });

    const patch = await s.inject({
      method: 'PATCH',
      url: '/api/v1/me/profile',
      payload: { level: 'B1', goals: ['work', 'partner'], region: 'be', dailyMinutes: 20, onboarded: true },
    });
    expect(patch.statusCode).toBe(200);
    expect(patch.json().profile).toMatchObject({ level: 'B1', region: 'be', dailyMinutes: 20, onboarded: true });

    const bad = await s.inject({ method: 'PATCH', url: '/api/v1/me/profile', payload: { dailyMinutes: 7 } });
    expect(bad.statusCode).toBe(400);

    // Skills without evidence follow the self-reported level.
    const state = await s.inject({ method: 'GET', url: '/api/v1/progress/state' });
    expect(state.json().skills.speaking.rating).toBeGreaterThan(2);
  });

  it('exports and deletes all data', async () => {
    const s = await signUp(t.app, 'gdpr@example.com');
    await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'tutor', level: 'A1' } });
    const exported = await s.inject({ method: 'GET', url: '/api/v1/me/export' });
    expect(exported.statusCode).toBe(200);
    expect(exported.headers['content-disposition']).toContain('attachment');
    expect(exported.json().conversations).toHaveLength(1);
    expect(exported.json().user.email).toBe('gdpr@example.com');

    const del = await s.inject({ method: 'DELETE', url: '/api/v1/me' });
    expect(del.statusCode).toBe(204);
    const login = await t.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      remoteAddress: freshIp(),
      payload: { email: 'gdpr@example.com', password: 'correct horse battery' },
    });
    expect(login.statusCode).toBe(401);
  });
});
