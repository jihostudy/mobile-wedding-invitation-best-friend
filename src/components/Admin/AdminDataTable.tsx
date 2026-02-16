"use client";

import { useEffect, useMemo, useState } from "react";
import type { HTMLAttributes } from "react";
import type { AdminTableColumn } from "@/components/Admin/admin-table-types";

interface AdminDataTableProps<T> {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  caption?: string;
  getRowClassName?: (row: T, index: number) => string | undefined;
  getRowProps?: (row: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  enablePagination?: boolean;
  pageSize?: number;
}

export default function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  emptyMessage = "데이터가 없습니다.",
  caption,
  getRowClassName,
  getRowProps,
  enablePagination = false,
  pageSize = 20,
}: AdminDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.max(1, Math.ceil(rows.length / pageSize));
  }, [enablePagination, pageSize, rows.length]);

  useEffect(() => {
    if (!enablePagination) {
      setCurrentPage(1);
      return;
    }
    setCurrentPage((prev) => {
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [enablePagination, totalPages]);

  useEffect(() => {
    if (!enablePagination) return;
    setCurrentPage(1);
  }, [enablePagination, pageSize, rows]);

  const pagedRows = useMemo(() => {
    if (!enablePagination) return rows;
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [currentPage, enablePagination, pageSize, rows]);

  const rangeStart = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = enablePagination
    ? Math.min(currentPage * pageSize, rows.length)
    : rows.length;

  if (isLoading) {
    return <p className="mt-6 text-sm text-[#8a7f6f]">불러오는 중...</p>;
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#e7e2d7] bg-gradient-to-b from-white to-[#fdfaf5] shadow-[0_8px_24px_rgba(70,55,25,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="border-b border-[#ece6db] bg-[#faf6ef]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold tracking-[0.06em] text-[#7b6d59] ${
                    column.className ?? ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row, index) => (
                <tr
                  key={rowKey(row)}
                  className={`border-b border-[#f1ece2] transition hover:bg-[#fffcf7] last:border-b-0 ${getRowClassName?.(row, index) ?? ""}`}
                  {...(getRowProps?.(row, index) ?? {})}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 text-[#2f2a22] ${column.className ?? ""}`}>
                      {column.renderCell(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-sm text-[#8a7f6f]" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && rows.length > 0 ? (
        <div className="flex items-center justify-between gap-3 border-t border-[#ece6db] px-4 py-3 text-xs text-[#7d725f]">
          <p>
            총 {rows.length}개 중 {rangeStart}-{rangeEnd}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="rounded-md border border-[#d8cebc] bg-white px-2 py-1 transition hover:bg-[#f6f0e7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              이전
            </button>
            <span className="min-w-[72px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="rounded-md border border-[#d8cebc] bg-white px-2 py-1 transition hover:bg-[#f6f0e7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
