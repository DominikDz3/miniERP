import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type {
  SalesReportRow, PurchaseReportRow, TopProductRow, TopCustomerRow,
  MarginRow, WarehouseStockRow, WarehouseValueRow, LowStockRow, Granularity,
} from "../types/reports";

function dateQuery(from: string, to: string, extra?: Record<string, string>): string {
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  if (extra) Object.entries(extra).forEach(([k, v]) => q.set(k, v));
  return q.toString();
}

export function useSalesReport(from: string, to: string, granularity: Granularity) {
  return useQuery({
    queryKey: ["reports", "sales", from, to, granularity],
    queryFn: () => apiFetch<SalesReportRow[]>(`/reports/sales?${dateQuery(from, to, { granularity })}`),
  });
}

export function usePurchaseReport(from: string, to: string, granularity: Granularity) {
  return useQuery({
    queryKey: ["reports", "purchases", from, to, granularity],
    queryFn: () => apiFetch<PurchaseReportRow[]>(`/reports/purchases?${dateQuery(from, to, { granularity })}`),
  });
}

export function useTopProducts(from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "top-products", from, to],
    queryFn: () => apiFetch<TopProductRow[]>(`/reports/top-products?${dateQuery(from, to)}`),
  });
}

export function useTopCustomers(from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "top-customers", from, to],
    queryFn: () => apiFetch<TopCustomerRow[]>(`/reports/top-customers?${dateQuery(from, to)}`),
  });
}

export function useMargin(from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "margin", from, to],
    queryFn: () => apiFetch<MarginRow[]>(`/reports/margin?${dateQuery(from, to)}`),
  });
}

export function useStockLevels() {
  return useQuery({
    queryKey: ["reports", "stock-levels"],
    queryFn: () => apiFetch<WarehouseStockRow[]>(`/reports/stock-levels`),
  });
}

export function useWarehouseValue() {
  return useQuery({
    queryKey: ["reports", "warehouse-value"],
    queryFn: () => apiFetch<WarehouseValueRow[]>(`/reports/warehouse-value`),
  });
}

export function useBelowMinimum() {
  return useQuery({
    queryKey: ["reports", "below-minimum"],
    queryFn: () => apiFetch<LowStockRow[]>(`/reports/below-minimum`),
  });
}