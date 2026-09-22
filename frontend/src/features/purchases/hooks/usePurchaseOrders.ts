import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type {
  PurchaseOrderResponse, PurchaseOrderItemResponse, StatusHistoryResponse,
  PurchaseOrderRequest, PurchaseOrderListParams, PurchaseOrderStatus, Page,
} from "../types/purchase";
import { STATUS_ACTION_ENDPOINTS } from "../types/statusTransitions";

const keys = {
  all: ["purchase-orders"] as const,
  list: (params: PurchaseOrderListParams) => ["purchase-orders", "list", params] as const,
  detail: (id: number) => ["purchase-orders", "detail", id] as const,
  items: (id: number) => ["purchase-orders", "detail", id, "items"] as const,
  history: (id: number) => ["purchase-orders", "detail", id, "history"] as const,
};

function buildQuery(p: PurchaseOrderListParams): string {
  const q = new URLSearchParams();
  if (p.supplierId !== undefined) q.set("supplierId", String(p.supplierId));
  if (p.status) q.set("status", p.status);
  if (p.from) q.set("from", p.from);
  if (p.to) q.set("to", p.to);
  q.set("page", String(p.page));
  q.set("size", String(p.size));
  if (p.sort) q.set("sort", p.sort);
  return q.toString();
}

export function usePurchaseOrders(params: PurchaseOrderListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => apiFetch<Page<PurchaseOrderResponse>>(`/purchase-orders?${buildQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => apiFetch<PurchaseOrderResponse>(`/purchase-orders/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function usePurchaseOrderItems(id: number) {
  return useQuery({
    queryKey: keys.items(id),
    queryFn: () => apiFetch<PurchaseOrderItemResponse[]>(`/purchase-orders/${id}/items`),
    enabled: Number.isFinite(id),
  });
}

export function usePurchaseOrderHistory(id: number) {
  return useQuery({
    queryKey: keys.history(id),
    queryFn: () => apiFetch<StatusHistoryResponse[]>(`/purchase-orders/${id}/history`),
    enabled: Number.isFinite(id),
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PurchaseOrderRequest) =>
      apiFetch<PurchaseOrderResponse>(`/purchase-orders`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function usePurchaseOrderTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, target }: { id: number; target: PurchaseOrderStatus }) =>
      apiFetch<void>(`/purchase-orders/${id}/${STATUS_ACTION_ENDPOINTS[target]}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}