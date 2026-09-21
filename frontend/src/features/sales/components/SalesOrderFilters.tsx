import type { SalesOrderStatus } from "../types/sales";

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
  return (
    <div className="flex gap-3 mb-4">
      <select
        className="border rounded px-3 py-2 bg-white"
        value={status}
        onChange={(e) => onStatusChange(e.target.value === "" ? "" : (e.target.value as SalesOrderStatus))}
      >
        <option value="">Wszystkie statusy</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <input
        type="date"
        className="border rounded px-3 py-2 bg-white"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
      />
      <span className="self-center text-gray-400">–</span>
      <input
        type="date"
        className="border rounded px-3 py-2 bg-white"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
      />
    </div>
  );
}