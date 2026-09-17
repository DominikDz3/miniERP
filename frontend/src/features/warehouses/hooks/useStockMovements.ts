import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type { StockMovementResponse, MovementParams, Page } from "@/features/warehouses/types/warehouses";

function buildQuery(p: MovementParams): string {
  const q = new URLSearchParams();
  if (p.productId !== undefined) q.set("productId", String(p.productId));
  if (p.warehouseId !== undefined) q.set("warehouseId", String(p.warehouseId));
  if (p.type) q.set("type", p.type);
  if (p.from) q.set("from", p.from);
  if (p.to) q.set("to", p.to);
  q.set("page", String(p.page));
  q.set("size", String(p.size));
  if (p.sort) q.set("sort", p.sort);
  return q.toString();
}

export function useStockMovements(params: MovementParams) {
  return useQuery({
    queryKey: ["stock-movements", params],
    queryFn: () => apiFetch<Page<StockMovementResponse>>(`/stock-movements?${buildQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}