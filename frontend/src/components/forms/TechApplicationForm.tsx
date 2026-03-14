import { useState, useRef } from 'react';
import { Send, CheckCircle, ChevronRight, ChevronLeft, ChevronDown, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StepProgress } from '../ui/StepProgress';
import { API_URL } from '../../config/api';

interface TechApplicationFormProps {
    project: 'cognisphere' | 'echolink';
    accentColor: string;
    accentHex: string;
}

const SKILL_CATEGORIES: Record<string, Record<string, string[]>> = {
    cognisphere: {
        'Développement': ['React / Next.js', 'TypeScript', 'Python', 'Node.js', 'Base de données', 'DevOps / CI-CD'],
        'IA & Data': ['Machine Learning', 'NLP', 'Data Engineering', 'Prompt Engineering', 'Agents IA'],
        'Design & UX': ['UI Design', 'UX Research', 'Design System', 'Accessibilité', 'Prototypage'],
        'Gestion de projet': ['Agile / Scrum', 'Documentation technique', 'Tests & QA'],
    },
    echolink: {
        'Développement': ['React / Next.js', 'TypeScript', 'Python', 'Node.js', 'API REST', 'WebSockets'],
        'Infrastructure': ['Architecture cloud', 'Base de données', 'DevOps / CI-CD', 'Automatisation'],
        'Design & UX': ['UI Design', 'UX Research', 'Design System', 'Accessibilité'],
        'Gestion de projet': ['Agile / Scrum', 'Documentation technique', 'Tests & QA'],
    },
};

const EXPERIENCE_LEVELS = [
    { value: 'professional', label: 'Professionnel', desc: 'Expérience en entreprise ou freelance' },
    { value: 'student', label: 'Étudiant·e', desc: 'En formation ou récemment diplômé·e' },
    { value: 'self_taught', label: 'Autodidacte', desc: 'Apprentissage personnel, projets perso' },
    { value: 'motivated', label: 'Motivé·e sans expérience', desc: 'Prêt·e à apprendre et contribuer' },
];

export function TechApplicationForm({ project, accentHex }: TechApplicationFormProps) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [consentRGPD, setConsentRGPD] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState('');
    const firstCategory = Object.keys(SKILL_CATEGORIES[project] || SKILL_CATEGORIES.cognisphere)[0];
    const [expandedCategory, setExpandedCategory] = useState<string | null>(firstCategory);
    const formRef = useRef<HTMLFormElement>(null);

    const categories = SKILL_CATEGORIES[project] || SKILL_CATEGORIES.cognisphere;

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_URL}/candidatures/tech`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    skills: selectedSkills.join(', '),
                    message: formData.get('message'),
                    project,
                    website: formData.get('website') || '',
                    portfolio_url: formData.get('portfolio_url') || null,
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
            if (selectedSkills.length === 0) {
                setError('Sélectionnez au moins une compétence.');
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
                    Merci pour votre intérêt. Notre équipe examinera votre profil et vous contactera prochainement.
                </p>
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg max-w-md">
                    <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="w-4 h-4" style={{ color: accentHex }} />
                        <p className="text-sm font-medium text-white">Suivez votre candidature</p>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3">
                        Créez un compte avec la même adresse email pour suivre l'avancement de votre candidature en temps réel.
                    </p>
                    <Link to="/register">
                        <Button type="button" variant="outline" className="w-full text-sm">
                            Créer un compte
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={3} labels={['Identité', 'Compétences', 'Motivation']} />

            {/* Step 1: Identity */}
            <div className={`space-y-5 flex flex-col ${step !== 1 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="grid grid-cols-1 gap-5">
                    <Input label="Nom complet" name="name" placeholder="Votre prénom et nom" required minLength={2} maxLength={100} />
                    <Input label="Email de contact" name="email" type="email" placeholder="votre@email.com" required />
                    <Input label="Portfolio / GitHub (optionnel)" name="portfolio_url" type="url" placeholder="https://github.com/votre-profil" />
                </div>
                <div className="text-sm text-neutral-400 p-4 border border-white/5 rounded-md bg-white/5 mt-2">
                    Votre adresse email sera utilisée pour vous recontacter concernant votre candidature pour contribuer à <strong>{project === 'cognisphere' ? 'CogniSphère' : 'ECHOLink'}</strong>.
                </div>
            </div>

            {/* Step 2: Skills + Experience */}
            <div className={`space-y-5 ${step !== 2 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Compétences techniques</label>
                    <div className="space-y-2">
                        {Object.entries(categories).map(([category, skills]) => (
                            <div key={category} className="border border-white/10 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <span className="text-sm font-medium text-white">
                                        {category}
                                        {selectedSkills.filter(s => skills.includes(s)).length > 0 && (
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentHex}30`, color: accentHex }}>
                                                {selectedSkills.filter(s => skills.includes(s)).length}
                                            </span>
                                        )}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedCategory === category && (
                                    <div className="p-3 flex flex-wrap gap-2">
                                        {skills.map(skill => (
                                            <button
                                                key={skill}
                                                type="button"
                                                aria-pressed={selectedSkills.includes(skill)}
                                                onClick={() => toggleSkill(skill)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                                    selectedSkills.includes(skill)
                                                        ? 'border-transparent text-white'
                                                        : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                                style={selectedSkills.includes(skill) ? { backgroundColor: `${accentHex}30`, color: accentHex, borderColor: `${accentHex}50` } : {}}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Niveau d'expérience</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {EXPERIENCE_LEVELS.map(level => (
                            <button
                                key={level.value}
                                type="button"
                                aria-pressed={experienceLevel === level.value}
                                onClick={() => setExperienceLevel(level.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    experienceLevel === level.value
                                        ? 'border-transparent'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                                style={experienceLevel === level.value ? { backgroundColor: `${accentHex}15`, borderColor: `${accentHex}50` } : {}}
                            >
                                <span className={`text-sm font-medium ${experienceLevel === level.value ? '' : 'text-white'}`} style={experienceLevel === level.value ? { color: accentHex } : {}}>
                                    {level.label}
                                </span>
                                <p className="text-xs text-neutral-500 mt-0.5">{level.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Step 3: Motivation */}
            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Lettre de motivation rapide</label>
                    <textarea
                        name="message"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-current text-sm resize-y min-h-[140px]"
                        style={{ ['--tw-ring-color' as string]: accentHex }}
                        placeholder={`Pourquoi souhaitez-vous intégrer l'équipe de développement de ${project === 'cognisphere' ? 'CogniSphère' : 'ECHOLink'} ?`}
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

                {step < 3 ? (
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
                                   className="hover:underline" style={{ color: accentHex }}>
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
