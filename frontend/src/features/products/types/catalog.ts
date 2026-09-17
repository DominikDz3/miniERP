export interface CategoryResponse {
  id: number;
  name: string;
  active: boolean;
}

export interface CategoryRequest {
  name: string;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  categoryId: number;
  categoryName: string;
  warehouseId: number;
  warehouseName: string; 
  purchasePrice: number;
  salePrice: number;
  vatRate: number;
  unit: string;
  stock: number;
  minStock: number;
  active: boolean;
}

export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  warehouseId: number; 
  purchasePrice: number;
  salePrice: number;
  vatRate: number;
  unit: string;
  stock: number;
  minStock: number;
}

export interface PriceHistoryResponse {
  id: number;
  oldPurchasePrice: number | null;
  newPurchasePrice: number | null;
  oldSalePrice: number | null;
  newSalePrice: number | null;
  changedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProductListParams {
  search?: string;
  active?: boolean;
  categoryId?: number;
  warehouseId?: number;
  page: number;
  size: number;
  sort?: string;
}

export interface CategoryListParams {
  active?: boolean;
  page: number;
  size: number;
  sort?: string;
}