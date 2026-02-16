"use client";

import { useEffect } from "react";
import { ApiError } from "@/lib/api/client";
import AdminSummaryCards from "@/components/Admin/AdminSummaryCards";
import { useAdminGuestMessagesQuery } from "@/lib/queries/admin-guest-messages";
import { useAdminRsvpResponsesQuery } from "@/lib/queries/rsvp";
import { useAdminSnapSubmissionsQuery } from "@/lib/queries/snap";

interface AdminDashboardProps {
  onUnauthorized: () => void;
  onLogout: () => Promise<void>;
}

export default function AdminDashboard({
  onUnauthorized,
  onLogout,
}: AdminDashboardProps) {
  const guestMessagesQuery = useAdminGuestMessagesQuery();
  const rsvpResponsesQuery = useAdminRsvpResponsesQuery();
  const snapSubmissionsQuery = useAdminSnapSubmissionsQuery();

  useEffect(() => {
    const errors = [
      guestMessagesQuery.error,
      rsvpResponsesQuery.error,
      snapSubmissionsQuery.error,
    ];
    const hasUnauthorizedError = errors.some(
      (error) => error instanceof ApiError && error.status === 401,
    );
    if (hasUnauthorizedError) {
      onUnauthorized();
    }
  }, [
    guestMessagesQuery.error,
    onUnauthorized,
    rsvpResponsesQuery.error,
    snapSubmissionsQuery.error,
  ]);

  const loading =
    guestMessagesQuery.isLoading ||
    rsvpResponsesQuery.isLoading ||
    snapSubmissionsQuery.isLoading;

  const guestMessageCount = guestMessagesQuery.data?.messages.length ?? 0;
  const rsvpCount = rsvpResponsesQuery.data?.responses.length ?? 0;
  const snapCount = snapSubmissionsQuery.data?.submissions.length ?? 0;

  return (
    <main className="mx-auto w-full max-w-[980px] rounded-[28px] border border-[#ece4d7] bg-[radial-gradient(circle_at_top_right,#fff9ef_0%,#f8f3ea_48%,#f5f0e6_100%)] px-6 py-10 shadow-[0_18px_40px_rgba(70,55,25,0.10)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#2f271b]">Admin Dashboard</h1>
        <button
          type="button"
          onClick={() => {
            void onLogout();
          }}
          className="h-10 rounded-lg border border-[#d6c9b2] bg-white/80 px-4 text-sm font-medium text-[#554634] transition hover:bg-[#f6efe3]"
        >
          로그아웃
        </button>
      </div>

      <AdminSummaryCards
        loading={loading}
        guestMessageCount={guestMessageCount}
        attendanceCount={rsvpCount}
        snapCount={snapCount}
      />

      <section className="mt-8 rounded-2xl border border-[#e8dece] bg-white/90 p-5 shadow-[0_10px_24px_rgba(70,55,25,0.08)]">
        <h2 className="text-base font-semibold text-[#2f271b]">최근 방명록</h2>
        {guestMessagesQuery.isLoading ? (
          <p className="mt-3 text-sm text-[#8a7f6f]">불러오는 중...</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {(guestMessagesQuery.data?.messages ?? []).slice(0, 5).map((message) => (
              <li
                key={message.id}
                className="rounded-xl border border-[#ece3d4] bg-[#fffaf3] px-4 py-3"
              >
                <p className="text-sm font-medium text-[#2f271b]">{message.author}</p>
                <p className="mt-1 text-sm text-[#4f4332]">{message.message}</p>
              </li>
            ))}
            {(guestMessagesQuery.data?.messages ?? []).length === 0 ? (
              <li className="text-sm text-[#8a7f6f]">등록된 메시지가 없습니다.</li>
            ) : null}
          </ul>
        )}
      </section>
    </main>
  );
}
