export interface SupplierResponse {
    id: number;
    name: string;
    nip: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country: string; 
    active: boolean;
    createdAt: string;
}

export interface SupplierRequest {
    name: string;
    nip: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country?: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface SupplierListParams {
    search?: string;
    active?: boolean;
    page: number;
    size: number;
    sort?: string;
}

