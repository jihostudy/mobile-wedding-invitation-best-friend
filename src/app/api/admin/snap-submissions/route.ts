import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const supabase = createServerSupabaseClient({ serviceRole: true });
  let query = supabase
    .from('snap_upload_submissions')
    .select('id, event_slug, uploader_name, status, created_at, snap_upload_files(id, storage_bucket, storage_path, public_url, original_name, mime_type, size_bytes, created_at)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return fail(500, 'ADMIN_SNAP_FETCH_FAILED', error.message);

  return ok({
    submissions: (data ?? []).map((submission) => ({
      id: submission.id,
      eventSlug: submission.event_slug,
      uploaderName: submission.uploader_name,
      status: submission.status,
      createdAt: submission.created_at,
      files: (submission.snap_upload_files ?? []).map((file) => ({
        id: file.id,
        storageBucket: file.storage_bucket,
        storagePath: file.storage_path,
        publicUrl: file.public_url,
        originalName: file.original_name,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
        createdAt: file.created_at,
      })),
    })),
  });
}
