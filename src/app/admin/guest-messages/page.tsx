"use client";

import { GripVertical } from "lucide-react";
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
import { formatAdminDateTime } from "@/lib/admin/format";
import useToast from "@/components/common/toast/useToast";
import {
  useAdminGuestMessagesQuery,
  useAdminReorderGuestMessagesMutation,
} from "@/lib/queries/admin-guest-messages";
import { useAdminRsvpResponsesQuery } from "@/lib/queries/rsvp";
import { useAdminSnapSubmissionsQuery } from "@/lib/queries/snap";
import type { GuestMessageDto } from "@/types";

export default function AdminGuestMessagesPage() {
  const toast = useToast();
  const router = useRouter();
  const guestMessagesQuery = useAdminGuestMessagesQuery();
  const reorderMutation = useAdminReorderGuestMessagesMutation();
  const rsvpResponsesQuery = useAdminRsvpResponsesQuery();
  const snapSubmissionsQuery = useAdminSnapSubmissionsQuery();
  const [rows, setRows] = useState<GuestMessageDto[]>([]);
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<AdminFilterState>({});

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
      router.replace("/admin");
    }
  }, [guestMessagesQuery.error, router, rsvpResponsesQuery.error, snapSubmissionsQuery.error]);

  const loading =
    guestMessagesQuery.isLoading ||
    rsvpResponsesQuery.isLoading ||
    snapSubmissionsQuery.isLoading;
  const guestMessageCount = guestMessagesQuery.data?.messages.length ?? 0;
  const attendanceCount = rsvpResponsesQuery.data?.responses.length ?? 0;
  const snapCount = snapSubmissionsQuery.data?.submissions.length ?? 0;
  const draggableEnabled = !reorderMutation.isPending;

  useEffect(() => {
    setRows(guestMessagesQuery.data?.messages ?? []);
  }, [guestMessagesQuery.data?.messages]);

  const publicMessageIds = useMemo(
    () => rows.filter((item) => item.isPublic).map((item) => item.id),
    [rows],
  );
  const filterDefinitions = useMemo<AdminFilterDefinition<GuestMessageDto>[]>(
    () => [
      {
        id: "isPublic",
        label: "공개 여부",
        getValue: (row) => row.isPublic,
        formatValue: (value) => (value ? "공개" : "비공개"),
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
    () => buildFilterOptions(rows, filterDefinitions),
    [filterDefinitions, rows],
  );
  const filteredRows = useMemo(
    () => applyFilters(rows, filterDefinitions, filterState),
    [filterDefinitions, filterState, rows],
  );

  const reorderPublicRows = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return rows;

    const publicRows = rows.filter((item) => item.isPublic);
    const sourceIndex = publicRows.findIndex((item) => item.id === sourceId);
    const targetIndex = publicRows.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return rows;

    const nextPublicRows = [...publicRows];
    const [moved] = nextPublicRows.splice(sourceIndex, 1);
    nextPublicRows.splice(targetIndex, 0, moved);

    let publicIndex = 0;
    return rows.map((row) => {
      if (!row.isPublic) return row;
      const nextRow = nextPublicRows[publicIndex];
      publicIndex += 1;
      return nextRow;
    });
  };

  const persistPublicOrder = async (nextRows: GuestMessageDto[]) => {
    const nextPublicIds = nextRows.filter((item) => item.isPublic).map((item) => item.id);
    if (nextPublicIds.length === 0) return;
    if (nextPublicIds.join(",") === publicMessageIds.join(",")) return;

    await reorderMutation.mutateAsync({ ids: nextPublicIds });
    toast.success("공개 방명록 순서를 저장했습니다.");
  };

  const columns: AdminTableColumn<GuestMessageDto>[] = [
    {
      key: "drag",
      header: "순서",
      className: "w-[80px] whitespace-nowrap",
      renderCell: (row) =>
        row.isPublic ? (
          <span className="inline-flex items-center gap-1 text-[#8a8a8a]">
            <GripVertical size={14} />
            <span className="text-xs">드래그</span>
          </span>
        ) : (
          <span className="text-xs text-[#b0b0b0]">-</span>
        ),
    },
    {
      key: "author",
      header: "작성자",
      className: "whitespace-nowrap",
      renderCell: (row) => <span className="font-medium">{row.author}</span>,
    },
    {
      key: "message",
      header: "메시지",
      className: "min-w-[260px] max-w-[420px]",
      renderCell: (row) => (
        <span
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {row.message}
        </span>
      ),
    },
    {
      key: "isPublic",
      header: "공개 여부",
      className: "whitespace-nowrap",
      renderCell: (row) => (row.isPublic ? "공개" : "비공개"),
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
      <h1 className="text-2xl font-semibold text-[#2f271b]">방명록</h1>
      <AdminSummaryCards
        loading={loading}
        guestMessageCount={guestMessageCount}
        attendanceCount={attendanceCount}
        snapCount={snapCount}
        active="guest-messages"
      />
      <p className="mt-5 text-xs text-[#7b6f5c]">
        공개 메시지 행을 드래그해 순서를 변경할 수 있습니다. 비공개 메시지는 순서 변경 대상이 아닙니다.
      </p>
      <AdminTableFilters
        definitions={filterDefinitions}
        optionsByFilter={optionsByFilter}
        state={filterState}
        onChange={setFilterState}
        onReset={() => setFilterState({})}
      />

      <AdminDataTable
        caption="방명록 목록"
        columns={columns}
        rows={filteredRows}
        rowKey={(row) => row.id}
        isLoading={guestMessagesQuery.isLoading}
        emptyMessage="등록된 메시지가 없습니다."
        enablePagination
        pageSize={20}
        getRowClassName={(row) =>
          row.id === draggingRowId
            ? "bg-[#fafafa]"
            : row.isPublic && draggableEnabled
              ? "cursor-grab"
              : ""
        }
        getRowProps={(row) => ({
          draggable: row.isPublic && draggableEnabled,
          onDragStart: (event) => {
            if (!row.isPublic || !draggableEnabled) return;
            setDraggingRowId(row.id);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", row.id);
          },
          onDragOver: (event) => {
            if (!row.isPublic || !draggingRowId || !draggableEnabled) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          },
          onDrop: async (event) => {
            if (!row.isPublic || !draggingRowId || !draggableEnabled) return;
            event.preventDefault();
            const sourceId = event.dataTransfer.getData("text/plain") || draggingRowId;
            const nextRows = reorderPublicRows(sourceId, row.id);
            if (nextRows === rows) {
              setDraggingRowId(null);
              return;
            }

            setRows(nextRows);
            setDraggingRowId(null);
            try {
              await persistPublicOrder(nextRows);
            } catch (error) {
              const message =
                error instanceof ApiError
                  ? error.message
                  : "순서 저장에 실패했습니다. 다시 시도해 주세요.";
              toast.error(message);
              void guestMessagesQuery.refetch();
            }
          },
          onDragEnd: () => {
            setDraggingRowId(null);
          },
        })}
      />
    </main>
  );
}
