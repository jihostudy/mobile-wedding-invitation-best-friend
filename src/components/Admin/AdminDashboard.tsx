"use client";

import { useEffect } from "react";
import { ApiError } from "@/lib/api/client";
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
    <main className="mx-auto w-full max-w-[960px] px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#232323]">Admin Dashboard</h1>
        <button
          type="button"
          onClick={() => {
            void onLogout();
          }}
          className="h-10 rounded-lg border border-[#d0d0d0] px-4 text-sm font-medium text-[#3a3a3a] transition hover:bg-black/5"
        >
          로그아웃
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-[#dfdfdf] bg-white p-5">
          <p className="text-xs tracking-[0.04em] text-[#7e7e7e]">방명록</p>
          <p className="mt-2 text-3xl font-semibold text-[#2d2d2d]">
            {loading ? "-" : guestMessageCount}
          </p>
        </article>
        <article className="rounded-xl border border-[#dfdfdf] bg-white p-5">
          <p className="text-xs tracking-[0.04em] text-[#7e7e7e]">RSVP</p>
          <p className="mt-2 text-3xl font-semibold text-[#2d2d2d]">
            {loading ? "-" : rsvpCount}
          </p>
        </article>
        <article className="rounded-xl border border-[#dfdfdf] bg-white p-5">
          <p className="text-xs tracking-[0.04em] text-[#7e7e7e]">스냅 업로드</p>
          <p className="mt-2 text-3xl font-semibold text-[#2d2d2d]">
            {loading ? "-" : snapCount}
          </p>
        </article>
      </div>

      <section className="mt-8 rounded-xl border border-[#dfdfdf] bg-white p-5">
        <h2 className="text-base font-semibold text-[#2a2a2a]">최근 방명록</h2>
        {guestMessagesQuery.isLoading ? (
          <p className="mt-3 text-sm text-[#7f7f7f]">불러오는 중...</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {(guestMessagesQuery.data?.messages ?? []).slice(0, 5).map((message) => (
              <li
                key={message.id}
                className="rounded-lg border border-[#ebebeb] bg-[#fafafa] px-4 py-3"
              >
                <p className="text-sm font-medium text-[#2a2a2a]">{message.author}</p>
                <p className="mt-1 text-sm text-[#4b4b4b]">{message.message}</p>
              </li>
            ))}
            {(guestMessagesQuery.data?.messages ?? []).length === 0 ? (
              <li className="text-sm text-[#7f7f7f]">등록된 메시지가 없습니다.</li>
            ) : null}
          </ul>
        )}
      </section>
    </main>
  );
}
