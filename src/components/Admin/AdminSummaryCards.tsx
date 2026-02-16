"use client";

import Link from "next/link";

type AdminSectionKey = "guest-messages" | "attendance" | "snap-submissions";

interface AdminSummaryCardsProps {
  loading: boolean;
  guestMessageCount: number;
  attendanceCount: number;
  snapCount: number;
  active?: AdminSectionKey;
}

export default function AdminSummaryCards({
  loading,
  guestMessageCount,
  attendanceCount,
  snapCount,
  active,
}: AdminSummaryCardsProps) {
  const baseClassName =
    "group block rounded-2xl border border-[#e8e5dd] bg-gradient-to-br from-white via-[#fffdfa] to-[#f8f4ee] p-5 shadow-[0_8px_24px_rgba(60,45,20,0.08)] transition hover:-translate-y-[1px] hover:border-[#d6cfc1] hover:shadow-[0_14px_28px_rgba(60,45,20,0.14)]";
  const activeClassName = "border-[#cfbf9f] ring-1 ring-[#efe3cd]";

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Link
        href="/admin/guest-messages"
        className={`${baseClassName} ${active === "guest-messages" ? activeClassName : ""}`}
      >
        <p className="text-xs tracking-[0.06em] text-[#8c7c65]">방명록</p>
        <p className="mt-2 text-3xl font-semibold text-[#2c271f]">
          {loading ? "-" : guestMessageCount}
        </p>
      </Link>
      <Link
        href="/admin/attendance"
        className={`${baseClassName} ${active === "attendance" ? activeClassName : ""}`}
      >
        <p className="text-xs tracking-[0.06em] text-[#8c7c65]">참석 의사</p>
        <p className="mt-2 text-3xl font-semibold text-[#2c271f]">
          {loading ? "-" : attendanceCount}
        </p>
      </Link>
      <Link
        href="/admin/snap-submissions"
        className={`${baseClassName} ${active === "snap-submissions" ? activeClassName : ""}`}
      >
        <p className="text-xs tracking-[0.06em] text-[#8c7c65]">스냅 업로드</p>
        <p className="mt-2 text-3xl font-semibold text-[#2c271f]">
          {loading ? "-" : snapCount}
        </p>
      </Link>
    </div>
  );
}
