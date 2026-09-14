import type { CategoryResponse } from "../types/catalog";

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
  return (
    <div className="flex gap-3 mb-4">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Szukaj po SKU lub nazwie…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        className="border rounded px-3 py-2 bg-white"
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value === "" ? "" : Number(e.target.value))}
      >
        <option value="">Wszystkie kategorie</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select
        className="border rounded px-3 py-2 bg-white"
        value={activeFilter}
        onChange={(e) => onActiveChange(e.target.value as ActiveFilter)}
      >
        <option value="all">Wszystkie</option>
        <option value="active">Aktywne</option>
        <option value="inactive">Nieaktywne</option>
      </select>
    </div>
  );
}

export type { ActiveFilter };