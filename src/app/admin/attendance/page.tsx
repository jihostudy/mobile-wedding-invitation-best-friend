"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import AdminDataTable from "@/components/Admin/AdminDataTable";
import AdminSummaryCards from "@/components/Admin/AdminSummaryCards";
import AdminTableFilters from "@/components/Admin/AdminTableFilters";
import type {
  AdminFilterDefinition,
  AdminFilterState,
} from "@/components/Admin/admin-filter-types";
import type { AdminTableColumn } from "@/components/Admin/admin-table-types";
import { applyFilters, buildFilterOptions } from "@/lib/admin/filters";
import {
  formatAdminDateTime,
  formatAttendStatus,
  formatBooleanKorean,
  formatSide,
} from "@/lib/admin/format";
import { useAdminGuestMessagesQuery } from "@/lib/queries/admin-guest-messages";
import { useAdminRsvpResponsesQuery } from "@/lib/queries/rsvp";
import { useAdminSnapSubmissionsQuery } from "@/lib/queries/snap";
import type { RsvpResponseDto } from "@/types";

export default function AdminAttendancePage() {
  const router = useRouter();
  const guestMessagesQuery = useAdminGuestMessagesQuery();
  const rsvpQuery = useAdminRsvpResponsesQuery();
  const snapSubmissionsQuery = useAdminSnapSubmissionsQuery();
  const [filterState, setFilterState] = useState<AdminFilterState>({});

  useEffect(() => {
    const errors = [
      guestMessagesQuery.error,
      rsvpQuery.error,
      snapSubmissionsQuery.error,
    ];
    const hasUnauthorizedError = errors.some(
      (error) => error instanceof ApiError && error.status === 401,
    );
    if (hasUnauthorizedError) {
      router.replace("/admin");
    }
  }, [guestMessagesQuery.error, router, rsvpQuery.error, snapSubmissionsQuery.error]);

  const loading =
    guestMessagesQuery.isLoading ||
    rsvpQuery.isLoading ||
    snapSubmissionsQuery.isLoading;
  const guestMessageCount = guestMessagesQuery.data?.messages.length ?? 0;
  const attendanceCount = rsvpQuery.data?.responses.length ?? 0;
  const snapCount = snapSubmissionsQuery.data?.submissions.length ?? 0;
  const sourceRows = rsvpQuery.data?.responses ?? [];
  const filterDefinitions = useMemo<AdminFilterDefinition<RsvpResponseDto>[]>(
    () => [
      {
        id: "attendStatus",
        label: "참석 여부",
        getValue: (row) => row.attendStatus,
        formatValue: (value) => formatAttendStatus(value as RsvpResponseDto["attendStatus"]),
        sort: "custom",
        compareFn: (a, b) => {
          const rank = (value: string) => (value === "available" ? 0 : 1);
          return rank(a.value) - rank(b.value);
        },
      },
      {
        id: "side",
        label: "구분",
        getValue: (row) => row.side,
        formatValue: (value) => formatSide(value as RsvpResponseDto["side"]),
        sort: "custom",
        compareFn: (a, b) => {
          const rank = (value: string) => (value === "groom" ? 0 : 1);
          return rank(a.value) - rank(b.value);
        },
      },
      {
        id: "extraCount",
        label: "동행 인원",
        getValue: (row) => row.extraCount,
        sort: "custom",
        compareFn: (a, b) => Number(a.value) - Number(b.value),
      },
      {
        id: "eatMeal",
        label: "식사",
        getValue: (row) => row.eatMeal,
        formatValue: (value) => formatBooleanKorean(Boolean(value)),
        sort: "custom",
        compareFn: (a, b) => {
          const rank = (value: string) => (value === "true" ? 0 : 1);
          return rank(a.value) - rank(b.value);
        },
      },
      {
        id: "rideBus",
        label: "셔틀",
        getValue: (row) => row.rideBus,
        formatValue: (value) => formatBooleanKorean(Boolean(value)),
        sort: "custom",
        compareFn: (a, b) => {
          const rank = (value: string) => (value === "true" ? 0 : 1);
          return rank(a.value) - rank(b.value);
        },
      },
    ],
    [],
  );
  const optionsByFilter = useMemo(
    () => buildFilterOptions(sourceRows, filterDefinitions),
    [filterDefinitions, sourceRows],
  );
  const filteredRows = useMemo(
    () => applyFilters(sourceRows, filterDefinitions, filterState),
    [filterDefinitions, filterState, sourceRows],
  );
  const mealTotalCount = useMemo(
    () =>
      filteredRows.reduce((sum, row) => {
        if (!row.eatMeal) return sum;
        const companions = Math.max(0, row.extraCount ?? 0);
        return sum + 1 + companions;
      }, 0),
    [filteredRows],
  );
  const shuttleTotalCount = useMemo(
    () =>
      filteredRows.reduce((sum, row) => {
        if (!row.rideBus) return sum;
        const companions = Math.max(0, row.extraCount ?? 0);
        return sum + 1 + companions;
      }, 0),
    [filteredRows],
  );
  const columns: AdminTableColumn<RsvpResponseDto>[] = [
    {
      key: "name",
      header: "이름",
      className: "whitespace-nowrap",
      renderCell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "attendStatus",
      header: "참석 여부",
      className: "whitespace-nowrap",
      renderCell: (row) => formatAttendStatus(row.attendStatus),
    },
    {
      key: "side",
      header: "구분",
      className: "whitespace-nowrap",
      renderCell: (row) => (
        <span
          className={
            row.side === "groom"
              ? "font-medium text-[#2f69d8]"
              : "font-medium text-[#d85f97]"
          }
        >
          {formatSide(row.side)}
        </span>
      ),
    },
    {
      key: "extraCount",
      header: "동행 인원",
      className: "whitespace-nowrap text-right",
      renderCell: (row) => row.extraCount,
    },
    {
      key: "eatMeal",
      header: "식사",
      className: "whitespace-nowrap",
      renderCell: (row) => formatBooleanKorean(row.eatMeal),
    },
    {
      key: "rideBus",
      header: "셔틀",
      className: "whitespace-nowrap",
      renderCell: (row) => formatBooleanKorean(row.rideBus),
    },
    {
      key: "contact",
      header: "연락처",
      className: "whitespace-nowrap",
      renderCell: (row) => row.contact || "-",
    },
    {
      key: "note",
      header: "메모",
      className: "min-w-[220px] max-w-[360px]",
      renderCell: (row) => row.note || "-",
    },
    {
      key: "createdAt",
      header: "등록일",
      className: "whitespace-nowrap",
      renderCell: (row) => formatAdminDateTime(row.createdAt),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[980px] px-6 py-10">
      <h1 className="text-2xl font-semibold text-[#2f271b]">참석 의사</h1>
      <AdminSummaryCards
        loading={loading}
        guestMessageCount={guestMessageCount}
        attendanceCount={attendanceCount}
        snapCount={snapCount}
        active="attendance"
      />
      <AdminTableFilters
        definitions={filterDefinitions}
        optionsByFilter={optionsByFilter}
        state={filterState}
        onChange={setFilterState}
        onReset={() => setFilterState({})}
      />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-[#e6dccb] bg-white/90 px-4 py-3 shadow-[0_8px_20px_rgba(70,55,25,0.07)]">
          <p className="text-xs tracking-[0.05em] text-[#7e6f58]">식사 인원 총합</p>
          <p className="mt-1 text-2xl font-semibold text-[#2f271b]">{mealTotalCount}명</p>
        </article>
        <article className="rounded-2xl border border-[#e6dccb] bg-white/90 px-4 py-3 shadow-[0_8px_20px_rgba(70,55,25,0.07)]">
          <p className="text-xs tracking-[0.05em] text-[#7e6f58]">셔틀 버스 탑승 총합</p>
          <p className="mt-1 text-2xl font-semibold text-[#2f271b]">{shuttleTotalCount}명</p>
        </article>
      </div>

      <AdminDataTable
        caption="참석 의사 목록"
        columns={columns}
        rows={filteredRows}
        rowKey={(row) => row.id}
        isLoading={rsvpQuery.isLoading}
        emptyMessage="등록된 응답이 없습니다."
        enablePagination
        pageSize={20}
      />
    </main>
  );
}
