import { NextResponse } from 'next/server';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(status: number, code: string, message: string, details?: unknown, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
      ...(details ? { details } : {}),
      ...(extra || {}),
    },
    { status },
  );
}
