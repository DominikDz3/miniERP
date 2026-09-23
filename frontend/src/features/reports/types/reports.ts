export type Granularity = "day" | "week" | "month";

export interface SalesReportRow {
  period: string;       
  ordersCount: number;
  totalNet: number;
  totalGross: number;
}

export interface PurchaseReportRow {
  period: string;
  ordersCount: number;
  totalNet: number;
  totalGross: number;
}

export interface TopProductRow {
  productId: number;
  sku: string;
  productName: string;
  totalQuantity: number;
  totalNet: number;
}

export interface TopCustomerRow {
  customerId: number;
  customerName: string;
  ordersCount: number;
  totalGross: number;
}

export interface MarginRow {
  productId: number;
  sku: string;
  productName: string;
  revenue: number;
  cost: number;
  margin: number;
}

export interface WarehouseStockRow {
  productId: number;
  sku: string;
  productName: string;
  warehouseName: string;
  stock: number;
  stockValue: number;
}

export interface WarehouseValueRow {
  warehouseId: number;
  warehouseName: string;
  value: number;
}

export interface LowStockRow {
  productId: number;
  sku: string;
  productName: string;
  stock: number;
  minStock: number;
  warehouseId: number;
  warehouseName: string;
}