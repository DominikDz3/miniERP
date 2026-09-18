import type { SalesOrderStatus } from "./sales";

export const ALLOWED_TRANSITIONS: Record<SalesOrderStatus, SalesOrderStatus[]> = {
  NEW:        ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PROCESSING", "CANCELLED"],
  PROCESSING: ["READY", "CANCELLED"],
  READY:      ["COMPLETED", "CANCELLED"],
  COMPLETED:  [],
  CANCELLED:  [],
};

export const STATUS_ACTION_LABELS: Record<SalesOrderStatus, string> = {
  NEW:        "Nowe",
  CONFIRMED:  "Potwierdź",
  PROCESSING: "Rozpocznij realizację",
  READY:      "Gotowe do wydania",
  COMPLETED:  "Zrealizuj (wydaj)",
  CANCELLED:  "Anuluj",
};

export const STATUS_ACTION_ENDPOINTS: Record<SalesOrderStatus, string> = {
  NEW:        "",
  CONFIRMED:  "confirm",
  PROCESSING: "process",
  READY:      "ready",
  COMPLETED:  "complete",
  CANCELLED:  "cancel",
};