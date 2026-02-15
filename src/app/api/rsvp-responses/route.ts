import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fail, ok } from '@/lib/server/http';
import type { RsvpAttendStatus, RsvpSide } from '@/types';

export async function POST(request: Request) {
  let body: {
    attendStatus?: RsvpAttendStatus;
    side?: RsvpSide;
    name?: string;
    contact?: string;
    extraCount?: number;
    eatMeal?: boolean;
    rideBus?: boolean;
    note?: string;
    agreePrivacy?: boolean;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return fail(400, 'INVALID_JSON', 'Invalid request body');
  }

  const attendStatus = body.attendStatus;
  const side = body.side;
  const name = body.name?.trim() || '';
  const contact = body.contact?.trim() || '';
  const extraCount = typeof body.extraCount === 'number' ? body.extraCount : 0;
  const eatMeal = body.eatMeal ?? true;
  const rideBus = body.rideBus ?? true;
  const note = body.note?.trim() || '';
  const agreePrivacy = body.agreePrivacy === true;

  if (!attendStatus || !['available', 'unavailable'].includes(attendStatus)) {
    return fail(400, 'VALIDATION_ERROR', 'attendStatus is invalid');
  }
  if (!side || !['groom', 'bride'].includes(side)) {
    return fail(400, 'VALIDATION_ERROR', 'side is invalid');
  }
  if (!name) return fail(400, 'VALIDATION_ERROR', 'name is required');
  if (!contact) return fail(400, 'VALIDATION_ERROR', 'contact is required');
  if (extraCount < 0 || extraCount > 20) return fail(400, 'VALIDATION_ERROR', 'extraCount must be between 0 and 20');
  if (!agreePrivacy) return fail(400, 'VALIDATION_ERROR', 'agreePrivacy must be true');

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { data, error } = await supabase
    .from('rsvp_responses')
    .insert([
      {
        attend_status: attendStatus,
        side,
        name,
        contact,
        extra_count: extraCount,
        eat_meal: eatMeal,
        ride_bus: rideBus,
        note,
        agree_privacy: agreePrivacy,
      },
    ])
    .select('id')
    .single();

  if (error) {
    return fail(500, 'RSVP_CREATE_FAILED', error.message);
  }

  return ok({ success: true, id: data.id });
}
