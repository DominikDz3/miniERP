import { apiFetch } from "@/shared/services/apiClient";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupplierListParams, SupplierResponse, SupplierRequest, Page } from "../types/supplier";

const supplierKeys = {
    all: ["suppliers"] as const,
    list: (params: SupplierListParams) => ["suppliers", "list", params] as const,
    detail: (id: number) => ["suppliers", "detail", id] as const,
}

function buildSupplierQuery(p: SupplierListParams): string {
    const q = new URLSearchParams();
    if (p.search) q.set("search", p.search);
    if (p.active !== undefined) q.set("active", String(p.active));
    q.set("page", String(p.page));
    q.set("size", String(p.size));
    if (p.sort) q.set("sort", p.sort);
    return q.toString();
}

export function useSuppliers(params: SupplierListParams) {
    return useQuery({
        queryKey: supplierKeys.list(params),
        queryFn: () => apiFetch<Page<SupplierResponse>>(`/suppliers?${buildSupplierQuery(params)}`),
        placeholderData: keepPreviousData,
    });
}

export function useSupplier(id: number) {
    return useQuery({
        queryKey: supplierKeys.detail(id),
        queryFn: () => apiFetch<SupplierResponse>(`/suppliers/${id}`),
        enabled: Number.isFinite(id),
    });
}

export function useCreateSupplier() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: SupplierRequest) =>
            apiFetch<SupplierResponse>(`/suppliers`, {method: "POST", body: JSON.stringify(body)}),
        onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.all}),
    });
}

export function useUpdateSuppliers() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: SupplierRequest }) =>
            apiFetch<SupplierResponse>(`/suppliers/${id}`, {method: "PUT", body: JSON.stringify(body)}),
        onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.all}),
    });
}

export function useActivateSupplier() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            apiFetch<void>(`/suppliers/${id}/activate`, {method: "PATCH"}),
        onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.all}),
    });
}

export function useDeactivateSupplier() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            apiFetch<void>(`/suppliers/${id}`, {method: "DELETE"}),
        onSuccess: () => qc.invalidateQueries({ queryKey: supplierKeys.all}),
    });
}

