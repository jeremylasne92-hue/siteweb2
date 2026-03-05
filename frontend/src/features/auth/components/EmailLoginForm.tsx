import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useLogin } from '../api/useLogin';
import { loginSchema, type LoginFormData } from '../schemas';

export const EmailLoginForm = () => {
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
        mode: 'onSubmit',
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await loginMutation.mutateAsync(data);
            navigate('/');
        } catch {
            // Error handled by mutation state
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
                label="Email ou nom d'utilisateur"
                placeholder="ex: john@example.com"
                error={errors.identifier?.message}
                {...register('identifier')}
            />

            <div className="relative">
                <Input
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
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

            <div className="flex justify-end">
                <Link
                    to="/forgot-password"
                    className="text-xs text-echo-textMuted hover:text-echo-gold transition-colors"
                >
                    Mot de passe oublié ?
                </Link>
            </div>

            {/* Server error */}
            {loginMutation.isError && (
                <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {loginMutation.error?.message}
                </p>
            )}

            <Button
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
                isLoading={loginMutation.isPending}
                className="w-full py-6 text-base"
            >
                {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Connexion...
                    </span>
                ) : (
                    "Se connecter"
                )}
            </Button>
        </form>
    );
};
