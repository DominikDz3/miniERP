export type SalesOrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface SalesOrderResponse {
  id: number;
  customerId: number;
  customerName: string;
  receiverAddressId: number;
  receiverAddress: string;
  status: SalesOrderStatus;
  totalNet: number;    
  totalVat: number;
  totalGross: number;
  createdBy: string;
  createdAt: string;    
}

export interface SalesOrderItemResponse {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  lineNet: number;
}

export interface SalesOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface SalesOrderRequest {
  customerId: number;
  receiverAddressId: number;
  items: SalesOrderItemRequest[];
}

export interface SalesOrderListParams {
  customerId?: number;
  status?: SalesOrderStatus;
  from?: string;  
  to?: string;
  page: number;
  size: number;
  sort?: string;
}

export interface StatusHistoryResponse {
  id: number;
  fromStatus: SalesOrderStatus | null;
  toStatus: SalesOrderStatus;
  changedBy: string;
  changedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}