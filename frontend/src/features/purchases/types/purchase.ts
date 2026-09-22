import type { VatRate } from "@/features/products/types/catalog";

export type PurchaseOrderStatus = "NEW" | "ORDERED" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrderResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  status: PurchaseOrderStatus;
  totalNet: number;
  totalVat: number;
  totalGross: number;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseOrderItemResponse {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  vatRate: VatRate;
  lineNet: number;
}

export interface StatusHistoryResponse {
  id: number;
  fromStatus: PurchaseOrderStatus | null;
  toStatus: PurchaseOrderStatus;
  changedBy: string;
  changedAt: string;
}

export interface PurchaseOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  warehouseId: number;
  items: PurchaseOrderItemRequest[];
}

export interface PurchaseOrderListParams {
  supplierId?: number;
  status?: PurchaseOrderStatus;
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