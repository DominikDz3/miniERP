import { useState } from "react";
import type { PurchaseOrderStatus } from "../types/purchase";

const STATUS_OPTIONS: { value: PurchaseOrderStatus; label: string }[] = [
  { value: "NEW",       label: "Nowe" },
  { value: "ORDERED",   label: "Zamówione" },
  { value: "RECEIVED",  label: "Przyjęte" },
  { value: "CANCELLED", label: "Anulowane" },
];

interface Props {
  onApply: (f: { status: PurchaseOrderStatus | ""; from: string; to: string }) => void;
}

export function PurchaseOrderFilters({ onApply }: Props) {
  const [status, setStatus] = useState<PurchaseOrderStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="flex gap-3 mb-4">
      <select className="border rounded px-3 py-2 bg-white"
        value={status}
        onChange={(e) => setStatus(e.target.value === "" ? "" : (e.target.value as PurchaseOrderStatus))}>
        <option value="">Wszystkie statusy</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <input type="date" className="border rounded px-3 py-2 bg-white"
        value={from} onChange={(e) => setFrom(e.target.value)} />
      <span className="self-center text-gray-400">–</span>
      <input type="date" className="border rounded px-3 py-2 bg-white"
        value={to} onChange={(e) => setTo(e.target.value)} />
      <button
        onClick={() => onApply({ status, from, to })}
        className="bg-blue-600 text-white rounded px-4 py-2 text-sm cursor-pointer">
        Filtruj
      </button>
    </div>
  );
}