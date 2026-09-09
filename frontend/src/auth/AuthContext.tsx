import { createContext, useContext, useEffect, useState} from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/apiClient';
import { setToken, getAuthorities, getUsername } from '../lib/auth';

interface AuthState {
    isAuthenticated: boolean;
    loading: boolean;
    username: string | null;
    authorities: string[];
    hasAuthority: (a: string) => boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
interface LoginResponse { token: string; }

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
        try {
            const res = await apiFetch<LoginResponse>('/auth/refresh', { method: 'POST' });
            setToken(res.token);
            setTokenState(res.token);
        } catch {
            setToken(null);
            setTokenState(null);
        } finally {
            setLoading(false);
        }
    })();
    }, []);

    const login = async (username: string, password: string) => {
        const res = await apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setToken(res.token);
        setTokenState(res.token);
    };

    const logout = async () => {
        try { await apiFetch<void>('/auth/logout', { method: 'POST' }); } catch {}
        setToken(null);
        setTokenState(null);
    };

    const authorities = token ? getAuthorities(token) : [];

    const value: AuthState = {
        isAuthenticated: !!token,
        loading,
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


