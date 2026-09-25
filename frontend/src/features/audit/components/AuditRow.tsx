import { Fragment } from "react";
import { ActionBadge } from "./ActionBadge";
import { splitDetails } from "../utils/splitDetails";
import { fieldLabel } from "../utils/fieldLabels";
import type { AuditLogResponse } from "../types/audit";

interface Props {
  entry: AuditLogResponse;
  isOpen: boolean;
  onToggle: () => void;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function AuditRow({ entry: e, isOpen, onToggle }: Props) {
  const { description, data } = splitDetails(e.details);

  return (
    <Fragment>
      <tr
        onClick={() => data && onToggle()}
        className={`transition-colors ${data ? "cursor-pointer hover:bg-gray-50/50" : ""}`}>
        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
          {new Date(e.createdAt).toLocaleString("pl-PL")}
        </td>
        <td className="px-5 py-3"><ActionBadge action={e.action} /></td>
        <td className="px-5 py-3 text-gray-600">
          {e.entityType
            ? <span>{e.entityType}{e.entityId ? ` #${e.entityId}` : ""}</span>
            : <span className="text-gray-300">—</span>}
        </td>
                <td className="px-5 py-3 text-gray-700">
          <div className="flex items-center gap-2">
            <span className="truncate max-w-md">{description}</span>
            {data && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
              }`}>
                {isOpen ? "Zwiń" : "Rozwiń"}
              </span>
            )}
          </div>
        </td>
        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{e.performedBy}</td>
      </tr>
      {isOpen && data && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-5 py-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Zmienione dane</div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-gray-50 pb-1">
                    <dt className="text-gray-500">{fieldLabel(key)}</dt>
                    <dd className="text-gray-800 font-medium text-right">{formatValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}