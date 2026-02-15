/**
 * Supabase 클라이언트 설정
 * 무료 티어 사용
 */

import { createClient } from '@supabase/supabase-js';
import type {
  GuestMessage,
  GuestMessageInput,
  RsvpResponseInput,
  SnapUploadInput,
} from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 초기화
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 방명록 메시지 조회
 */
export async function getGuestMessages(): Promise<GuestMessage[]> {
  const { data, error } = await supabase
    .from('guest_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guest messages:', error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    author: item.author,
    message: item.message,
    createdAt: new Date(item.created_at),
    isPublic: item.is_public ?? true, // 기본값: 공개
  }));
}

/**
 * 방명록 메시지 작성
 */
export async function createGuestMessage(
  input: GuestMessageInput
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('guest_messages').insert([
    {
      author: input.author,
      message: input.message,
      is_public: input.isPublic,
    },
  ]);

  if (error) {
    console.error('Error creating guest message:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 방명록 메시지 삭제
 */
export async function deleteGuestMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('guest_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

function createUploadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizePathSegment(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'anonymous';
  return trimmed
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 40) || 'anonymous';
}

/**
 * RSVP 응답 저장
 */
export async function createRsvpResponse(
  input: RsvpResponseInput
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('rsvp_responses').insert([
    {
      attend_status: input.attendStatus,
      side: input.side,
      name: input.name,
      contact: input.contact,
      extra_count: input.extraCount,
      eat_meal: input.eatMeal,
      ride_bus: input.rideBus,
      note: input.note,
      agree_privacy: input.agreePrivacy,
    },
  ]);

  if (error) {
    console.error('Error creating RSVP response:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 스냅 업로드 저장 (Storage + DB 메타데이터)
 */
export async function createSnapUploadSubmission(
  input: SnapUploadInput
): Promise<{ success: boolean; error?: string }> {
  const files = input.files ?? [];
  if (!input.uploaderName.trim()) {
    return { success: false, error: '이름을 입력해주세요.' };
  }
  if (files.length === 0) {
    return { success: false, error: '업로드할 사진을 선택해주세요.' };
  }

  const eventSlug = input.eventSlug?.trim() || 'main';
  const { data: submission, error: submissionError } = await supabase
    .from('snap_upload_submissions')
    .insert([
      {
        event_slug: eventSlug,
        uploader_name: input.uploaderName.trim(),
        status: 'uploaded',
      },
    ])
    .select('id')
    .single();

  if (submissionError || !submission) {
    console.error('Error creating snap submission:', submissionError);
    return { success: false, error: submissionError?.message || '업로드를 시작하지 못했습니다.' };
  }

  const safeName = sanitizePathSegment(input.uploaderName);
  const bucket = 'snap-uploads';
  const now = Date.now();

  const uploadedFiles = await Promise.all(
    files.map(async (file, index) => {
      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
      const filename = `${now}-${index}-${createUploadId()}.${extension}`;
      const path = `${eventSlug}/${safeName}/${submission.id}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream',
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return {
        submission_id: submission.id,
        storage_bucket: bucket,
        storage_path: path,
        public_url: publicUrlData.publicUrl,
        original_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      };
    })
  ).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.';
    return { __uploadError: message } as const;
  });

  if (Array.isArray(uploadedFiles) === false) {
    return { success: false, error: uploadedFiles.__uploadError };
  }

  const { error: fileMetaError } = await supabase
    .from('snap_upload_files')
    .insert(uploadedFiles);

  if (fileMetaError) {
    console.error('Error inserting snap file metadata:', fileMetaError);
    return { success: false, error: fileMetaError.message };
  }

  return { success: true };
}

/**
 * Supabase 테이블 생성 SQL (참고용)
 * Supabase 대시보드에서 실행:
 * 
 * CREATE TABLE guest_messages (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   author TEXT NOT NULL,
 *   message TEXT NOT NULL,
 *   is_public BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_guest_messages_created_at ON guest_messages(created_at DESC);
 * 
 * -- Row Level Security (RLS) 활성화
 * ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
 * 
 * -- 모든 사용자가 읽기 가능 (공개 메시지만)
 * CREATE POLICY "Public read access" ON guest_messages 
 *   FOR SELECT USING (is_public = true);
 * 
 * -- 모든 사용자가 삽입 가능
 * CREATE POLICY "Public insert access" ON guest_messages 
 *   FOR INSERT WITH CHECK (true);
 * 
 * -- 모든 사용자가 삭제 가능 (추후 관리자 기능 추가 시 수정)
 * CREATE POLICY "Delete messages" ON guest_messages 
 *   FOR DELETE USING (true);
 */
