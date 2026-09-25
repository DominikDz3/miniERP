export type AuditAction =
  | "LOGIN_SUCCESS" | "LOGIN_FAILED"
  | "CREATE" | "UPDATE" | "ACTIVATE" | "DEACTIVATE"
  | "STATUS_CHANGE" | "STOCK_MOVEMENT" | "PASSWORD_RESET";

export type AuditEntity =
  | "CUSTOMER" | "SUPPLIER" | "PRODUCT" | "WAREHOUSE"
  | "USER" | "SALES_ORDER" | "PURCHASE_ORDER";

export interface AuditLogResponse {
  id: number;
  action: AuditAction;
  entityType: AuditEntity | null;
  entityId: number | null;
  details: string | null;
  performedBy: string;
  createdAt: string;
}

export interface AuditListParams {
  action?: AuditAction | "";
  entityType?: AuditEntity | "";
  from?: string;
  to?: string;
  page: number;
  size: number;
  sort?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}