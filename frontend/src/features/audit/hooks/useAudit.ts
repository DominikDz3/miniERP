import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type { AuditLogResponse, AuditListParams, Page } from "../types/audit";

function buildQuery(p: AuditListParams): string {
  const q = new URLSearchParams();
  if (p.action) q.set("action", p.action);
  if (p.entityType) q.set("entityType", p.entityType);
  if (p.from) q.set("from", p.from);
  if (p.to) q.set("to", p.to);
  q.set("page", String(p.page));
  q.set("size", String(p.size));
  if (p.sort) q.set("sort", p.sort);
  return q.toString();
}

export function useAuditLog(params: AuditListParams) {
  return useQuery({
    queryKey: ["audit", "list", params],
    queryFn: () => apiFetch<Page<AuditLogResponse>>(`/audit?${buildQuery(params)}`),
    placeholderData: keepPreviousData,
  });
}