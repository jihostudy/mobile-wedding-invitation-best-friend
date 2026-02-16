"use client";

import Link from "next/link";

type AdminSectionKey =
  | "guest-messages"
  | "attendance"
  | "snap-submissions"
  | "content";

interface AdminSummaryCardsProps {
  loading: boolean;
  guestMessageCount: number;
  attendanceCount: number;
  snapCount: number;
  active?: AdminSectionKey;
}

export default function AdminSummaryCards({
  loading: _loading,
  guestMessageCount: _guestMessageCount,
  attendanceCount: _attendanceCount,
  snapCount: _snapCount,
  active,
}: AdminSummaryCardsProps) {
  const baseClassName =
    "inline-flex h-9 items-center rounded-full border border-[#d8ccb8] bg-[#fffaf2] px-4 text-sm font-medium text-[#6f6350] shadow-[0_3px_10px_rgba(86,63,37,0.08)] transition hover:border-[#c3ae8d] hover:bg-[#fff3df]";
  const activeClassName = "border-[#c8ad84] bg-[#f6e8d2] text-[#4a3a24] shadow-[0_5px_14px_rgba(89,63,33,0.15)]";

  return (
    <nav aria-label="관리자 빠른 이동" className="mt-5 border-b border-[#e6dccd] pb-3">
      <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/admin/content"
        className={`${baseClassName} ${active === "content" ? activeClassName : ""}`}
      >
        <p>메인 콘텐츠</p>
      </Link>
      <Link
        href="/admin/guest-messages"
        className={`${baseClassName} ${active === "guest-messages" ? activeClassName : ""}`}
      >
        <p>방명록</p>
      </Link>
      <Link
        href="/admin/attendance"
        className={`${baseClassName} ${active === "attendance" ? activeClassName : ""}`}
      >
        <p>참석 의사</p>
      </Link>
      <Link
        href="/admin/snap-submissions"
        className={`${baseClassName} ${active === "snap-submissions" ? activeClassName : ""}`}
      >
        <p>스냅 사진</p>
      </Link>
      </div>
    </nav>
  );
}
