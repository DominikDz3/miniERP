import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type { ProductResponse, Page } from "@/features/products/types/catalog";

export function useWarehouseProducts(warehouseId: number) {
  return useQuery({
    queryKey: ["warehouses", warehouseId, "products"],
    queryFn: () => {
      const q = new URLSearchParams({
        warehouseId: String(warehouseId),
        active: "true",
        page: "0",
        size: "1000",
      });
      return apiFetch<Page<ProductResponse>>(`/products?${q.toString()}`);
    },
    select: (page) => page.content, 
    enabled: Number.isFinite(warehouseId),
  });
}