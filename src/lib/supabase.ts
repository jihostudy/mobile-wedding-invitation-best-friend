/**
 * Supabase 클라이언트 설정
 * 무료 티어 사용
 */

import { createClient } from '@supabase/supabase-js';
import type { GuestMessage, GuestMessageInput } from '@/types';

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

