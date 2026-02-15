import { timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

function safeEquals(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function isAdminRequest(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_EDIT_PASSWORD || '';
  if (!expectedPassword) return false;

  const passwordHeader = request.headers.get('x-admin-password') || '';
  if (!passwordHeader) return false;

  return safeEquals(passwordHeader, expectedPassword);
}

export function hasValidCsrf(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  const headerToken = request.headers.get('x-csrf-token') || '';
  const cookieToken = request.cookies.get('csrf_token')?.value || '';
  if (!headerToken || !cookieToken) return false;
  return safeEquals(headerToken, cookieToken);
}
