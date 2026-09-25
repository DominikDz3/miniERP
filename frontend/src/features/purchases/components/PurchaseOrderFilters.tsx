import { useState } from "react";
import type { PurchaseOrderStatus } from "../types/purchase";
import { labelCls, inputCls } from "@/shared/components/formStyles";

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

  const clearAll = () => {
    setStatus("");
    setFrom("");
    setTo("");
    onApply({ status: "", from: "", to: "" });
  };

  const handleApply = () => {
    onApply({ status, from, to });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value === "" ? "" : (e.target.value as PurchaseOrderStatus))}
          >
            <option value="">Wszystkie statusy</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="w-44">
          <label className={labelCls}>Od</label>
          <input
            type="date"
            className={inputCls}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="w-44">
          <label className={labelCls}>Do</label>
          <input
            type="date"
            className={inputCls}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
        >
          Filtruj
        </button>

        {(status || from || to) && (
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