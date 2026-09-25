type ActiveFilter = "all" | "active" | "inactive";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: ActiveFilter;
  onActiveChange: (v: ActiveFilter) => void;
}

const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white";

export function CustomerFilters({ search, onSearchChange, activeFilter, onActiveChange }: Props) {
  return (
    <div className="flex gap-3 mb-4">
      <input
        className={`flex-1 ${inputCls}`}
        placeholder="Szukaj po nazwie lub NIP…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select className={inputCls} value={activeFilter} onChange={(e) => onActiveChange(e.target.value as ActiveFilter)}>
        <option value="all">Wszyscy</option>
        <option value="active">Aktywni</option>
        <option value="inactive">Nieaktywni</option>
      </select>
    </div>
  );
}

export type { ActiveFilter };