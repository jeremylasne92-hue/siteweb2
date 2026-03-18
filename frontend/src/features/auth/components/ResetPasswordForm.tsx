import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useResetPassword } from '../api/useResetPassword';
import { resetPasswordSchema, type ResetPasswordFormData, getPasswordStrength, strengthLabels } from '../schemas';
import { PasswordRequirements } from './PasswordRequirements';

interface ResetPasswordFormProps {
    token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const navigate = useNavigate();
    const resetMutation = useResetPassword();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            password_confirm: '',
        },
        mode: 'onChange',
    });

    const passwordValue = watch('password');
    const strength = passwordValue ? getPasswordStrength(passwordValue) : null;

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            await resetMutation.mutateAsync({
                token,
                password: data.password,
                password_confirm: data.password_confirm,
            });
            setTimeout(() => navigate('/login?reset=true'), 2000);
        } catch {
            // Error handled by mutation state
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
                <Input
                    label="Nouveau mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 caractères"
                    error={errors.password?.message}
                    {...register('password')}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-echo-textMuted hover:text-white transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* Password strength indicator */}
            {strength && (
                <div className="space-y-1.5">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: level <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-echo-textMuted">
                        Force : <span style={{ color: strength.color }}>{strengthLabels[strength.label]}</span>
                    </p>
                </div>
            )}

            <PasswordRequirements password={passwordValue || ''} />

            <div className="relative">
                <Input
                    label="Confirmer le mot de passe"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Retapez votre mot de passe"
                    error={errors.password_confirm?.message}
                    {...register('password_confirm')}
                />
                <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-[34px] text-echo-textMuted hover:text-white transition-colors"
                    tabIndex={-1}
                >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {resetMutation.isError && (
                <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {resetMutation.error?.message}
                </p>
            )}

            {resetMutation.isSuccess && (
                <p className="text-sm text-green-400 font-medium text-center bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    ✅ Mot de passe réinitialisé ! Redirection...
                </p>
            )}

            <Button
                type="submit"
                disabled={isSubmitting || resetMutation.isPending || resetMutation.isSuccess}
                isLoading={resetMutation.isPending}
                className="w-full py-6 text-base"
            >
                {resetMutation.isPending ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Réinitialisation...
                    </span>
                ) : (
                    "Réinitialiser mon mot de passe"
                )}
            </Button>
        </form>
    );
};
