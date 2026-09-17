import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type {
  CategoryResponse, CategoryRequest, CategoryListParams,
  ProductResponse, ProductRequest, ProductListParams,
  PriceHistoryResponse, Page,
} from "../types/catalog";

const categoryKeys = {
  all: ["categories"] as const,
  list: (params: CategoryListParams) => ["categories", "list", params] as const,
};

function buildCategoryQuery(p: CategoryListParams): string {
  const q = new URLSearchParams();
  if (p.active !== undefined) q.set("active", String(p.active));
  q.set("page", String(p.page));
  q.set("size", String(p.size));
  if (p.sort) q.set("sort", p.sort);
  return q.toString();
}

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => apiFetch<Page<CategoryResponse>>(`/categories?${buildCategoryQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useActiveCategories() {
  return useQuery({
    queryKey: ["categories", "active-all"],
    queryFn: () => apiFetch<Page<CategoryResponse>>(`/categories?active=true&page=0&size=1000`),
    select: (page) => page.content,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryRequest) =>
      apiFetch<CategoryResponse>(`/categories`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CategoryRequest }) =>
      apiFetch<CategoryResponse>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeactivateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

// Products

const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams) => ["products", "list", params] as const,
  detail: (id: number) => ["products", "detail", id] as const,
  priceHistory: (id: number) => ["products", "price-history", id] as const,
};

function buildProductQuery(p: ProductListParams): string {
  const q = new URLSearchParams();
  if (p.search) q.set("search", p.search);
  if (p.active !== undefined) q.set("active", String(p.active));
  if (p.categoryId !== undefined) q.set("categoryId", String(p.categoryId));
  if (p.warehouseId !== undefined) q.set("warehouseId", String(p.warehouseId));
  q.set("page", String(p.page));
  q.set("size", String(p.size));
  if (p.sort) q.set("sort", p.sort);
  return q.toString();
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => apiFetch<Page<ProductResponse>>(`/products?${buildProductQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiFetch<ProductResponse>(`/products/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function useProductPriceHistory(id: number) {
  return useQuery({
    queryKey: productKeys.priceHistory(id),
    queryFn: () => apiFetch<Page<PriceHistoryResponse>>(`/products/${id}/price-history`),
    select: (page) => page.content,
    enabled: Number.isFinite(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductRequest) =>
      apiFetch<ProductResponse>(`/products`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductRequest }) =>
      apiFetch<ProductResponse>(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useActivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/products/${id}/activate`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

// warehouse operations

export function useReceiveStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { productId: number; quantity: number}[]) =>
      apiFetch<void>(`/products/receive`, { method: "POST", body: JSON.stringify({ items }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useIssueStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { productId: number; quantity: number }[]) =>
      apiFetch<ProductResponse>(`/products/issue`, { method: "POST", body: JSON.stringify({ items }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useTransferProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity, targetWarehouseId }: { id: number; quantity: number; targetWarehouseId: number }) =>
      apiFetch<void>(`/products/${id}/transfer`, { method: "POST", body: JSON.stringify({ quantity, targetWarehouseId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

