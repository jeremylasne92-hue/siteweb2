import { useState, useRef } from 'react';
import { Send, CheckCircle, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { ApplicationSuccessCTA } from './ApplicationSuccessCTA';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CityAutocomplete } from '../ui/CityAutocomplete';
import { StepProgress } from '../ui/StepProgress';
import { API_URL } from '../../config/api';
import { sanitizePhone, isValidPhone, isValidEmail } from '../../utils/validation';

const SKILL_GROUPS: Record<string, string[]> = {
    "Image": ["Caméra / Cadrage", "Éclairage", "Photographie", "Drone", "Autre (Image)"],
    "Son": ["Prise de son", "Mixage", "Sound design", "Autre (Son)"],
    "Post-production": ["Montage vidéo", "Étalonnage", "Motion design", "VFX", "Autre (Post-production)"],
    "Régie & Logistique": ["Régie", "Direction de production", "Assistant réalisateur", "Décors & accessoires", "Autre (Régie)"],
    "Communication": ["Réseaux sociaux", "Graphisme", "Rédaction", "Community management", "Autre (Communication)"],
};

const AVAILABILITY_OPTIONS = [
    { value: "stage_court", label: "Stage court (< 3 mois)" },
    { value: "stage_long", label: "Stage long (3-6 mois)" },
    { value: "alternance", label: "Alternance" },
    { value: "temps_partiel", label: "Temps partiel" },
];

export function StudentApplicationForm() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [consentRGPD, setConsentRGPD] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [availability, setAvailability] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [summaryData, setSummaryData] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

    const accentHex = '#D4AF37';

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_URL}/students/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || undefined,
                    city: formData.get('city'),
                    school: formData.get('school'),
                    study_field: formData.get('study_field'),
                    skills: selectedSkills,
                    availability: availability,
                    start_date: formData.get('start_date') || undefined,
                    message: formData.get('message') || undefined,
                    website: formData.get('website'),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.rate_limited) {
                    setError('Trop de soumissions récentes. Réessayez plus tard.');
                } else {
                    setSubmitted(true);
                }
            } else if (res.status === 422) {
                try {
                    const errData = await res.json();
                    const details = errData.detail;
                    if (Array.isArray(details)) {
                        const msgs = details.map((e: { loc?: string[]; msg?: string }) => {
                            const field = e.loc?.slice(-1)[0] || '?';
                            return `${field}: ${e.msg}`;
                        });
                        setError(`Erreur de validation : ${msgs.join(', ')}`);
                    } else {
                        setError(typeof details === 'string' ? details : 'Erreur de validation.');
                    }
                } catch {
                    setError('Erreur de validation. Vérifiez vos données.');
                }
            } else if (res.status === 429) {
                setError('Trop de soumissions récentes. Réessayez plus tard.');
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
            setError('');
            const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
            const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
            const cityInput = form.querySelector('input[name="city"]') as HTMLInputElement;
            const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
            if (!nameInput?.checkValidity()) { nameInput?.reportValidity(); return; }
            if (!emailInput?.checkValidity()) { emailInput?.reportValidity(); return; }
            if (!isValidEmail(emailInput?.value)) {
                setError('Adresse email invalide. Vérifiez le format (ex: nom@domaine.com).');
                return;
            }
            if (phoneInput?.value && !phoneInput.checkValidity()) { phoneInput.reportValidity(); return; }
            if (phoneInput?.value && !isValidPhone(phoneInput.value)) {
                const trimmed = phoneInput.value.trim();
                let msg: string;
                if (!trimmed.startsWith('0') && !trimmed.startsWith('+')) {
                    msg = 'Le numéro doit commencer par 0 (français) ou + (international).';
                } else if (trimmed.startsWith('0')) {
                    msg = 'Numéro français invalide (10 chiffres attendus, ex: 06 12 34 56 78).';
                } else {
                    msg = 'Numéro international invalide (6 à 15 chiffres attendus).';
                }
                setError(msg);
                return;
            }
            if (!cityInput?.checkValidity()) { cityInput?.reportValidity(); return; }
        }
        if (step === 2) {
            setError('');
            const schoolInput = form.querySelector('input[name="school"]') as HTMLInputElement;
            const studyFieldInput = form.querySelector('input[name="study_field"]') as HTMLInputElement;
            if (!schoolInput?.checkValidity()) { schoolInput?.reportValidity(); return; }
            if (!studyFieldInput?.checkValidity()) { studyFieldInput?.reportValidity(); return; }
            if (selectedSkills.length === 0) {
                setError('Veuillez sélectionner au moins une compétence.');
                return;
            }
            if (!availability) {
                setError('Veuillez choisir votre disponibilité.');
                return;
            }
            // Validate start_date if provided
            const startDateInput = form.querySelector('input[name="start_date"]') as HTMLInputElement;
            if (startDateInput?.value) {
                const dateVal = new Date(startDateInput.value);
                const year = dateVal.getFullYear();
                if (isNaN(year) || year < 2024 || year > 2030) {
                    setError('La date de début doit être entre 2024 et 2030.');
                    return;
                }
                if (dateVal < new Date()) {
                    setError('La date de début ne peut pas être dans le passé.');
                    return;
                }
            }
            // Capture form data for summary before moving to step 3
            const nameVal = (form.querySelector('input[name="name"]') as HTMLInputElement)?.value || '';
            const emailVal = (form.querySelector('input[name="email"]') as HTMLInputElement)?.value || '';
            const phoneVal = (form.querySelector('input[name="phone"]') as HTMLInputElement)?.value || '';
            const cityVal = (form.querySelector('input[name="city"]') as HTMLInputElement)?.value || '';
            const schoolVal = (form.querySelector('input[name="school"]') as HTMLInputElement)?.value || '';
            const studyFieldVal = (form.querySelector('input[name="study_field"]') as HTMLInputElement)?.value || '';
            const startDateVal = (form.querySelector('input[name="start_date"]') as HTMLInputElement)?.value || '';
            setSummaryData({ name: nameVal, email: emailVal, phone: phoneVal, city: cityVal, school: schoolVal, study_field: studyFieldVal, start_date: startDateVal });
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${accentHex}20` }}>
                    <CheckCircle className="w-8 h-8" style={{ color: accentHex }} />
                </div>
                <h3 className="text-2xl font-serif text-white mb-3">Candidature envoyée avec succès !</h3>
                <p className="text-neutral-400 max-w-md">
                    Merci pour votre intérêt. Notre équipe examinera votre profil et vous contactera prochainement.
                </p>
                <ApplicationSuccessCTA />
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <StepProgress currentStep={step} totalSteps={3} labels={['Identité', 'Formation & Compétences', 'Validation']} />

            {/* Step 1: Identité */}
            <div className={`space-y-5 flex flex-col ${step !== 1 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="grid grid-cols-1 gap-5">
                    <Input label="Nom complet" name="name" placeholder="Votre prénom et nom" required minLength={2} maxLength={100} />
                    <Input label="Email de contact" name="email" type="email" placeholder="votre@email.com" required />
                    <Input
                        label="Téléphone (optionnel)"
                        name="phone"
                        type="tel"
                        placeholder="06 12 34 56 78"
                        maxLength={18}
                        pattern="[+0][\d\s.\-()]{5,19}"
                        title="Numéro de téléphone valide (chiffres, espaces, tirets)"
                        onInput={(e) => {
                            const input = e.currentTarget;
                            input.value = sanitizePhone(input.value);
                        }}
                    />
                    <CityAutocomplete label="Ville" name="city" placeholder="Commencez à taper votre ville..." required />
                </div>
                {error && step === 1 && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
                <div className="text-sm text-neutral-400 p-4 border border-white/5 rounded-md bg-white/5 mt-2">
                    Vos informations seront utilisées uniquement pour traiter votre candidature de <strong>stage / alternance</strong> au sein de la production ECHO.
                </div>
            </div>

            {/* Step 2: Formation & Compétences */}
            <div className={`space-y-5 ${step !== 2 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                <div className="grid grid-cols-1 gap-5">
                    <Input label="Établissement / École" name="school" placeholder="Nom de votre école ou université" required minLength={2} maxLength={150} />
                    <Input label="Domaine d'études" name="study_field" placeholder="Ex: Cinéma, Communication, Informatique..." required minLength={2} maxLength={150} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Vos compétences</label>
                    <div className="space-y-2">
                        {Object.entries(SKILL_GROUPS).map(([category, skills]) => {
                            const count = skills.filter(s => selectedSkills.includes(s)).length;
                            return (
                                <div key={category} className="border border-white/10 rounded-lg overflow-hidden bg-stone-800/50">
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            {category}
                                            {count > 0 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">{count}</span>
                                            )}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${expandedCategories.includes(category) ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedCategories.includes(category) && (
                                        <div className="px-4 pb-3 flex flex-wrap gap-2">
                                            {skills.map(skill => (
                                                <label
                                                    key={skill}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border ${
                                                        selectedSkills.includes(skill)
                                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                                            : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSkills.includes(skill)}
                                                        onChange={() => toggleSkill(skill)}
                                                        className="sr-only"
                                                    />
                                                    {skill}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {selectedSkills.length > 0 && (
                        <p className="text-xs text-amber-400/70 mt-2">{selectedSkills.length} compétence{selectedSkills.length > 1 ? 's' : ''} sélectionnée{selectedSkills.length > 1 ? 's' : ''}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Disponibilité souhaitée</label>
                    <div className="space-y-2">
                        {AVAILABILITY_OPTIONS.map(option => (
                            <label
                                key={option.value}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all border ${
                                    availability === option.value
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-stone-800/50 text-neutral-400 border-white/10 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="availability"
                                    value={option.value}
                                    checked={availability === option.value}
                                    onChange={() => setAvailability(option.value)}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    availability === option.value ? 'border-amber-400' : 'border-neutral-600'
                                }`}>
                                    {availability === option.value && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                                </div>
                                <span className="text-sm">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="start_date">Date de début souhaitée</label>
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        min={new Date().toISOString().split('T')[0]}
                        max="2030-12-31"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm [&::-webkit-calendar-picker-indicator]:invert"
                    />
                </div>

                {error && step === 2 && (
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</p>
                )}
            </div>

            {/* Step 3: Validation */}
            <div className={`space-y-5 ${step !== 3 ? 'hidden' : 'animate-fade-in delay-100'}`}>
                {/* Summary / Recap */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-neutral-300 mb-2">Récapitulatif de votre candidature</h4>
                    <div className="space-y-2 text-sm">
                        {[
                            { label: 'Nom', value: summaryData.name },
                            { label: 'Email', value: summaryData.email },
                            { label: 'Téléphone', value: summaryData.phone },
                            { label: 'Ville', value: summaryData.city },
                            { label: 'École', value: summaryData.school },
                            { label: "Domaine d'études", value: summaryData.study_field },
                            { label: 'Compétences', value: selectedSkills.join(', ') },
                            { label: 'Disponibilité', value: AVAILABILITY_OPTIONS.find(o => o.value === availability)?.label },
                            { label: 'Date de début', value: summaryData.start_date ? new Date(summaryData.start_date).toLocaleDateString('fr-FR') : '' },
                        ].filter(item => item.value).map(item => (
                            <div key={item.label} className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-stone-800/50 border border-white/5">
                                <span className="text-amber-500 font-semibold shrink-0 min-w-[120px]">{item.label}</span>
                                <span className="text-neutral-300">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Un message pour l'équipe ? (optionnel)</label>
                    <textarea
                        name="message"
                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm resize-y min-h-[140px]"
                        placeholder="Parlez-nous de vos motivations, de votre projet professionnel..."
                        maxLength={2000}
                    />
                </div>

                {/* Honeypot */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {error && step === 3 && (
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

export default StudentApplicationForm;
