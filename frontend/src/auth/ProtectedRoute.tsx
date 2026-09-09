import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ requiredAuthority }: { requiredAuthority?: string }) {
    const { isAuthenticated, loading, hasAuthority } = useAuth();

    if (loading) return <div className = "p-6 text-gray-500">Ładowanie..</div>;
    if (!isAuthenticated) return <Navigate to="\login" replace />;
    if (requiredAuthority && !hasAuthority(requiredAuthority)) return <Navigate to="/403" replace />;
    return <Outlet />;
}
