import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StepProgress } from '../../../components/ui/StepProgress';
import { useRegister } from '../api/useRegister';
import { registerSchema, type RegisterFormData, getPasswordStrength, strengthLabels } from '../schemas';

export const RegisterForm = () => {
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            password_confirm: '',
            age_consent: false,
            rgpd_consent: false,
        },
        mode: 'onChange',
    });

    const passwordValue = watch('password');
    const strength = passwordValue ? getPasswordStrength(passwordValue) : null;

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerMutation.mutateAsync(data);
            navigate('/login?registered=true');
        } catch {
            // Error handled by mutation state
        }
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof RegisterFormData)[] = [];
        if (step === 1) fieldsToValidate = ['username', 'email'];
        if (step === 2) fieldsToValidate = ['password', 'password_confirm'];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={3} labels={['Identité', 'Sécurité', 'Validation']} />

            <div className={`space-y-5 ${step !== 1 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <Input
                    label="Nom d'utilisateur"
                    placeholder="ex: john_doe"
                    error={errors.username?.message}
                    {...register('username')}
                />

                <Input
                    label="Adresse email"
                    type="email"
                    placeholder="ex: john@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                />
            </div>

            <div className={`space-y-5 ${step !== 2 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="relative">
                    <Input
                        label="Mot de passe"
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
                    <div className="space-y-1.5 animate-fade-in">
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
            </div>

            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="text-center p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-echo-textMuted mb-2">
                    Dernière étape ! Mouvement ECHO s'engage à protéger vos données éthiquement.
                </div>

                {/* Age consent checkbox */}
                <div className={`flex items-start space-x-3 bg-white/5 p-4 rounded-lg border transition-colors hover:bg-white/10 ${errors.age_consent ? 'border-red-500/50' : 'border-white/10'}`}>
                    <div className="flex items-center h-5 mt-0.5">
                        <input
                            id="age_consent"
                            type="checkbox"
                            className="w-4 h-4 text-echo-gold bg-transparent border-white/40 rounded focus:ring-echo-gold focus:ring-2 cursor-pointer"
                            {...register('age_consent')}
                        />
                    </div>
                    <div className="text-sm">
                        <label htmlFor="age_consent" className="font-medium text-white cursor-pointer select-none">
                            Je certifie avoir plus de 15 ans
                        </label>
                        <p className="text-echo-textMuted mt-1 text-xs">
                            Consentement exigé pour créer un compte conformément à la loi.
                        </p>
                    </div>
                </div>
                {errors.age_consent && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {errors.age_consent.message}
                    </p>
                )}

                {/* RGPD consent checkbox */}
                <div className={`flex items-start space-x-3 bg-white/5 p-4 rounded-lg border transition-colors hover:bg-white/10 ${errors.rgpd_consent ? 'border-red-500/50' : 'border-white/10'}`}>
                    <div className="flex items-center h-5 mt-0.5">
                        <input
                            id="rgpd_consent"
                            type="checkbox"
                            className="w-4 h-4 text-echo-gold bg-transparent border-white/40 rounded focus:ring-echo-gold focus:ring-2 cursor-pointer"
                            {...register('rgpd_consent')}
                        />
                    </div>
                    <div className="text-sm">
                        <label htmlFor="rgpd_consent" className="font-medium text-white cursor-pointer select-none">
                            J'accepte la politique de confidentialité
                        </label>
                        <p className="text-echo-textMuted mt-1 text-xs">
                            Vos données sont traitées conformément à notre{' '}
                            <a href="/politique-de-confidentialite" target="_blank" className="text-amber-500 hover:underline">
                                politique de confidentialité
                            </a>.
                        </p>
                    </div>
                </div>
                {errors.rgpd_consent && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {errors.rgpd_consent.message}
                    </p>
                )}

                {/* Server error */}
                {registerMutation.isError && (
                    <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in">
                        {registerMutation.error?.message}
                    </p>
                )}

                {/* Success message */}
                {registerMutation.isSuccess && (
                    <p className="text-sm text-green-400 font-medium text-center bg-green-500/10 p-3 rounded-lg border border-green-500/20 animate-fade-in">
                        Compte créé avec succès ! Redirection...
                    </p>
                )}
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10 mt-6 md:flex-row flex-col-reverse gap-3">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting || registerMutation.isPending || registerMutation.isSuccess} className="md:w-auto w-full">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
                    </Button>
                ) : <div className="hidden md:block"></div>}

                {step < 3 ? (
                    <Button type="button" onClick={handleNext} className="md:w-auto w-full">
                        Suivant <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        disabled={isSubmitting || registerMutation.isPending || registerMutation.isSuccess}
                        isLoading={registerMutation.isPending}
                        className="md:w-auto w-full px-8"
                    >
                        {registerMutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                Création...
                            </span>
                        ) : registerMutation.isSuccess ? "Succès" : "Créer le compte"}
                    </Button>
                )}
            </div>
        </form>
    );
};
