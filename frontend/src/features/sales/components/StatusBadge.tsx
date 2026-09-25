import type { SalesOrderStatus } from "../types/sales";

const STATUS_STYLE: Record<SalesOrderStatus, string> = {
  NEW:        "bg-gray-100 text-gray-700",
  CONFIRMED:  "bg-blue-50 text-blue-700",
  PROCESSING: "bg-yellow-50 text-yellow-800",
  READY:      "bg-orange-50 text-orange-700",
  COMPLETED:  "bg-green-50 text-green-700",
  CANCELLED:  "bg-red-50 text-red-700",
};

const DOT_STYLE: Record<SalesOrderStatus, string> = {
  NEW:        "bg-gray-400",
  CONFIRMED:  "bg-blue-500",
  PROCESSING: "bg-yellow-500",
  READY:      "bg-orange-500",
  COMPLETED:  "bg-green-500",
  CANCELLED:  "bg-red-500",
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
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLE[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}