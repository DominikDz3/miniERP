import { labelCls, inputCls } from "@/shared/components/formStyles";

type ActiveFilter = "all" | "active" | "inactive";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: ActiveFilter;
  onActiveChange: (v: ActiveFilter) => void;
}

export function SupplierFilters({ search, onSearchChange, activeFilter, onActiveChange }: Props) {
  const clearAll = () => {
    onSearchChange("");
    onActiveChange("all");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className={labelCls}>Szukaj</label>
          <input
            className={inputCls}
            placeholder="Szukaj po nazwie lub NIP…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="w-48">
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={activeFilter}
            onChange={(e) => onActiveChange(e.target.value as ActiveFilter)}
          >
            <option value="all">Wszyscy</option>
            <option value="active">Aktywni</option>
            <option value="inactive">Nieaktywni</option>
          </select>
        </div>
        {(search || activeFilter !== "all") && (
          <button
            type="button"
            onClick={clearAll}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}

export type { ActiveFilter };