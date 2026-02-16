import type {
  AdminFilterDefinition,
  AdminFilterOption,
  AdminFilterPrimitive,
  AdminFilterState,
} from "@/components/Admin/admin-filter-types";

function normalizeFilterValue(value: Exclude<AdminFilterPrimitive, null | undefined>) {
  if (typeof value === "string") return value.trim();
  return String(value);
}

function compareOptionsAsc(a: AdminFilterOption, b: AdminFilterOption) {
  return a.label.localeCompare(b.label, "ko");
}

function compareOptionsDesc(a: AdminFilterOption, b: AdminFilterOption) {
  return b.label.localeCompare(a.label, "ko");
}

export function buildFilterOptions<T>(
  rows: T[],
  definitions: AdminFilterDefinition<T>[],
) {
  const optionsByFilter: Record<string, AdminFilterOption[]> = {};

  definitions.forEach((definition) => {
    const map = new Map<string, AdminFilterOption>();

    rows.forEach((row) => {
      const rawValue = definition.getValue(row);
      if (rawValue === null || rawValue === undefined) return;
      if (typeof rawValue === "string" && rawValue.trim() === "") return;

      const normalized = normalizeFilterValue(rawValue);
      const label = definition.formatValue
        ? definition.formatValue(rawValue)
        : String(rawValue);

      const current = map.get(normalized);
      if (current) {
        current.count += 1;
        return;
      }

      map.set(normalized, {
        value: normalized,
        label,
        count: 1,
      });
    });

    const options = [...map.values()];
    if (definition.sort === "custom" && definition.compareFn) {
      options.sort(definition.compareFn);
    } else if (definition.sort === "desc") {
      options.sort(compareOptionsDesc);
    } else {
      options.sort(compareOptionsAsc);
    }

    optionsByFilter[definition.id] = options;
  });

  return optionsByFilter;
}

export function applyFilters<T>(
  rows: T[],
  definitions: AdminFilterDefinition<T>[],
  state: AdminFilterState,
) {
  return rows.filter((row) => {
    return definitions.every((definition) => {
      const selected = state[definition.id] ?? [];
      if (selected.length === 0) return true;

      const rawValue = definition.getValue(row);
      if (rawValue === null || rawValue === undefined) return false;
      if (typeof rawValue === "string" && rawValue.trim() === "") return false;

      const normalized = normalizeFilterValue(rawValue);
      return selected.includes(normalized);
    });
  });
}

export function hasAnyFilterSelection(state: AdminFilterState) {
  return Object.values(state).some((values) => values.length > 0);
}

