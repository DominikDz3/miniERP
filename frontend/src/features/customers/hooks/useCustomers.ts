import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '@/shared/services/apiClient';
import type {
    CustomerResponse, CustomerRequest, AddressResponse, 
    AddressRequest, Page, CustomerListParams
} from '../types/customer';


const keys = {
    all: ["customers"] as const,
    list: (params: CustomerListParams) => ["customers", "list", params] as const,
    detail: (id: number) => ["customers", "detail", id] as const,
    payers: (id: number) => ["customers", "payers", id] as const,
    receivers: (id: number) => ["customers", "receivers", id] as const,
};

function buildListQuery(p: CustomerListParams): string { 
    const q = new URLSearchParams();
    if (p.search) {
        q.set("search", p.search);
    }

    if (p.active !== undefined) {
        q.set("active", String(p.active));
    }
    q.set("page", String(p.page));
    q.set("size", String(p.size));
    if (p.sort) {
        q.set("sort", p.sort);
    }

    return q.toString();
}

export function useCustomers(params: CustomerListParams) {
    return useQuery ({
        queryKey: keys.list(params),
        queryFn: () => apiFetch<Page<CustomerResponse>>(`/customers?${buildListQuery(params)}`),
        placeholderData: keepPreviousData,
    });
}

export function useCustomer(id: number | null) {
    return useQuery({
        queryKey: keys.detail(id ?? -1),
        queryFn: () => apiFetch<CustomerResponse>(`/customers/${id}`),
        enabled: id != null,
    });
}

export function usePayerAddresses(id: number | null) {
    return useQuery({
        queryKey: keys.payers(id ?? -1),
        queryFn: () => apiFetch<AddressResponse[]>(`/customers/${id}/payer-addresses`),
        enabled: id != null,
    });
}

export function useReceiverAddresses(id: number | null) {
    return useQuery({
        queryKey: keys.receivers(id ?? -1),
        queryFn: () => apiFetch<AddressResponse[]>(`/customers/${id}/receiver-addresses`),
        enabled: id != null,
    });
}

export function useCreateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CustomerRequest) =>
            apiFetch<CustomerResponse>(`/customers`, {method: "POST", body: JSON.stringify(body) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, body}: {id: number; body: CustomerRequest }) =>
            apiFetch<CustomerResponse>(`/customers/${id}`, {method: "PUT", body: JSON.stringify(body) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all })
    });
}

export function useDeactivateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiFetch<void>(`/customers/${id}`, {method: "DELETE"}),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all}) ,
    });
}

export function useActivateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiFetch<void>(`/customers/${id}/activate`, { method: "PATCH"}),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useAddPayer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: {id: number; body: AddressRequest}) =>
            apiFetch<AddressResponse>(`/customers/${id}/payer-addresses`, {method: "POST", body: JSON.stringify(body) }),
        onSuccess: (_d) => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useAddReceiver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AddressRequest }) =>
      apiFetch<AddressResponse>(`/customers/${id}/receiver-addresses`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (_d) => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useSetDefaultPayer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, addressId }: { id: number; addressId: number }) =>
            apiFetch<void>(`/customers/${id}/default-payer/${addressId}`, { method: "PATCH" }),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useSetDefaultReceiver() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, addressId }: { id: number; addressId: number }) =>
            apiFetch<void>(`/customers/${id}/default-receiver/${addressId}`, { method: "PATCH" }),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

