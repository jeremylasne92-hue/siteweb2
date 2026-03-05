import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useForgotPassword } from '../api/useForgotPassword';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas';

export const ForgotPasswordForm = () => {
    const forgotMutation = useForgotPassword();
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
        mode: 'onSubmit',
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await forgotMutation.mutateAsync(data);
            setSubmitted(true);
        } catch {
            // Error handled by mutation state
        }
    };

    if (submitted) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-echo-gold/20 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-echo-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white">Email envoyé</h3>
                <p className="text-sm text-echo-textMuted leading-relaxed">
                    Si un compte est associé à cette adresse, vous recevrez un email avec un lien
                    de réinitialisation. Vérifiez également vos spams.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <p className="text-sm text-echo-textMuted">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <Input
                label="Adresse email"
                type="email"
                placeholder="votre@email.com"
                error={errors.email?.message}
                {...register('email')}
            />

            {forgotMutation.isError && (
                <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {forgotMutation.error?.message}
                </p>
            )}

            <Button
                type="submit"
                disabled={isSubmitting || forgotMutation.isPending}
                isLoading={forgotMutation.isPending}
                className="w-full py-6 text-base"
            >
                {forgotMutation.isPending ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Envoi en cours...
                    </span>
                ) : (
                    "Envoyer le lien"
                )}
            </Button>
        </form>
    );
};
