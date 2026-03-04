import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { PartnerCategory } from './PartnerCard';
import type { Thematic } from './ThematicTag';
import { MapPin, Upload, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { PARTNERS_API } from '../../config/api';

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
    { value: 'membre', label: "Membre ECHO / Ambassadeur" },
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
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

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

    const handleAddressSearch = async (query: string) => {
        handleInputChange({ target: { name: 'address', value: query } } as any);
        if (query.length < 5) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=fr`);
            const data = await res.json();
            setAddressSuggestions(data.slice(0, 5));
        } catch (err) {
            console.error(err);
        }
    };

    const selectAddress = (suggestion: any) => {
        setFormData(prev => ({
            ...prev,
            address: suggestion.display_name.split(',')[0],
            city: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '',
            postal_code: suggestion.address?.postcode || '',
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
                } else if (value) {
                    form.append(key, String(value));
                }
            });

            if (logoFile) {
                form.append('logo', logoFile);
            }

            const res = await fetch(`${PARTNERS_API}/apply`, {
                method: 'POST',
                body: form
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.detail || "Une erreur est survenue");
            }
        } catch (err) {
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
                <Input label="Code postal" name="postal_code" required value={formData.postal_code} onChange={handleInputChange} />
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
                <Input label="Téléphone" type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleInputChange} />
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
    const isStep3Valid = formData.contact_name && formData.contact_email;
    const isStep4Valid = formData.password.length >= 8;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Devenir Partenaire ECHO" className="max-w-2xl">
            {success ? (
                <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-serif text-white">Demande envoyée !</h3>
                    <p className="text-echo-textMuted">
                        Merci pour votre engagement. Notre équipe étudiera votre demande et vous recevrez un email de confirmation prochainement.
                    </p>
                    <Button onClick={onClose} className="mt-4">Fermer</Button>
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
                            <Button type="submit" disabled={!isStep4Valid || isSubmitting}>
                                {isSubmitting ? "Envoi..." : "Soumettre la candidature"}
                            </Button>
                        )}
                    </div>
                </form>
            )}
        </Modal>
    );
}
