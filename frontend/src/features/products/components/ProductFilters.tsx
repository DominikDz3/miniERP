import type { CategoryResponse } from "../types/catalog";
import { labelCls, inputCls } from "@/shared/components/formStyles";

type ActiveFilter = "all" | "active" | "inactive";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: ActiveFilter;
  onActiveChange: (v: ActiveFilter) => void;
  categoryId: number | "";
  onCategoryChange: (v: number | "") => void;
  categories: CategoryResponse[];
}

export function ProductFilters({
  search, onSearchChange, activeFilter, onActiveChange,
  categoryId, onCategoryChange, categories,
}: Props) {
  const clearAll = () => {
    onSearchChange("");
    onCategoryChange("");
    onActiveChange("all");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className={labelCls}>Szukaj</label>
          <input
            className={inputCls}
            placeholder="Szukaj po SKU lub nazwie…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="w-52">
          <label className={labelCls}>Kategoria</label>
          <select
            className={inputCls}
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-44">
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={activeFilter}
            onChange={(e) => onActiveChange(e.target.value as ActiveFilter)}
          >
            <option value="all">Wszystkie</option>
            <option value="active">Aktywne</option>
            <option value="inactive">Nieaktywne</option>
          </select>
        </div>
        {(search || categoryId !== "" || activeFilter !== "all") && (
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