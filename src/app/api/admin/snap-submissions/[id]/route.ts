import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasValidCsrf, isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');

  const id = context.params.id;
  const supabase = createServerSupabaseClient({ serviceRole: true });

  const { data: submission, error: submissionError } = await supabase
    .from('snap_upload_submissions')
    .select('id, event_slug, uploader_name, status, created_at')
    .eq('id', id)
    .maybeSingle();

  if (submissionError) return fail(500, 'ADMIN_SNAP_FETCH_FAILED', submissionError.message);
  if (!submission) return fail(404, 'NOT_FOUND', 'snap submission not found');

  const { data: files, error: filesError } = await supabase
    .from('snap_upload_files')
    .select('id, storage_bucket, storage_path, public_url, original_name, mime_type, size_bytes, created_at')
    .eq('submission_id', id)
    .order('created_at', { ascending: true });

  if (filesError) return fail(500, 'ADMIN_SNAP_FILES_FETCH_FAILED', filesError.message);

  return ok({
    submission: {
      id: submission.id,
      eventSlug: submission.event_slug,
      uploaderName: submission.uploader_name,
      status: submission.status,
      createdAt: submission.created_at,
      files: (files ?? []).map((file) => ({
        id: file.id,
        storageBucket: file.storage_bucket,
        storagePath: file.storage_path,
        publicUrl: file.public_url,
        originalName: file.original_name,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
        createdAt: file.created_at,
      })),
    },
  });
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  if (!hasValidCsrf(request)) return fail(403, 'CSRF_INVALID', 'csrf token is invalid');

  const id = context.params.id;
  let body: { status?: 'uploaded' | 'rejected' | 'approved' };
  try {
    body = (await request.json()) as { status?: 'uploaded' | 'rejected' | 'approved' };
  } catch {
    return fail(400, 'INVALID_JSON', 'invalid request body');
  }

  if (!body.status || !['uploaded', 'rejected', 'approved'].includes(body.status)) {
    return fail(400, 'VALIDATION_ERROR', 'invalid status');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { error } = await supabase
    .from('snap_upload_submissions')
    .update({ status: body.status })
    .eq('id', id);

  if (error) return fail(500, 'ADMIN_SNAP_UPDATE_FAILED', error.message);

  await supabase.from('admin_audit_logs').insert([
    {
      action: 'UPDATE_SNAP_SUBMISSION_STATUS',
      target: 'snap_upload_submissions',
      target_id: id,
      detail: { status: body.status },
    },
  ]);

  return ok({ success: true });
}
