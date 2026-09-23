import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type { DashboardSummary } from "../types/dashboard";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiFetch<DashboardSummary>("/dashboard/summary"),
  });
}