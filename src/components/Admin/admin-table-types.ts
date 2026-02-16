import type { ReactNode } from "react";

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  renderCell: (row: T) => ReactNode;
}

