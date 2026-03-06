import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store';
import { AuthPrompt } from './AuthPrompt';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, user, checkSession } = useAuthStore();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-echo-gold animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AuthPrompt />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <AuthPrompt />;
    }

    return <>{children}</>;
};
