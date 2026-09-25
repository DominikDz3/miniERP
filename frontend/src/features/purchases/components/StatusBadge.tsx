import type { PurchaseOrderStatus } from "../types/purchase";

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  NEW:       "bg-gray-100 text-gray-700",
  ORDERED:   "bg-blue-50 text-blue-700",
  RECEIVED:  "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const DOT_STYLE: Record<PurchaseOrderStatus, string> = {
  NEW:       "bg-gray-400",
  ORDERED:   "bg-blue-500",
  RECEIVED:  "bg-green-500",
  CANCELLED: "bg-red-500",
};

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  NEW:       "Nowe",
  ORDERED:   "Zamówione",
  RECEIVED:  "Przyjęte",
  CANCELLED: "Anulowane",
};

export function StatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLE[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}