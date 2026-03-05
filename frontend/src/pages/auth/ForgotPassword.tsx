import { Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../../features/auth/components/ForgotPasswordForm';

export const ForgotPassword = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-echo-gold/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-md w-full space-y-8 bg-black/40 p-8 sm:p-10 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl relative z-10">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
                        Mot de passe oublié
                    </h2>
                </div>

                <div className="mt-8">
                    <ForgotPasswordForm />
                </div>

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
