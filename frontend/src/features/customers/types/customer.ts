export interface AddressResponse {
    id: number;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
}

export interface CustomerResponse {
    id: number;
    name: string;
    nip: string | null;
    email: string;
    active: boolean;
    createdAt: string;
    defaultPayerId: number | null;
    defaultReceiverId: number | null;
}

export interface AddressRequest {
    street: string;
    city: string;
    postalCode: string;
    country?: string;
    phone?: string;
}

export interface CustomerRequest {
    name: string;
    nip?: string;
    email: string;
    payerAddresses: AddressRequest[];
    receiverAddresses: AddressRequest[];
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface CustomerListParams {
    search?: string;
    active?: boolean;
    page: number;
    size: number;
    sort?: string;
}
