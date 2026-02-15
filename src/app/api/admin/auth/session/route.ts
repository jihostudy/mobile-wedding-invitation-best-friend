import type { NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/server/admin-auth';
import { ok } from '@/lib/server/http';

export async function GET(request: NextRequest) {
  return ok({
    authenticated: isAdminRequest(request),
  });
}
