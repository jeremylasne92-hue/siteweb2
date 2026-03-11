import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ResetPasswordForm } from '../../features/auth/components/ResetPasswordForm';
import { API_URL } from '../../config/api';

export const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setTimeout(() => {
                setStatus('invalid');
                setErrorMessage('Lien de réinitialisation invalide.');
            }, 0);
            return;
        }

        // Verify token on mount
        fetch(`${API_URL}/auth/reset-password/${token}`)
            .then(res => {
                if (res.ok) {
                    setStatus('valid');
                } else {
                    return res.json().then(data => {
                        setStatus('invalid');
                        setErrorMessage(data.detail || 'Lien invalide ou expiré.');
                    });
                }
            })
            .catch(() => {
                setStatus('invalid');
                setErrorMessage('Erreur de connexion au serveur.');
            });
    }, [token]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-echo-gold/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-md w-full space-y-8 bg-black/40 p-8 sm:p-10 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl relative z-10">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="w-8 h-8 text-echo-gold animate-spin" />
                        <p className="text-echo-textMuted">Vérification du lien...</p>
                    </div>
                )}

                {status === 'valid' && token && (
                    <>
                        <div>
                            <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
                                Nouveau mot de passe
                            </h2>
                            <p className="mt-4 text-center text-sm text-echo-textMuted">
                                Choisissez un mot de passe sécurisé pour votre compte.
                            </p>
                        </div>
                        <div className="mt-8">
                            <ResetPasswordForm token={token} />
                        </div>
                    </>
                )}

                {status === 'invalid' && (
                    <div className="text-center space-y-4 py-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Lien invalide</h3>
                        <p className="text-sm text-echo-textMuted">{errorMessage}</p>
                        <Link
                            to="/forgot-password"
                            className="inline-block mt-4 text-echo-gold hover:underline font-medium text-sm"
                        >
                            Demander un nouveau lien →
                        </Link>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-center text-sm text-echo-textMuted">
                        <Link to="/login" className="text-echo-gold hover:underline font-medium">
                            ← Retour à la connexion
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
