import { useState, useRef } from 'react';
import { Send, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StepProgress } from '../ui/StepProgress';
import { API_URL } from '../../config/api';

const WRITING_GENRES = [
    'Scénario', 'Fiction', 'Documentaire', 'Poésie',
    'Narration', 'Dialogue', 'Dramaturgie', 'Analyse littéraire',
];

const INTEREST_TAGS = [
    'Écologie', 'Sciences', 'Philosophie', 'Société',
    'Technologie', 'Arts', 'Politique', 'Spiritualité',
];

const EXPERIENCE_LEVELS = [
    { value: 'professional', label: 'Professionnel·le', desc: 'Publication, production ou commande professionnelle' },
    { value: 'student', label: 'Étudiant·e', desc: 'En formation écriture, lettres ou cinéma' },
    { value: 'self_taught', label: 'Autodidacte', desc: 'Écriture régulière, ateliers, projets personnels' },
    { value: 'motivated', label: 'Passionné·e', desc: 'Envie de se lancer dans l\'écriture' },
];

const accentHex = '#D4AF37';

export function ScenaristApplicationForm() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [consentRGPD, setConsentRGPD] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const toggleTag = (tag: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_URL}/candidatures/scenariste`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    skills: selectedGenres.join(', '),
                    message: formData.get('message'),
                    project: 'scenariste',
                    website: formData.get('website') || '',
                    portfolio_url: formData.get('portfolio_url') || null,
                    creative_interests: selectedInterests.length > 0 ? selectedInterests.join(', ') : null,
                    experience_level: experienceLevel || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.rate_limited) {
                    setError('Trop de soumissions récentes. Réessayez plus tard.');
                } else {
                    setSubmitted(true);
                }
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } catch {
            setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
        setLoading(false);
    };

    const handleNext = () => {
        const form = formRef.current;
        if (!form) return;

        if (step === 1) {
            const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
            const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
            if (!nameInput?.checkValidity()) { nameInput?.reportValidity(); return; }
            if (!emailInput?.checkValidity()) { emailInput?.reportValidity(); return; }
        }
        if (step === 2) {
            if (selectedGenres.length === 0) {
                setError('Sélectionnez au moins un genre d\'écriture.');
                return;
            }
            if (!experienceLevel) {
                setError('Sélectionnez votre niveau d\'expérience.');
                return;
            }
            setError('');
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${accentHex}20` }}>
                    <CheckCircle className="w-8 h-8" style={{ color: accentHex }} />
                </div>
                <h3 className="text-2xl font-serif text-white mb-3">Candidature envoyée !</h3>
                <p className="text-neutral-400 max-w-md">
                    Merci pour votre intérêt. Notre équipe examinera votre profil créatif et vous contactera prochainement.
                </p>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={4} labels={['Identité', 'Profil créatif', 'Thématiques', 'Motivation']} />

            {/* Step 1: Identity */}
            <div className={`space-y-5 flex flex-col ${step !== 1 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="grid grid-cols-1 gap-5">
                    <Input label="Nom complet" name="name" placeholder="Votre prénom et nom" required minLength={2} maxLength={100} />
                    <Input label="Email de contact" name="email" type="email" placeholder="votre@email.com" required />
                    <Input label="Portfolio / travaux en ligne (optionnel)" name="portfolio_url" type="url" placeholder="https://votre-site.com, Wattpad, blog..." />
                </div>
                <div className="text-sm text-neutral-400 p-4 border border-white/5 rounded-md bg-white/5 mt-2">
                    Votre adresse email sera utilisée pour vous recontacter concernant votre candidature comme <strong>scénariste</strong> pour la série ECHO.
                </div>
            </div>

            {/* Step 2: Creative Profile — Genres + Experience */}
            <div className={`space-y-5 ${step !== 2 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Genres d'écriture</label>
                    <div className="flex flex-wrap gap-2">
                        {WRITING_GENRES.map(genre => (
                            <button
                                key={genre}
                                type="button"
                                onClick={() => toggleTag(genre, selectedGenres, setSelectedGenres)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    selectedGenres.includes(genre)
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Sélectionnez un ou plusieurs genres.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Niveau d'expérience</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {EXPERIENCE_LEVELS.map(level => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setExperienceLevel(level.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    experienceLevel === level.value
                                        ? 'bg-amber-500/15 border-amber-500/50'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <span className={`text-sm font-medium ${experienceLevel === level.value ? 'text-amber-400' : 'text-white'}`}>
                                    {level.label}
                                </span>
                                <p className="text-xs text-neutral-500 mt-0.5">{level.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

            {/* Step 3: Thematic Interests */}
            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Quelles thématiques vous passionnent ?</label>
                    <div className="flex flex-wrap gap-2">
                        {INTEREST_TAGS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag, selectedInterests, setSelectedInterests)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    selectedInterests.includes(tag)
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Sélectionnez une ou plusieurs thématiques (optionnel).</p>
                </div>
            </div>

            {/* Step 4: Motivation */}
            <div className={`space-y-5 ${step !== 4 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Votre motivation</label>
                    <textarea
                        name="message"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 text-sm resize-y min-h-[140px]"
                        placeholder="Pourquoi souhaitez-vous participer à l'écriture de la série ECHO ? Que souhaitez-vous apporter au Mouvement ?"
                        required
                        minLength={10}
                        maxLength={2000}
                    />
                </div>

                {/* Honeypot */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-white/10 mt-6 md:flex-row flex-col-reverse gap-3">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="md:w-auto w-full">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                    </Button>
                ) : <div className="hidden md:block"></div>}

                {step < 4 ? (
                    <Button type="button" onClick={handleNext} className="md:w-auto w-full">
                        Suivant <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
                        <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={consentRGPD}
                                onChange={(e) => setConsentRGPD(e.target.checked)}
                                className="mt-1 accent-echo-gold shrink-0"
                                required
                            />
                            <span>
                                J'accepte que mes données soient traitées conformément à la{' '}
                                <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
                                   className="text-echo-gold hover:underline">
                                    politique de confidentialité
                                </a>.
                            </span>
                        </label>
                        <Button
                            variant="primary"
                            className="flex items-center justify-center gap-2 hover:opacity-90 md:w-auto w-full"
                            style={{ backgroundColor: accentHex }}
                            disabled={loading || !consentRGPD}
                        >
                            {loading ? 'Envoi...' : 'Soumettre'} <Send className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </form>
    );
}
