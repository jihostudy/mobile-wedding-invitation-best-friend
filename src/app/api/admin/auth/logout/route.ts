import { clearAdminAuthCookies } from '@/lib/server/admin-auth';
import { ok } from '@/lib/server/http';

export async function POST() {
  const response = ok({ success: true });
  clearAdminAuthCookies(response);
  return response;
}
