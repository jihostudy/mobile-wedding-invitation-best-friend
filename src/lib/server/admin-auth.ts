import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const ADMIN_CREDENTIAL_KEY = 'primary';
const ADMIN_SESSION_COOKIE = 'admin_session';
const ADMIN_CSRF_COOKIE = 'admin_csrf';

export function safeEquals(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

function signPayload(payload: string) {
  const secret = getSessionSecret();
  if (!secret) return '';
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function createSessionToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);
  if (!signature) return '';
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;

  const expectedSignature = signPayload(encodedPayload);
  if (!expectedSignature || !safeEquals(signature, expectedSignature)) return false;

  try {
    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as { exp?: number };
    const exp = payload.exp ?? 0;
    return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');
  return `scrypt$${salt}$${hash}`;
}

export function verifyAdminPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;

  const computedHash = scryptSync(password, salt, 64).toString('base64url');
  return safeEquals(hash, computedHash);
}

export function getAdminCredentialKey() {
  return ADMIN_CREDENTIAL_KEY;
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminCsrfCookieName() {
  return ADMIN_CSRF_COOKIE;
}

export function issueAdminAuthCookies(response: NextResponse) {
  const sessionToken = createSessionToken();
  if (!sessionToken) return false;
  const csrfToken = randomBytes(24).toString('base64url');
  const secure = process.env.NODE_ENV === 'production';

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  response.cookies.set({
    name: ADMIN_CSRF_COOKIE,
    value: csrfToken,
    httpOnly: false,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return true;
}

export function clearAdminAuthCookies(response: NextResponse) {
  const secure = process.env.NODE_ENV === 'production';

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: ADMIN_CSRF_COOKIE,
    value: '',
    httpOnly: false,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });
}

export function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || '';
  if (!token) return false;

  return verifySessionToken(token);
}

export function hasValidCsrf(request: NextRequest) {
  const headerToken = request.headers.get('x-csrf-token') || '';
  const cookieToken = request.cookies.get(ADMIN_CSRF_COOKIE)?.value || '';
  if (!headerToken || !cookieToken) return false;
  return safeEquals(headerToken, cookieToken);
}
