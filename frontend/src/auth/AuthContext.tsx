import { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/apiClient';
import { getToken, setToken, isTokenValid, getAuthorities, getUsername } from '../lib/auth';

interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
    authorities: string[];
    hasAuthority: (a: string) => boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
interface LoginResponse { token: string; }

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(() => {
        const t = getToken();
        return isTokenValid(t) ? t : null;
    });

    const applyToken = (t: string | null) => {
        setToken(t);       
        setTokenState(t);   
    };

    const login = async (username: string, password: string) => {
        const res = await apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        applyToken(res.token);
    };

    const logout = async () => {
        try { await apiFetch<void>('/auth/logout', { method: 'POST' }); } catch {}
        setToken(null);
        setTokenState(null);
    };

    const authorities = token ? getAuthorities(token) : [];

    const value: AuthState = {
        isAuthenticated: !!token,
        username: token ? getUsername(token) : null,
        authorities,
        hasAuthority: (a) => authorities.includes(a),
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}


