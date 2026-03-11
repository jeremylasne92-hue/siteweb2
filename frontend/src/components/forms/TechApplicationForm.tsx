import { useState, useRef } from 'react';
import { Send, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StepProgress } from '../ui/StepProgress';
import { API_URL } from '../../config/api';

interface TechApplicationFormProps {
    project: 'cognisphere' | 'echolink';
    accentColor: string;     // e.g. "violet-500" or "echo-blueLight"
    accentHex: string;       // e.g. "#8B5CF6" or "#60A5FA"
}

export function TechApplicationForm({ project, accentHex }: TechApplicationFormProps) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const formRef = useRef<HTMLFormElement>(null);

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
                    skills: formData.get('skills'),
                    message: formData.get('message'),
                    project,
                    website: formData.get('website') || '',
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
            const skillsInput = form.querySelector('textarea[name="skills"]') as HTMLTextAreaElement;
            if (!skillsInput?.checkValidity()) { skillsInput?.reportValidity(); return; }
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
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={3} labels={['Identité', 'Expertise', 'Motivation']} />

            <div className={`space-y-5 flex flex-col ${step !== 1 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="grid grid-cols-1 gap-5">
                    <Input label="Nom complet" name="name" placeholder="Votre prénom et nom" required minLength={2} maxLength={100} />
                    <Input label="Email de contact" name="email" type="email" placeholder="votre@email.com" required />
                </div>
                <div className="text-sm text-neutral-400 p-4 border border-white/5 rounded-md bg-white/5 mt-2">
                    Votre adresse email sera utilisée pour vous recontacter concernant votre candidature pour contribuer à <strong>{project}</strong>.
                </div>
            </div>

            <div className={`space-y-5 ${step !== 2 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Compétences techniques & Atouts</label>
                    <textarea
                        name="skills"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm resize-y min-h-[140px]"
                        placeholder="Quelles sont vos technologies de confort ? (ex: React, TypeScript, Python, Node.js, Design System...)"
                        required
                        minLength={2}
                        maxLength={500}
                    />
                </div>
            </div>

            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Lettre de motivation rapide</label>
                    <textarea
                        name="message"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 text-sm resize-y min-h-[140px]"
                        placeholder={`Saisissez cette opportunité ! Racontez-nous brièvement pourquoi vous souhaitez intégrer l'équipe de développement du projet ${project} ?`}
                        required
                        minLength={10}
                        maxLength={2000}
                    />
                </div>

                {/* Honeypot — hidden from users, visible to bots */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

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
                    <Button
                        variant="primary"
                        className="flex items-center justify-center gap-2 hover:opacity-90 md:w-auto w-full"
                        style={{ backgroundColor: accentHex }}
                        disabled={loading}
                    >
                        {loading ? 'Envoi...' : 'Soumettre'} <Send className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </form>
    );
}
