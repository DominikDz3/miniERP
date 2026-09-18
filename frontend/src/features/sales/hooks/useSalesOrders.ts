import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type {
  SalesOrderResponse, SalesOrderItemResponse,
  SalesOrderRequest, SalesOrderListParams, SalesOrderStatus, StatusHistoryResponse, Page,
} from "../types/sales";
import { STATUS_ACTION_ENDPOINTS } from "../types/statusTransitions";

const keys = {
  all: ["sales-orders"] as const,
  list: (params: SalesOrderListParams) => ["sales-orders", "list", params] as const,
  detail: (id: number) => ["sales-orders", "detail", id] as const,
  items: (id: number) => ["sales-orders", "detail", id, "items"] as const,
};

function buildQuery(p: SalesOrderListParams): string {
  const q = new URLSearchParams();
  if (p.customerId !== undefined) q.set("customerId", String(p.customerId));
  if (p.status) q.set("status", p.status);
  if (p.from) q.set("from", p.from);
  if (p.to) q.set("to", p.to);
  q.set("page", String(p.page));
  q.set("size", String(p.size));
  if (p.sort) q.set("sort", p.sort);
  return q.toString();
}

export function useSalesOrders(params: SalesOrderListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => apiFetch<Page<SalesOrderResponse>>(`/sales-orders?${buildQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useSalesOrder(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => apiFetch<SalesOrderResponse>(`/sales-orders/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function useSalesOrderItems(id: number) {
  return useQuery({
    queryKey: keys.items(id),
    queryFn: () => apiFetch<SalesOrderItemResponse[]>(`/sales-orders/${id}/items`),
    enabled: Number.isFinite(id),
  });
}

// mutations

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SalesOrderRequest) =>
      apiFetch<SalesOrderResponse>(`/sales-orders`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useSalesOrderTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, target }: { id: number; target: SalesOrderStatus }) =>
      apiFetch<void>(`/sales-orders/${id}/${STATUS_ACTION_ENDPOINTS[target]}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useSalesOrderHistory(id: number) {
  return useQuery({
    queryKey: ["sales-orders", "detail", id, "history"],
    queryFn: () => apiFetch<StatusHistoryResponse[]>(`/sales-orders/${id}/history`),
    enabled: Number.isFinite(id),
  });
}