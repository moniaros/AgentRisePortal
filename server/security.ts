import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const DEFAULT_SECRET = process.env.SESSION_SECRET || 'agentos-unicorn-hmac-secret-2026-eu-west';

export interface SessionPayload {
  userId: string;
  agencyId: string;
  email: string;
  role: 'admin' | 'agent';
  exp: number;
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100_000, 32, 'sha256').toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, expectedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function signSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  ttlSeconds = 60 * 60 * 12,
  secret = DEFAULT_SECRET
): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string, secret = DEFAULT_SECRET): SessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const [encodedPayload, providedSig] = token.split('.');
  if (!encodedPayload || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuffer = Buffer.from(providedSig, 'utf8');
  const expectedBuffer = Buffer.from(expectedSig, 'utf8');
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function computeAuditHash(prevHash: string, entryPayload: Record<string, unknown>): string {
  return crypto
    .createHash('sha256')
    .update(`${prevHash}:${JSON.stringify(entryPayload)}`)
    .digest('hex');
}

export function applySecurityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Safe for embedded preview iframe (no X-Frame-Options: DENY) while hardening MIME & referrer policies
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  next();
}

export function createRateLimiter(maxRequests = 120, windowMs = 60_000) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'local';
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests. Please retry shortly.',
      });
      return;
    }

    record.count += 1;
    next();
  };
}

export function extractSessionFromRequest(req: Request): SessionPayload | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifySessionToken(authHeader.slice(7));
  }
  return null;
}
