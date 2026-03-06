import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { GoogleLoginButton } from '../../features/auth/components/GoogleLoginButton';
import { EmailLoginForm } from '../../features/auth/components/EmailLoginForm';

type AuthTab = 'google' | 'email';

export const Login = () => {
    const [activeTab, setActiveTab] = useState<AuthTab>('google');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const justRegistered = searchParams.get('registered') === 'true';
    const justReset = searchParams.get('reset') === 'true';

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-echo-gold/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-md w-full space-y-8 bg-black/40 p-8 sm:p-10 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    aria-label="Fermer"
                    className="absolute top-4 right-4 text-echo-textMuted hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-tight">
                        Accéder à l'Espace
                    </h2>
                    <p className="mt-4 text-center text-base text-echo-textMuted">
                        Connectez-vous pour rejoindre le mouvement.
                    </p>
                </div>

                {/* Success banner after registration */}
                {justRegistered && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <p className="text-sm text-green-400 font-medium text-center">
                            Compte créé avec succès ! Connectez-vous maintenant.
                        </p>
                    </div>
                )}

                {/* Success banner after password reset */}
                {justReset && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <p className="text-sm text-green-400 font-medium text-center">
                            Mot de passe réinitialisé ! Connectez-vous avec votre nouveau mot de passe.
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex rounded-lg bg-white/5 p-1 border border-white/10">
                    <button
                        type="button"
                        onClick={() => setActiveTab('google')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'google'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-echo-textMuted hover:text-white'
                            }`}
                    >
                        Google
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('email')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'email'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-echo-textMuted hover:text-white'
                            }`}
                    >
                        Email
                    </button>
                </div>

                <div className="mt-6 space-y-6">
                    {activeTab === 'google' ? (
                        <GoogleLoginButton />
                    ) : (
                        <EmailLoginForm />
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                    <p className="text-center text-sm text-echo-textMuted">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="text-echo-gold hover:underline font-medium">
                            Créer un compte
                        </Link>
                    </p>
                    <p className="text-center text-xs text-echo-textMuted/70">
                        En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                    </p>
                </div>
            </div>
        </div>
    );
};
