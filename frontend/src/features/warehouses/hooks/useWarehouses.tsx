import { apiFetch } from "@/shared/services/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { WarehouseResponse, Page, WarehouseRequest } from "../types/warehouses";

const warehousesKeys = {
    all: ["warehouses"] as const,
    detail: (id: number) => ["warehouses", "detail", id] as const,
};

export function useActiveWarehouses(active: boolean | undefined = true) {
    return useQuery({
        queryKey: ["warehouses", "list", active],
        queryFn: () => apiFetch<Page<WarehouseResponse>>(`/warehouses?active=true&page=0&size=100`),
        select: (page) => page.content,
    });
}

export function useWarehouse(id: number) {
    return useQuery({
        queryKey: warehousesKeys.detail(id),
        queryFn: () => apiFetch<WarehouseResponse>(`/warehouses/${id}`),
        enabled: Number.isFinite(id),
    });
}

export function useCreateWarehouse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: WarehouseRequest) => 
            apiFetch<WarehouseResponse>(`/warehouses`, { method: "POST", body: JSON.stringify(body) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: warehousesKeys.all }),
    });
}

export function useActivateWarehouse() {
    const qc = useQueryClient();
    return useMutation ({
        mutationFn: (id: number) => apiFetch<void>(`/warehouses/${id}/activate`, { method: "PATCH" }),
        onSuccess: () => qc.invalidateQueries({ queryKey: warehousesKeys.all})
    })
}

export function useDeactivateWarehouse() {
    const qc = useQueryClient();
    return useMutation ({
        mutationFn: (id: number) => apiFetch<void>(`/warehouses/${id}`, { method: "DELETE" }),
        onSuccess: () => qc.invalidateQueries({ queryKey: warehousesKeys.all }),
    });
}

