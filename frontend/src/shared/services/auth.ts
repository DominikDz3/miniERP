import {jwtDecode} from "jwt-decode";

const TOKEN_KEY = "erp_token";

interface JwtPayload {
    sub: string;
    authorities: string[];
    exp: number;
    iat: number;
}

export function getToken() : string | null {
    return localStorage.getItem(TOKEN_KEY);;
}

export function setToken(token: string | null) : void {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

export function isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const p = decode(token);
    return !!p && p.exp * 1000 > Date.now();
}

export function decode(token: string): JwtPayload | null {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        return null;
    }
}

export function getUsername(token: string): string | null {
    return decode(token)?.sub || null;
}

export function getAuthorities(token: string): string[] {
    return decode(token)?.authorities ?? [];
}
