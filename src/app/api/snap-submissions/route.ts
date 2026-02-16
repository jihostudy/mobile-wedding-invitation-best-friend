import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fail, ok } from '@/lib/server/http';
import { getWeddingContent } from '@/lib/wedding-content/repository';

function sanitizePathSegment(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'anonymous';
  return trimmed
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 40) || 'anonymous';
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploaderName = String(formData.get('uploaderName') || '').trim();
  const eventSlug = String(formData.get('eventSlug') || 'main').trim() || 'main';
  const fileEntries = formData
    .getAll('files')
    .filter((entry): entry is File => entry instanceof File);

  if (!uploaderName) {
    return fail(400, 'VALIDATION_ERROR', 'uploaderName is required');
  }

  if (fileEntries.length === 0) {
    return fail(400, 'VALIDATION_ERROR', 'at least one file is required');
  }

  if (fileEntries.length > 40) {
    return fail(400, 'VALIDATION_ERROR', 'up to 40 files are allowed');
  }

  const { content } = await getWeddingContent(eventSlug);
  const uploadOpenAt = new Date(content.snapSection.uploadOpenAt);
  if (!Number.isNaN(uploadOpenAt.getTime()) && Date.now() < uploadOpenAt.getTime()) {
    return fail(400, 'SNAP_UPLOAD_NOT_OPEN', 'snap upload is not open yet');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { data: submission, error: submissionError } = await supabase
    .from('snap_upload_submissions')
    .insert([
      {
        event_slug: eventSlug,
        uploader_name: uploaderName,
        status: 'uploaded',
      },
    ])
    .select('id')
    .single();

  if (submissionError || !submission) {
    return fail(500, 'SNAP_SUBMISSION_CREATE_FAILED', submissionError?.message || 'failed to create submission');
  }

  const safeName = sanitizePathSegment(uploaderName);
  const now = Date.now();
  const bucket = 'snap-uploads';

  const uploadedFiles: {
    submission_id: string;
    storage_bucket: string;
    storage_path: string;
    public_url: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
  }[] = [];

  for (let index = 0; index < fileEntries.length; index += 1) {
    const file = fileEntries[index];
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const filename = `${now}-${index}.${extension}`;
    const path = `${eventSlug}/${safeName}/${submission.id}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        upsert: false,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
      });

    if (uploadError) {
      return fail(500, 'SNAP_FILE_UPLOAD_FAILED', uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

    uploadedFiles.push({
      submission_id: submission.id,
      storage_bucket: bucket,
      storage_path: path,
      public_url: publicUrlData.publicUrl,
      original_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size,
    });
  }

  const { error: filesInsertError } = await supabase
    .from('snap_upload_files')
    .insert(uploadedFiles);

  if (filesInsertError) {
    return fail(500, 'SNAP_FILE_META_CREATE_FAILED', filesInsertError.message);
  }

  return ok({ success: true, id: submission.id });
}
