import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, hasAccessToken, refreshSession, setAccessToken } from './api';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const auth = {
  user: { id: 'u1', email: 'a@b.nl', displayName: 'A', createdAt: '2026-01-01T00:00:00Z' },
  accessToken: 'fresh',
  expiresIn: 900,
};

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
});

describe('api client', () => {
  it('shares one refresh between concurrent 401s (token rotation must not be replayed)', async () => {
    let refreshes = 0;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshes += 1;
        await new Promise((r) => setTimeout(r, 10));
        return jsonResponse(200, auth);
      }
      const authorized = (init?.headers as Record<string, string>)?.authorization === 'Bearer fresh';
      return authorized ? jsonResponse(200, { ok: true }) : jsonResponse(401, { error: { code: 'unauthorized', message: 'no' } });
    });
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('expired');

    const results = await Promise.all([api.state(), api.plan(), api.me()]);
    expect(results).toHaveLength(3);
    expect(refreshes).toBe(1);
    expect(hasAccessToken()).toBe(true);
  });

  it('turns API errors into ApiError with the server message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(409, { error: { code: 'conflict', message: 'Finished.' } })),
    );
    setAccessToken('t');
    await expect(api.turn('c1', { text: 'Hoi', inputMode: 'text' })).rejects.toMatchObject({
      status: 409,
      code: 'conflict',
      message: 'Finished.',
    });
  });

  it('reports network failures as a network_error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
    );
    const error = await api.health().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('network_error');
  });

  it('returns null when the refresh cookie is gone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(401, { error: { code: 'unauthorized', message: 'no' } })),
    );
    expect(await refreshSession()).toBeNull();
  });
});
