"use client";

import type {
  AdminFilterDefinition,
  AdminFilterOption,
  AdminFilterState,
} from "@/components/Admin/admin-filter-types";

interface AdminTableFiltersProps<T> {
  definitions: AdminFilterDefinition<T>[];
  optionsByFilter: Record<string, AdminFilterOption[]>;
  state: AdminFilterState;
  onChange: (next: AdminFilterState) => void;
  onReset: () => void;
}

export default function AdminTableFilters<T>({
  definitions,
  optionsByFilter,
  state,
  onChange,
  onReset,
}: AdminTableFiltersProps<T>) {
  const toggleOption = (filterId: string, value: string) => {
    const current = state[filterId] ?? [];
    const exists = current.includes(value);
    const nextValues = exists
      ? current.filter((item) => item !== value)
      : [...current, value];

    onChange({
      ...state,
      [filterId]: nextValues,
    });
  };

  return (
    <section className="mt-5 rounded-2xl border border-[#e7e2d7] bg-gradient-to-b from-white to-[#fdfaf5] p-4 shadow-[0_8px_20px_rgba(70,55,25,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#3a3227]">필터</h2>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-[#d8cebc] bg-white px-2.5 py-1.5 text-xs text-[#6a5f4d] transition hover:bg-[#f6f0e7]"
        >
          전체 초기화
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {definitions.map((definition) => {
          const options = optionsByFilter[definition.id] ?? [];
          if (options.length === 0) return null;

          const selected = state[definition.id] ?? [];
          return (
            <fieldset key={definition.id} className="min-w-[180px]">
              <legend className="mb-2 text-xs font-semibold text-[#7a6c58]">
                {definition.label}
              </legend>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const inputId = `${definition.id}-${option.value}`;
                  const checked = selected.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      htmlFor={inputId}
                      className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs transition ${
                        checked
                          ? "border-[#5f4f36] bg-[#5f4f36] text-white shadow-sm"
                          : "border-[#ddd3c3] bg-white text-[#584d3c] hover:bg-[#f8f3ea]"
                      }`}
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOption(definition.id, option.value)}
                        className="sr-only"
                      />
                      {option.label} ({option.count})
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}
