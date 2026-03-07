import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { useAuthStore } from '../store';
import { AuthPrompt } from './AuthPrompt';
import { Button } from '../../../components/ui/Button';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, user, checkSession } = useAuthStore();
    const navigate = useNavigate();

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
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4">
                <div className="max-w-md w-full text-center space-y-6 bg-black/40 p-8 sm:p-10 rounded-2xl border border-red-500/20 backdrop-blur-md shadow-2xl">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Accès refusé</h2>
                    <p className="text-echo-textMuted text-base">
                        Cette section est réservée aux administrateurs.
                        Vous n'avez pas les permissions nécessaires pour y accéder.
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline">
                        Retour à l'accueil
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
