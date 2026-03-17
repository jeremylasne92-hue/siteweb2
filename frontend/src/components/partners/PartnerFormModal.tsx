import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { PartnerCategory } from './PartnerCard';
import type { Thematic } from './ThematicTag';
import { MapPin, Upload, ChevronRight, ChevronLeft, CheckCircle2, CalendarDays, Mail, Clock } from 'lucide-react';
import { ApplicationSuccessCTA } from '../forms/ApplicationSuccessCTA';
import { PARTNERS_API } from '../../config/api';
import { BOOKING_URL } from '../../config/booking';
import { sanitizePhone, isValidPhone, isValidEmail } from '../../utils/validation';

interface PartnerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    thematicsList: Thematic[];
}

const CATEGORIES: { value: PartnerCategory; label: string }[] = [
    { value: 'expert', label: "Expert / Académique" },
    { value: 'financier', label: "Financier / Investisseur" },
    { value: 'audiovisuel', label: "Audiovisuel / Studio" },
    { value: 'education', label: "Éducation / Culture" },
];

export function PartnerFormModal({ isOpen, onClose, thematicsList }: PartnerFormModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'expert' as PartnerCategory,
        thematics: [] as string[],
        description: '',
        description_long: '',
        address: '',
        city: '',
        postal_code: '',
        latitude: 0,
        longitude: 0,
        contact_name: '',
        contact_role: '',
        contact_email: '',
        contact_phone: '',
        website_url: '',
        linkedin_url: '',
        instagram_url: '',
        twitter_url: '',
        password: '',
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [consentRGPD, setConsentRGPD] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string; address?: Record<string, string> }>>([]);
    const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep(1);
                setSuccess(false);
                setError(null);
                setFormData({
                    name: '', category: 'expert' as PartnerCategory, thematics: [], description: '', description_long: '',
                    address: '', city: '', postal_code: '', latitude: 0, longitude: 0,
                    contact_name: '', contact_role: '', contact_email: '', contact_phone: '',
                    website_url: '', linkedin_url: '', instagram_url: '', twitter_url: '', password: ''
                });
                setLogoFile(null);
                setConsentRGPD(false);
            }, 300);
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleThematic = (code: string) => {
        setFormData(prev => ({
            ...prev,
            thematics: prev.thematics.includes(code)
                ? prev.thematics.filter(t => t !== code)
                : [...prev.thematics, code]
        }));
    };

    const handleAddressSearch = (query: string) => {
        handleInputChange({ target: { name: 'address', value: query } } as React.ChangeEvent<HTMLInputElement>);
        if (query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
        addressDebounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=fr&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setAddressSuggestions(data.slice(0, 5));
                }
            } catch {
                // Nominatim unavailable
            }
        }, 400);
    };

    const selectAddress = (suggestion: { display_name: string; lat: string; lon: string; address?: Record<string, string> }) => {
        const addr = suggestion.address || {};
        const houseNumber = addr.house_number || '';
        const road = addr.road || '';
        const fullStreet = houseNumber && road
            ? `${houseNumber} ${road}`
            : road || suggestion.display_name.split(',').slice(0, 2).join(',').trim();

        setFormData(prev => ({
            ...prev,
            address: fullStreet,
            city: addr.city || addr.town || addr.village || addr.municipality || '',
            postal_code: addr.postcode || '',
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon)
        }));
        setAddressSuggestions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const form = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'thematics') {
                    form.append(key, JSON.stringify(value));
                } else if (value !== '' && value !== null && value !== undefined) {
                    form.append(key, String(value));
                }
            });

            if (logoFile) {
                form.append('logo', logoFile);
            }

            const res = await fetch(`${PARTNERS_API}/apply`, {
                method: 'POST',
                credentials: 'include',
                body: form
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                // FastAPI 422 returns detail as array — extract readable message
                const detail = data.detail;
                if (typeof detail === 'string') {
                    setError(detail);
                } else if (Array.isArray(detail)) {
                    setError(detail.map((d: { msg?: string }) => d.msg || '').join(', ') || "Erreur de validation");
                } else {
                    setError("Une erreur est survenue lors de l'envoi");
                }
            }
        } catch {
            setError("Erreur de connexion au serveur");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4 animate-fade-in">
            <Input label="Nom de l'organisation" name="name" required value={formData.name} onChange={handleInputChange} />

            <div className="space-y-2">
                <label className="text-sm font-medium text-echo-textMuted ml-1">Catégorie</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 transition-all duration-200"
                >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-echo-darker">{c.label}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-echo-textMuted ml-1">Thématiques (sélectionnez-en plusieurs)</label>
                <div className="flex flex-wrap gap-2 p-2 border border-white/10 rounded-md bg-white/5">
                    {thematicsList.map(t => (
                        <button
                            key={t.code}
                            type="button"
                            onClick={() => toggleThematic(t.code)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${formData.thematics.includes(t.code)
                                ? 'bg-echo-gold/20 border-echo-gold text-white'
                                : 'border-white/10 text-echo-textMuted hover:border-white/30'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-echo-textMuted ml-1">Description courte (max 300 cara.)</label>
                <textarea
                    name="description"
                    required
                    maxLength={300}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 min-h-[80px]"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-echo-textMuted ml-1">Logo</label>
                <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-md cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload size={16} className="text-echo-textMuted" />
                        <span className="text-sm text-echo-textMuted">{logoFile ? logoFile.name : "Choisir un fichier"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                    </label>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4 animate-fade-in relative z-50">
            <div className="space-y-2 relative">
                <label className="text-sm font-medium text-echo-textMuted ml-1">Rechercher votre adresse</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-echo-textMuted" size={16} />
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleAddressSearch(e.target.value)}
                        placeholder="Commencez à taper..."
                        className="flex h-10 w-full pl-9 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                    />
                </div>
                {addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-echo-darker border border-white/10 rounded-md shadow-xl overflow-hidden z-50">
                        {addressSuggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => selectAddress(s)}
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 border-b border-white/5 last:border-0"
                            >
                                {s.display_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input label="Ville" name="city" required value={formData.city} onChange={handleInputChange} />
                <Input
                    label="Code postal"
                    name="postal_code"
                    required
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    maxLength={5}
                    pattern="\d{5}"
                    title="Code postal à 5 chiffres"
                    inputMode="numeric"
                    onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = input.value.replace(/\D/g, '').slice(0, 5);
                        handleInputChange({ target: { name: 'postal_code', value: input.value } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                />
            </div>

            {(formData.latitude !== 0) && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Coordonnées GPS validées
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <Input label="Nom du contact *" name="contact_name" required value={formData.contact_name} onChange={handleInputChange} />
                <Input label="Fonction (Rôle)" name="contact_role" value={formData.contact_role} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input label="Email de contact *" type="email" name="contact_email" required value={formData.contact_email} onChange={handleInputChange} />
                <Input
                    label="Téléphone"
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    maxLength={20}
                    pattern="[+0][\d\s.\-()]{5,19}"
                    title="Numéro de téléphone valide (chiffres, espaces, tirets)"
                    onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = sanitizePhone(input.value);
                        handleInputChange({ target: { name: 'contact_phone', value: input.value } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                />
            </div>

            <Input label="Site Web" type="url" name="website_url" value={formData.website_url} onChange={handleInputChange} />

            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="LinkedIn URL" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} />
                <Input placeholder="Instagram URL" name="instagram_url" value={formData.instagram_url} onChange={handleInputChange} />
                <Input placeholder="X (Twitter) URL" name="twitter_url" value={formData.twitter_url} onChange={handleInputChange} />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-echo-textMuted mb-4">
                Votre adresse email ({formData.contact_email || 'non renseignée'}) servira d'identifiant pour accéder à votre espace partenaire une fois votre candidature validée.
            </div>

            <Input
                label="Mot de passe du compte *"
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleInputChange}
            />
        </div>
    );

    const isStep1Valid = formData.name && formData.description && formData.thematics.length > 0;
    const isStep2Valid = formData.address && formData.city && formData.postal_code && formData.latitude !== 0;
    const isStep3Valid = formData.contact_name && formData.contact_email && isValidEmail(formData.contact_email) && isValidPhone(formData.contact_phone);
    const isStep4Valid = formData.password.length >= 8;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Devenir Partenaire ECHO" className="max-w-2xl">
            {success ? (
                <div className="py-8 space-y-6">
                    {/* Success Header */}
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-white">Candidature envoyée avec succès !</h3>
                        <p className="text-echo-textMuted text-sm max-w-md mx-auto">
                            Merci pour votre engagement auprès du Mouvement ECHO.
                        </p>
                    </div>

                    {/* Next Steps */}
                    <div className="space-y-3 max-w-md mx-auto">
                        <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                            <Mail size={18} className="text-echo-gold mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm text-white font-medium">Email de confirmation envoyé</p>
                                <p className="text-xs text-echo-textMuted mt-0.5">
                                    Un email a été envoyé à <span className="text-white">{formData.contact_email}</span> avec les détails de votre candidature.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                            <Clock size={18} className="text-echo-gold mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm text-white font-medium">Examen de votre dossier</p>
                                <p className="text-xs text-echo-textMuted mt-0.5">
                                    Notre équipe examinera votre demande sous 48h et vous notifiera par email de la décision.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-echo-gold/10 border border-echo-gold/20 rounded-lg">
                            <CalendarDays size={18} className="text-echo-gold mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm text-white font-medium">Prenez rendez-vous avec l'équipe</p>
                                <p className="text-xs text-echo-textMuted mt-0.5 mb-2">
                                    Vous pouvez dès maintenant planifier un échange avec l'équipe ECHO pour discuter de votre partenariat.
                                </p>
                                <a
                                    href={BOOKING_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-echo-gold/20 border border-echo-gold/40 rounded-md text-xs font-medium text-echo-gold hover:bg-echo-gold/30 transition-colors"
                                >
                                    <CalendarDays size={14} />
                                    Prendre rendez-vous
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto">
                        <ApplicationSuccessCTA onNavigate={onClose} />
                    </div>

                    <div className="text-center pt-2">
                        <Button onClick={onClose}>Fermer</Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Stepper Header */}
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-echo-gold text-black' : 'bg-white/10 text-white/50'
                                    }`}>
                                    {s}
                                </div>
                                <span className={`text-xs mt-2 ${step >= s ? 'text-echo-gold' : 'text-white/30'}`}>
                                    {s === 1 ? 'Identité' : s === 2 ? 'Localisation' : s === 3 ? 'Contact' : 'Compte'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="min-h-[300px]">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-white/10 mt-8">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                            </Button>
                        ) : <div></div>}

                        {step < 4 ? (
                            <Button
                                type="button"
                                onClick={() => setStep(step + 1)}
                                disabled={
                                    (step === 1 && !isStep1Valid) ||
                                    (step === 2 && !isStep2Valid) ||
                                    (step === 3 && !isStep3Valid)
                                }
                            >
                                Suivant <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="flex flex-col items-end gap-3">
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
                                <Button type="submit" disabled={!isStep4Valid || !consentRGPD || isSubmitting}>
                                    {isSubmitting ? "Envoi..." : "Soumettre la candidature"}
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            )}
        </Modal>
    );
}
