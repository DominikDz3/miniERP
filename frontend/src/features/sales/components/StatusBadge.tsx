import type { SalesOrderStatus } from "../types/sales";

const STATUS_STYLE: Record<SalesOrderStatus, string> = {
  NEW:        "bg-gray-100 text-gray-700",
  CONFIRMED:  "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-800",
  READY:      "bg-orange-100 text-orange-800",
  COMPLETED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<SalesOrderStatus, string> = {
  NEW:        "Nowe",
  CONFIRMED:  "Potwierdzone",
  PROCESSING: "W realizacji",
  READY:      "Gotowe",
  COMPLETED:  "Zrealizowane",
  CANCELLED:  "Anulowane",
};

export function StatusBadge({ status }: { status: SalesOrderStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}