import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasValidCsrf, isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

function sanitizePathSegment(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'asset';
  return (
    trimmed
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .slice(0, 60) || 'asset'
  );
}

function buildAltDefault(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, '').trim();
  if (!base) return 'uploaded image';
  return base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function readJpegDimensions(buffer: Buffer) {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function readImageDimensions(buffer: Buffer, mimeType: string) {
  if (mimeType === 'image/png' && buffer.toString('ascii', 1, 4) === 'PNG') {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (mimeType === 'image/jpeg' && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return readJpegDimensions(buffer);
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  }
  if (!hasValidCsrf(request)) {
    return fail(403, 'CSRF_INVALID', 'csrf token is invalid');
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'main';

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return fail(400, 'VALIDATION_ERROR', 'file is required');
  }

  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');
  if (!isImage && !isAudio) {
    return fail(400, 'VALIDATION_ERROR', 'only image or audio files are allowed');
  }

  const bucket = process.env.WEDDING_CONTENT_ASSET_BUCKET || 'snap-uploads';
  const timestamp = Date.now();
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const safeFilename = sanitizePathSegment(file.name.replace(/\.[^/.]+$/, ''));
  const fileId = randomUUID();
  const path = `wedding-content/${slug}/${timestamp}-${safeFilename}-${fileId}.${extension}`;

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageDimensions = isImage ? readImageDimensions(buffer, file.type) : null;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
    cacheControl: '31536000',
  });

  if (uploadError) {
    if (/mime type .+ is not supported/i.test(uploadError.message)) {
      return fail(400, 'VALIDATION_ERROR', uploadError.message);
    }
    return fail(500, 'ASSET_UPLOAD_FAILED', uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return ok({
    success: true,
    asset: {
      url: publicUrlData.publicUrl,
      path,
      bucket,
      altDefault: isImage ? buildAltDefault(file.name) : undefined,
      width: imageDimensions?.width,
      height: imageDimensions?.height,
    },
  });
}
