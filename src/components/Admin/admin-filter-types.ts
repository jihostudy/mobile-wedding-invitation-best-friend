export type AdminFilterPrimitive = string | number | boolean | null | undefined;

export interface AdminFilterDefinition<T> {
  id: string;
  label: string;
  getValue: (row: T) => AdminFilterPrimitive;
  formatValue?: (value: string | number | boolean) => string;
  sort?: "asc" | "desc" | "custom";
  compareFn?: (a: AdminFilterOption, b: AdminFilterOption) => number;
}

export interface AdminFilterOption {
  value: string;
  label: string;
  count: number;
}

export type AdminFilterState = Record<string, string[]>;

