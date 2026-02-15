import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function createServerSupabaseClient(options?: { serviceRole?: boolean }) {
  const useServiceRole = options?.serviceRole ?? false;
  const key = useServiceRole && supabaseServiceRoleKey ? supabaseServiceRoleKey : supabaseAnonKey;

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
}
