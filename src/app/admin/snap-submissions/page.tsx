"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import AdminSummaryCards from "@/components/Admin/AdminSummaryCards";
import { formatAdminDateTime } from "@/lib/admin/format";
import { useAdminGuestMessagesQuery } from "@/lib/queries/admin-guest-messages";
import { useAdminRsvpResponsesQuery } from "@/lib/queries/rsvp";
import { useAdminSnapSubmissionsQuery } from "@/lib/queries/snap";

const statusLabelMap: Record<"approved" | "rejected", string> = {
  approved: "승인됨",
  rejected: "반려됨",
};

const statusChipClassMap: Record<"approved" | "rejected", string> = {
  approved: "border-[#b8dfc2] bg-[#ebf8ef] text-[#25643a]",
  rejected: "border-[#e5c2c2] bg-[#fdeeee] text-[#8d3232]",
};

export default function AdminSnapSubmissionsPage() {
  const router = useRouter();
  const guestMessagesQuery = useAdminGuestMessagesQuery();
  const rsvpResponsesQuery = useAdminRsvpResponsesQuery();
  const snapQuery = useAdminSnapSubmissionsQuery();

  useEffect(() => {
    const errors = [
      guestMessagesQuery.error,
      rsvpResponsesQuery.error,
      snapQuery.error,
    ];
    const hasUnauthorizedError = errors.some(
      (error) => error instanceof ApiError && error.status === 401,
    );
    if (hasUnauthorizedError) {
      router.replace("/admin");
    }
  }, [guestMessagesQuery.error, router, rsvpResponsesQuery.error, snapQuery.error]);

  const loading =
    guestMessagesQuery.isLoading ||
    rsvpResponsesQuery.isLoading ||
    snapQuery.isLoading;
  const guestMessageCount = guestMessagesQuery.data?.messages.length ?? 0;
  const attendanceCount = rsvpResponsesQuery.data?.responses.length ?? 0;
  const snapCount = snapQuery.data?.submissions.length ?? 0;

  return (
    <main className="mx-auto w-full max-w-[980px] px-6 py-10">
      <h1 className="text-2xl font-semibold text-[#2f271b]">스냅 업로드</h1>
      <AdminSummaryCards
        loading={loading}
        guestMessageCount={guestMessageCount}
        attendanceCount={attendanceCount}
        snapCount={snapCount}
        active="snap-submissions"
      />

      {snapQuery.isLoading ? (
        <p className="mt-6 text-sm text-[#7f7f7f]">불러오는 중...</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(snapQuery.data?.submissions ?? []).map((submission) => (
            <li key={submission.id}>
              <Link
                href={`/admin/snap-submissions/${submission.id}`}
                className="group block overflow-hidden rounded-xl border border-[#e9e9e9] bg-white shadow-sm transition hover:-translate-y-[1px] hover:border-[#d8d8d8] hover:shadow-md"
              >
                <div className="relative aspect-[4/5] w-full bg-[#f0f0f0]">
                  {submission.files[0]?.publicUrl ? (
                    <Image
                      src={submission.files[0].publicUrl}
                      alt={`${submission.uploaderName || "익명"} 업로드 대표 이미지`}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-[#a0a0a0]">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="space-y-2 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-[#2f2f2f]">
                      {submission.uploaderName || "익명"}
                    </p>
                    {submission.status !== "uploaded" ? (
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
                          statusChipClassMap[submission.status]
                        }`}
                      >
                        {statusLabelMap[submission.status]}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[#737373]">
                    파일 {submission.files.length}장
                  </p>
                  <p className="text-xs text-[#9a9a9a]">
                    {formatAdminDateTime(submission.createdAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          {(snapQuery.data?.submissions ?? []).length === 0 ? (
            <li className="col-span-full text-sm text-[#7f7f7f]">등록된 스냅 업로드가 없습니다.</li>
          ) : null}
        </ul>
      )}
    </main>
  );
}
