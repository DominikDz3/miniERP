import type { PurchaseOrderStatus } from "../types/purchase";

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  NEW:       "bg-gray-100 text-gray-700",
  ORDERED:   "bg-blue-100 text-blue-700",
  RECEIVED:  "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  NEW:       "Nowe",
  ORDERED:   "Zamówione",
  RECEIVED:  "Przyjęte",
  CANCELLED: "Anulowane",
};

export function StatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}