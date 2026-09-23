import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/services/apiClient";
import type {
  UserResponse, UserCreateRequest, UserUpdateRequest, PasswordResetRequest,
} from "../types/user";

const keys = {
  all: ["users"] as const,
  detail: (id: number) => ["users", "detail", id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: keys.all,
    queryFn: () => apiFetch<UserResponse[]>("/users"),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserCreateRequest) =>
      apiFetch<UserResponse>("/users", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UserUpdateRequest }) =>
      apiFetch<UserResponse>(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PasswordResetRequest }) =>
      apiFetch<void>(`/users/${id}/password`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/users/${id}/activate`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/users/${id}/deactivate`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}