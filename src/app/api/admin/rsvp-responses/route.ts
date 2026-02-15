import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { data, error } = await supabase
    .from('rsvp_responses')
    .select('id, attend_status, side, name, contact, extra_count, eat_meal, ride_bus, note, agree_privacy, created_at')
    .order('created_at', { ascending: false });

  if (error) return fail(500, 'ADMIN_RSVP_FETCH_FAILED', error.message);

  return ok({
    responses: (data ?? []).map((item) => ({
      id: item.id,
      attendStatus: item.attend_status,
      side: item.side,
      name: item.name,
      contact: item.contact,
      extraCount: item.extra_count,
      eatMeal: item.eat_meal,
      rideBus: item.ride_bus,
      note: item.note,
      agreePrivacy: item.agree_privacy,
      createdAt: item.created_at,
    })),
  });
}
