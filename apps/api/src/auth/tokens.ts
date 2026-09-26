import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { jwtVerify, SignJWT } from 'jose';
import type { Config } from '../config.js';
import type { Db } from '../db/client.js';
import { refreshTokens } from '../db/schema.js';

const ISSUER = 'praat';
const AUDIENCE = 'praat-app';

export interface AccessTokenClaims {
  userId: string;
}

function secretKey(config: Config): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret);
}

export async function signAccessToken(config: Config, userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTokenTtlSeconds}s`)
    .sign(secretKey(config));
}

export async function verifyAccessToken(config: Config, token: string): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(config), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'],
    });
    return typeof payload.sub === 'string' ? { userId: payload.sub } : null;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface IssuedRefreshToken {
  id: string;
  token: string;
  expiresAt: Date;
}

export async function issueRefreshToken(
  db: Db,
  config: Config,
  userId: string,
  options: { familyId?: string; userAgent?: string | undefined } = {},
): Promise<IssuedRefreshToken> {
  const token = randomBytes(32).toString('base64url');
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 86_400_000);
  await db.insert(refreshTokens).values({
    id,
    userId,
    familyId: options.familyId ?? randomUUID(),
    tokenHash: hashToken(token),
    expiresAt,
    userAgent: options.userAgent?.slice(0, 300) ?? null,
  });
  return { id, token, expiresAt };
}

export type RotationResult =
  | { ok: true; userId: string; next: IssuedRefreshToken }
  | { ok: false; reason: 'unknown' | 'expired' | 'reused' };

/**
 * Rotate a refresh token. Presenting an already-rotated token means it was stolen (or
 * replayed): the whole token family is revoked, logging out every session derived from it.
 */
export async function rotateRefreshToken(
  db: Db,
  config: Config,
  token: string,
  userAgent?: string,
): Promise<RotationResult> {
  const [row] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, hashToken(token))).limit(1);
  if (!row) return { ok: false, reason: 'unknown' };
  if (row.revokedAt) {
    await revokeFamily(db, row.familyId);
    return { ok: false, reason: 'reused' };
  }
  if (row.expiresAt.getTime() <= Date.now()) return { ok: false, reason: 'expired' };

  const next = await issueRefreshToken(db, config, row.userId, { familyId: row.familyId, userAgent });
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date(), replacedBy: next.id })
    .where(and(eq(refreshTokens.id, row.id), isNull(refreshTokens.revokedAt)));
  return { ok: true, userId: row.userId, next };
}

export async function revokeFamily(db: Db, familyId: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.familyId, familyId), isNull(refreshTokens.revokedAt)));
}

export async function revokeByToken(db: Db, token: string): Promise<void> {
  const [row] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, hashToken(token))).limit(1);
  if (row) await revokeFamily(db, row.familyId);
}
