import {getToken, setToken} from "./auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
    status: number;
    detail: string;

    constructor(status: number, detail: string) {
        super(detail);
        this.status = status;
        this.detail = detail;
    }
}

async function tryRefresh(): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        return false;
    }
    const body = await res.json();
    setToken(body.token);
    return true;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
    const token = getToken();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);    
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    // Any 401 outside the auth endpoints means the access token didn't work.
    if (res.status === 401 && !path.startsWith("/auth/")) {
        if (retry) {
            const ok = await tryRefresh();
        if (ok) return apiFetch<T>(path, options, false);
        }
        setToken(null);
        window.location.href = "/login";
        throw new ApiError(401, "Unauthorized");
    }

    if (!res.ok) {
        let detail = res.statusText;
        try { detail = (await res.json()).detail ?? detail; } catch {}
        throw new ApiError(res.status, detail);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}
