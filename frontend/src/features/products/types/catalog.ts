export type VatRate = "VAT_23" | "VAT_8" | "VAT_5" | "VAT_0";

export const VAT_LABEL: Record<VatRate, string> = {
  VAT_23: "23%", VAT_8: "8%", VAT_5: "5%", VAT_0: "0%",
};

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
  vatRate: VatRate;
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
  vatRate: VatRate;
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