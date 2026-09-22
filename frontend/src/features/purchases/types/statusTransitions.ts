import type { PurchaseOrderStatus } from "./purchase";

export const ALLOWED_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  NEW:       ["ORDERED", "CANCELLED"],
  ORDERED:   ["RECEIVED", "CANCELLED"],
  RECEIVED:  [],
  CANCELLED: [],
};

export const STATUS_ACTION_LABELS: Record<PurchaseOrderStatus, string> = {
  NEW:       "Nowe",
  ORDERED:   "Złóż zamówienie",
  RECEIVED:  "Przyjmij dostawę",
  CANCELLED: "Anuluj",
};

export const STATUS_ACTION_ENDPOINTS: Record<PurchaseOrderStatus, string> = {
  NEW:       "",
  ORDERED:   "order",
  RECEIVED:  "receive",
  CANCELLED: "cancel",
};