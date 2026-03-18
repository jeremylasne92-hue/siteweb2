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
import { PasswordRequirements } from './PasswordRequirements';

const AVAILABLE_INTERESTS = [
    { id: 'philosophie-conscience', label: 'Philosophie & Conscience', emoji: '🧠' },
    { id: 'spiritualite-esoterisme', label: 'Spiritualité & Ésotérisme', emoji: '🔮' },
    { id: 'religions-traditions', label: 'Religions & Traditions', emoji: '📿' },
    { id: 'mythes-civilisations', label: 'Mythes & Civilisations', emoji: '🏛️' },
    { id: 'sciences-neurosciences', label: 'Sciences & Neurosciences', emoji: '🧬' },
    { id: 'ecologie-climat', label: 'Écologie & Climat', emoji: '🌍' },
    { id: 'justice-droits', label: 'Justice & Droits', emoji: '⚖️' },
    { id: 'geopolitique-pouvoir', label: 'Géopolitique & Pouvoir', emoji: '🌐' },
    { id: 'economie-industrie', label: 'Économie & Industrie', emoji: '💰' },
    { id: 'technologies-ia', label: 'Technologies & IA', emoji: '🤖' },
    { id: 'sante-bien-etre', label: 'Santé & Bien-être', emoji: '🏥' },
    { id: 'arts-medias-culture', label: 'Arts, Médias & Culture', emoji: '🎭' },
];

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
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            password_confirm: '',
            interests: [],
            acquisition_source: '',
            newsletter_optin: false,
            age_consent: false,
            rgpd_consent: false,
        },
        mode: 'onChange',
    });

    const passwordValue = watch('password');
    const selectedInterests: string[] = watch('interests') ?? [];
    const strength = passwordValue ? getPasswordStrength(passwordValue) : null;

    const toggleInterest = (interestId: string) => {
        const current = selectedInterests;
        const updated = current.includes(interestId)
            ? current.filter(i => i !== interestId)
            : [...current, interestId];
        setValue('interests', updated);
    };

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
        // Step 3 (interests) has no required validation — skip straight through

        if (fieldsToValidate.length > 0) {
            const isStepValid = await trigger(fieldsToValidate);
            if (!isStepValid) return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={4} labels={['Identité', 'Sécurité', 'Intérêts', 'Validation']} />

            {/* Step 1 — Identité */}
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

            {/* Step 2 — Sécurité */}
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
            </div>

            {/* Step 3 — Centres d'intérêt */}
            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="text-center p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-echo-textMuted mb-2">
                    Quelles thématiques de la série vous intéressent ? <span className="text-neutral-500">(optionnel)</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INTERESTS.map(interest => {
                        const isSelected = selectedInterests.includes(interest.id);
                        return (
                            <button
                                key={interest.id}
                                type="button"
                                onClick={() => toggleInterest(interest.id)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                    isSelected
                                        ? 'bg-echo-gold/20 border-echo-gold/40 text-echo-gold'
                                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-300'
                                }`}
                            >
                                {interest.emoji} {interest.label}
                            </button>
                        );
                    })}
                </div>

                {selectedInterests.length > 0 && (
                    <p className="text-xs text-echo-textMuted text-center animate-fade-in">
                        {selectedInterests.length} thématique{selectedInterests.length > 1 ? 's' : ''} sélectionnée{selectedInterests.length > 1 ? 's' : ''}
                    </p>
                )}

                {/* Acquisition source */}
                <div className="mt-4">
                    <label htmlFor="acquisition_source" className="block text-sm font-medium text-neutral-300 mb-1.5">
                        Comment avez-vous connu ECHO ? <span className="text-neutral-500">(optionnel)</span>
                    </label>
                    <select
                        id="acquisition_source"
                        {...register('acquisition_source')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/30 transition-colors"
                    >
                        <option value="">-- Sélectionnez --</option>
                        <option value="bouche_a_oreille">Bouche-à-oreille</option>
                        <option value="reseaux_sociaux">Réseaux sociaux</option>
                        <option value="recherche_web">Recherche web (Google, etc.)</option>
                        <option value="evenement_projection">Événement / Projection</option>
                        <option value="partenaire">Un partenaire ECHO</option>
                        <option value="presse_media">Presse / Médias</option>
                        <option value="ecole_universite">École / Université</option>
                        <option value="association">Association / ONG</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>
            </div>

            {/* Step 4 — Validation */}
            <div className={`space-y-5 ${step !== 4 ? 'hidden' : 'animate-fade-in delay-100'}`}>
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
                            J'accepte les{' '}
                            <a href="/cgu" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                                Conditions Générales d'Utilisation
                            </a>{' '}
                            et la{' '}
                            <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                                Politique de confidentialité
                            </a>
                        </label>
                        <p className="text-echo-textMuted mt-1 text-xs">
                            Vos données sont traitées conformément à notre politique de confidentialité.
                        </p>
                    </div>
                </div>
                {errors.rgpd_consent && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {errors.rgpd_consent.message}
                    </p>
                )}

                {/* Newsletter opt-in (RGPD: décoché par défaut) */}
                <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                    <div className="flex items-center h-5 mt-0.5">
                        <input
                            id="newsletter_optin"
                            type="checkbox"
                            className="w-4 h-4 text-echo-gold bg-transparent border-white/40 rounded focus:ring-echo-gold focus:ring-2 cursor-pointer"
                            {...register('newsletter_optin')}
                        />
                    </div>
                    <div className="text-sm">
                        <label htmlFor="newsletter_optin" className="font-medium text-white cursor-pointer select-none">
                            Je souhaite recevoir la newsletter de Mouvement ECHO
                        </label>
                        <p className="text-echo-textMuted mt-1 text-xs">
                            Actualités, épisodes, événements. Vous pouvez vous désinscrire à tout moment via votre profil.
                        </p>
                    </div>
                </div>

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

            <p className="text-xs text-stone-500 text-center leading-relaxed">
                Ce site est protégé par reCAPTCHA. La{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-400">
                    Politique de confidentialité
                </a>{' '}
                et les{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-400">
                    Conditions d'utilisation
                </a>{' '}
                de Google s'appliquent.
            </p>

            <div className="flex justify-between pt-4 border-t border-white/10 mt-6 md:flex-row flex-col-reverse gap-3">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting || registerMutation.isPending || registerMutation.isSuccess} className="md:w-auto w-full">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
                    </Button>
                ) : <div className="hidden md:block"></div>}

                {step < 4 ? (
                    <Button type="button" onClick={handleNext} className="md:w-auto w-full">
                        {step === 3 ? (selectedInterests.length === 0 ? 'Passer' : 'Suivant') : 'Suivant'} <ChevronRight className="w-4 h-4 ml-2" />
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
