import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ requiredAuthority }: { requiredAuthority?: string }) {
    const { isAuthenticated, hasAuthority } = useAuth();

    if (!isAuthenticated) return <Navigate to="\login" replace />;
    if (requiredAuthority && !hasAuthority(requiredAuthority)) return <Navigate to="/403" replace />;
    return <Outlet />;
}
