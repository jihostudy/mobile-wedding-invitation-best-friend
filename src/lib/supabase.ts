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
    password: item.password,
    createdAt: new Date(item.created_at),
    isPrivate: item.is_private,
  }));
}

/**
 * 방명록 메시지 작성
 */
export async function createGuestMessage(
  input: GuestMessageInput
): Promise<{ success: boolean; error?: string }> {
  // 비밀번호 해시화 (프론트엔드에서 간단하게 처리)
  const hashedPassword = await hashPassword(input.password);

  const { error } = await supabase.from('guest_messages').insert([
    {
      author: input.author,
      message: input.message,
      password: hashedPassword,
      is_private: input.isPrivate,
    },
  ]);

  if (error) {
    console.error('Error creating guest message:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 방명록 메시지 삭제 (비밀번호 확인)
 */
export async function deleteGuestMessage(
  messageId: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // 메시지 조회
  const { data, error: fetchError } = await supabase
    .from('guest_messages')
    .select('password')
    .eq('id', messageId)
    .single();

  if (fetchError || !data) {
    return { success: false, error: '메시지를 찾을 수 없습니다.' };
  }

  // 비밀번호 확인
  const hashedPassword = await hashPassword(password);
  if (data.password !== hashedPassword) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  // 삭제
  const { error: deleteError } = await supabase
    .from('guest_messages')
    .delete()
    .eq('id', messageId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}

/**
 * 간단한 비밀번호 해시 (Web Crypto API 사용)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Supabase 테이블 생성 SQL (참고용)
 * Supabase 대시보드에서 실행:
 * 
 * CREATE TABLE guest_messages (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   author TEXT NOT NULL,
 *   message TEXT NOT NULL,
 *   password TEXT NOT NULL,
 *   is_private BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_guest_messages_created_at ON guest_messages(created_at DESC);
 * 
 * -- Row Level Security (RLS) 활성화
 * ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
 * 
 * -- 모든 사용자가 읽기 가능
 * CREATE POLICY "Public read access" ON guest_messages FOR SELECT USING (true);
 * 
 * -- 모든 사용자가 삽입 가능
 * CREATE POLICY "Public insert access" ON guest_messages FOR INSERT WITH CHECK (true);
 * 
 * -- 본인만 삭제 가능 (비밀번호로 확인)
 * CREATE POLICY "Delete own messages" ON guest_messages FOR DELETE USING (true);
 */

