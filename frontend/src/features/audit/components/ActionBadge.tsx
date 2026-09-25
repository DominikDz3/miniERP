import type { AuditAction } from "../types/audit";

const STYLE: Record<AuditAction, string> = {
  LOGIN_SUCCESS:  "bg-green-100 text-green-700",
  LOGIN_FAILED:   "bg-red-100 text-red-700",
  CREATE:         "bg-blue-100 text-blue-700",
  UPDATE:         "bg-amber-100 text-amber-800",
  ACTIVATE:       "bg-green-100 text-green-700",
  DEACTIVATE:     "bg-gray-100 text-gray-600",
  STATUS_CHANGE:  "bg-purple-100 text-purple-700",
  STOCK_MOVEMENT: "bg-teal-100 text-teal-700",
  PASSWORD_RESET: "bg-orange-100 text-orange-700",
};

const LABEL: Record<AuditAction, string> = {
  LOGIN_SUCCESS:  "Logowanie",
  LOGIN_FAILED:   "Błąd logowania",
  CREATE:         "Utworzenie",
  UPDATE:         "Edycja",
  ACTIVATE:       "Aktywacja",
  DEACTIVATE:     "Dezaktywacja",
  STATUS_CHANGE:  "Zmiana statusu",
  STOCK_MOVEMENT: "Ruch magazynowy",
  PASSWORD_RESET: "Reset hasła",
};

export function ActionBadge({ action }: { action: AuditAction }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STYLE[action]}`}>
      {LABEL[action]}
    </span>
  );
}