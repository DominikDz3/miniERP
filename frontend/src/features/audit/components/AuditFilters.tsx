import { ACTIONS, ENTITIES } from "./filterOptions";
import type { AuditAction, AuditEntity } from "../types/audit";

const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white";

interface Props {
  action: AuditAction | "";
  entityType: AuditEntity | "";
  from: string;
  to: string;
  onAction: (v: AuditAction | "") => void;
  onEntity: (v: AuditEntity | "") => void;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export function AuditFilters({
  action, entityType, from, to,
  onAction, onEntity, onFrom, onTo, onApply, onClear,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <h2 className="text-sm font-medium text-gray-600 mb-3">Filtry</h2>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Akcja</label>
          <select className={inputCls} value={action} onChange={(e) => onAction(e.target.value as AuditAction | "")}>
            <option value="">Wszystkie</option>
            {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Obiekt</label>
          <select className={inputCls} value={entityType} onChange={(e) => onEntity(e.target.value as AuditEntity | "")}>
            <option value="">Wszystkie</option>
            {ENTITIES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Od</label>
          <input type="date" className={inputCls} value={from} onChange={(e) => onFrom(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Do</label>
          <input type="date" className={inputCls} value={to} onChange={(e) => onTo(e.target.value)} />
        </div>

        <button onClick={onApply}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer">
          Filtruj
        </button>
        <button onClick={onClear}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 cursor-pointer">
          Wyczyść
        </button>
      </div>
    </div>
  );
}