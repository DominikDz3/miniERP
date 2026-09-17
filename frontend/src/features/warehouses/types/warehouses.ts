export interface WarehouseResponse {
    id: number;
    name: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    active: boolean;
}

export interface WarehouseRequest {
    name: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country?: string;
}

export type MovementType = "PRZYJECIE" | "WYDANIE" | "PRZESUNIECIE";

export interface StockMovementResponse {
  id: number;
  productName: string | null;
  type: MovementType;
  quantity: number;
  warehouseName: string | null;
  targetWarehouseName: string | null;
  performedBy: string;
  createdAt: string;
}

export interface MovementParams {
  productId?: number;
  warehouseId?: number;
  type?: MovementType;
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
    size: number;
    number: number;
}

