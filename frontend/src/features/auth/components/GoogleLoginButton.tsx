import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';

const loginSchema = z.object({
    ageConsent: z.boolean().refine((val) => val === true, {
        message: "Vous devez certifier avoir plus de 15 ans",
    }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const GoogleLoginButton = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            ageConsent: false,
        },
        mode: 'onChange',
    });

    const onSubmit = () => {
        // Redirection vers le backend pour l'authentification Google
        const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        window.location.assign(`${backendUrl}/auth/google/login`);
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Button
                    type="submit"
                    disabled={!isValid}
                    className="w-full flex items-center justify-center space-x-3 py-6 text-base bg-white text-gray-900 hover:bg-gray-100 shadow-xl"
                    variant="secondary"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="font-semibold text-gray-900">Continuer avec Google</span>
                </Button>

                <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                    <div className="flex items-center h-5 mt-0.5">
                        <input
                            id="ageConsent"
                            type="checkbox"
                            className="w-4 h-4 text-echo-gold bg-transparent border-white/40 rounded focus:ring-echo-gold focus:ring-2 cursor-pointer"
                            {...register('ageConsent')}
                        />
                    </div>
                    <div className="text-sm">
                        <label htmlFor="ageConsent" className="font-medium text-white cursor-pointer select-none">
                            Je certifie avoir plus de 15 ans
                        </label>
                        <p className="text-echo-textMuted mt-1 text-xs sm:text-sm">
                            Consentement requis pour rejoindre l'interface membre.
                        </p>
                    </div>
                </div>

                {errors.ageConsent && (
                    <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {errors.ageConsent.message}
                    </p>
                )}
            </form>
        </div>
    );
};
