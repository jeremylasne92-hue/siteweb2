import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store';

export const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError("L'authentification a échoué. Veuillez réessayer.");
            setTimeout(() => navigate('/login?error=' + errorParam, { replace: true }), 2000);
            return;
        }

        // The token is now stored in an httpOnly cookie by the backend.
        // We call /api/auth/me to verify the session and get user info.
        const verifySession = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
                const response = await fetch(`${apiUrl}/auth/me`, {
                    credentials: 'include', // Send cookies along
                });

                if (response.ok) {
                    const userData = await response.json();
                    // Store a session indicator (not the actual JWT, which stays httpOnly)
                    setUser(userData);
                    navigate('/', { replace: true });
                } else {
                    setError("Session invalide. Veuillez réessayer.");
                    setTimeout(() => navigate('/login?error=session_invalid', { replace: true }), 2000);
                }
            } catch {
                setError("Erreur de connexion au serveur.");
                setTimeout(() => navigate('/login?error=network', { replace: true }), 2000);
            }
        };

        verifySession();
    }, [searchParams, navigate, setUser]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="relative">
                <div className="absolute inset-0 bg-echo-gold/20 rounded-full blur-xl animate-pulse"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-echo-gold relative z-10"></div>
            </div>
            {error ? (
                <>
                    <h2 className="mt-8 text-2xl font-bold text-red-400 tracking-tight">Erreur</h2>
                    <p className="mt-2 text-echo-textMuted text-lg">{error}</p>
                </>
            ) : (
                <>
                    <h2 className="mt-8 text-2xl font-bold text-white tracking-tight">Authentification réussie</h2>
                    <p className="mt-2 text-echo-textMuted text-lg">Préparation de votre espace sécurisé...</p>
                </>
            )}
        </div>
    );
};
