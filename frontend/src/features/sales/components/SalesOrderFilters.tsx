import type { SalesOrderStatus } from "../types/sales";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const STATUS_OPTIONS: { value: SalesOrderStatus; label: string }[] = [
  { value: "NEW",        label: "Nowe" },
  { value: "CONFIRMED",  label: "Potwierdzone" },
  { value: "PROCESSING", label: "W realizacji" },
  { value: "READY",      label: "Gotowe" },
  { value: "COMPLETED",  label: "Zrealizowane" },
  { value: "CANCELLED",  label: "Anulowane" },
];

interface Props {
  status: SalesOrderStatus | "";
  onStatusChange: (v: SalesOrderStatus | "") => void;
  from: string;
  onFromChange: (v: string) => void;
  to: string;
  onToChange: (v: string) => void;
}

export function SalesOrderFilters({
  status, onStatusChange, from, onFromChange, to, onToChange,
}: Props) {
  // czyści wszystkie filtry naraz
  const clearAll = () => {
    onStatusChange("");
    onFromChange("");
    onToChange("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={status}
            onChange={(e) => onStatusChange(e.target.value === "" ? "" : (e.target.value as SalesOrderStatus))}>
            <option value="">Wszystkie statusy</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="w-44">
          <label className={labelCls}>Od</label>
          <input type="date" className={inputCls} value={from} onChange={(e) => onFromChange(e.target.value)} />
        </div>
        <div className="w-44">
          <label className={labelCls}>Do</label>
          <input type="date" className={inputCls} value={to} onChange={(e) => onToChange(e.target.value)} />
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
          Wyczyść
        </button>
      </div>
    </div>
  );
}