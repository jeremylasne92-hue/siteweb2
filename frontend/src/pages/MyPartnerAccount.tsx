import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../components/ui/Button';
import {
    User, MapPin, Phone, Upload,
    CheckCircle2, Clock, XCircle, AlertTriangle,
    Save, Calendar, ExternalLink
} from 'lucide-react';
import { PARTNERS_API } from '../config/api';
import { BOOKING_URL } from '../config/booking';

const API_BASE = PARTNERS_API;

type PartnerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

const statusConfig: Record<PartnerStatus, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
    pending: { label: 'En attente de validation', color: '#F59E0B', icon: <Clock size={18} />, bg: 'bg-yellow-500/10 border-yellow-500/30' },
    approved: { label: 'Profil approuvé et public', color: '#10B981', icon: <CheckCircle2 size={18} />, bg: 'bg-green-500/10 border-green-500/30' },
    rejected: { label: 'Candidature refusée', color: '#EF4444', icon: <XCircle size={18} />, bg: 'bg-red-500/10 border-red-500/30' },
    suspended: { label: 'Profil suspendu', color: '#6B7280', icon: <AlertTriangle size={18} />, bg: 'bg-gray-500/10 border-gray-500/30' },
};

interface PartnerData {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    description: string;
    description_long?: string;
    category: string;
    thematics: string[];
    address: string;
    city: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
    contact_name: string;
    contact_role?: string;
    contact_email: string;
    contact_phone?: string;
    website_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    status: PartnerStatus;
    is_featured: boolean;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
}

export default function MyPartnerAccount() {
    const [partner, setPartner] = useState<PartnerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [newLogo, setNewLogo] = useState<File | null>(null);

    // Editable fields
    const [form, setForm] = useState({
        description: '',
        description_long: '',
        address: '',
        city: '',
        postal_code: '',
        latitude: 0,
        longitude: 0,
        contact_phone: '',
        website_url: '',
        linkedin_url: '',
        instagram_url: '',
        twitter_url: '',
    });

    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

    const token = localStorage.getItem('token') || '';

    useEffect(() => {
        fetchPartner();
    }, []);

    const fetchPartner = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/me/account`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                setError('Vous devez être connecté pour accéder à cette page.');
                return;
            }
            if (res.status === 403) {
                setError('Votre compte n\'est pas un compte partenaire.');
                return;
            }
            if (!res.ok) throw new Error('Erreur serveur');

            const data = await res.json();
            setPartner(data);
            setForm({
                description: data.description || '',
                description_long: data.description_long || '',
                address: data.address || '',
                city: data.city || '',
                postal_code: data.postal_code || '',
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                contact_phone: data.contact_phone || '',
                website_url: data.website_url || '',
                linkedin_url: data.linkedin_url || '',
                instagram_url: data.instagram_url || '',
                twitter_url: data.twitter_url || '',
            });
        } catch (err) {
            setError('Impossible de charger votre profil partenaire.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setSaveSuccess(false);
    };

    const handleAddressSearch = async (query: string) => {
        setForm(prev => ({ ...prev, address: query }));
        if (query.length < 5) { setAddressSuggestions([]); return; }
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=fr`);
            setAddressSuggestions((await res.json()).slice(0, 5));
        } catch { /* ignore */ }
    };

    const selectAddress = (s: any) => {
        setForm(prev => ({
            ...prev,
            address: s.display_name.split(',')[0],
            city: s.address?.city || s.address?.town || s.address?.village || '',
            postal_code: s.address?.postcode || '',
            latitude: parseFloat(s.lat),
            longitude: parseFloat(s.lon),
        }));
        setAddressSuggestions([]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, String(value));
                }
            });
            if (newLogo) formData.append('logo', newLogo);

            const res = await fetch(`${API_BASE}/me/account`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                setPartner(data.partner);
                setSaveSuccess(true);
                setNewLogo(null);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch { /* ignore */ } finally { setIsSaving(false); }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-echo-gold border-t-transparent rounded-full" />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md p-8 bg-white/5 border border-white/10 rounded-xl">
                        <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
                        <h2 className="text-xl font-serif text-white mb-2">Accès restreint</h2>
                        <p className="text-echo-textMuted mb-4">{error}</p>
                        <Button onClick={() => window.location.href = '/partenaires'}>
                            Retour aux partenaires
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!partner) return null;

    const statusInfo = statusConfig[partner.status];

    return (
        <Layout>
            <div className="min-h-screen bg-echo-dark pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    {/* Header */}
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {partner.logo_url
                                ? <img src={partner.logo_url} alt="" className="w-full h-full object-cover" />
                                : <span className="text-3xl font-serif text-echo-gold">{partner.name.charAt(0)}</span>
                            }
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif text-white">{partner.name}</h1>
                            <p className="text-echo-textMuted text-sm mt-1">{partner.contact_email}</p>
                            <div className={cn("inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full border text-sm", statusInfo.bg)}
                                style={{ color: statusInfo.color }}>
                                {statusInfo.icon}
                                {statusInfo.label}
                            </div>
                        </div>
                    </div>

                    {/* Rejection reason */}
                    {partner.status === 'rejected' && partner.rejection_reason && (
                        <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            <strong>Motif du refus :</strong> {partner.rejection_reason}
                        </div>
                    )}

                    {/* Info cards */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-xs text-echo-textMuted uppercase tracking-wider mb-1">Catégorie</p>
                            <p className="text-white font-medium capitalize">{partner.category}</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-xs text-echo-textMuted uppercase tracking-wider mb-1">Membre depuis</p>
                            <p className="text-white font-medium">{new Date(partner.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-xs text-echo-textMuted uppercase tracking-wider mb-1">Dernière modification</p>
                            <p className="text-white font-medium">{new Date(partner.updated_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    {/* Prise de RDV */}
                    <a
                        href={BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 mb-10 bg-echo-gold/10 border border-echo-gold/30 rounded-xl hover:bg-echo-gold/20 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-echo-gold/20 flex items-center justify-center">
                                <Calendar size={20} className="text-echo-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Prendre rendez-vous avec l'équipe ECHO</p>
                                <p className="text-echo-textMuted text-sm">Planifiez un échange pour finaliser votre intégration</p>
                            </div>
                        </div>
                        <ExternalLink size={18} className="text-echo-gold group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* Edit Form */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-echo-gold" />
                            Modifier votre fiche
                        </h2>

                        <div className="space-y-6">
                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-echo-textMuted">Description courte</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    maxLength={300}
                                    className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 min-h-[80px]"
                                />
                                <p className="text-xs text-echo-textMuted text-right">{form.description.length}/300</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-echo-textMuted">Description longue</label>
                                <textarea
                                    name="description_long"
                                    value={form.description_long}
                                    onChange={handleInputChange}
                                    className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 min-h-[120px]"
                                />
                            </div>

                            {/* Logo */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-echo-textMuted">Logo</label>
                                <label className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-md cursor-pointer hover:bg-white/10 transition-colors">
                                    <Upload size={16} className="text-echo-textMuted" />
                                    <span className="text-sm text-echo-textMuted">
                                        {newLogo ? newLogo.name : (partner.logo_url ? 'Remplacer le logo' : 'Ajouter un logo')}
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewLogo(e.target.files?.[0] || null)} />
                                </label>
                            </div>

                            {/* Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                    <MapPin size={16} className="text-echo-gold" /> Localisation
                                </h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={(e) => handleAddressSearch(e.target.value)}
                                        placeholder="Rechercher une adresse..."
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    />
                                    {addressSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-echo-darker border border-white/10 rounded-md shadow-xl overflow-hidden z-50">
                                            {addressSuggestions.map((s, i) => (
                                                <button key={i} type="button" onClick={() => selectAddress(s)}
                                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 border-b border-white/5 last:border-0">
                                                    {s.display_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Ville" name="city" value={form.city} onChange={handleInputChange} />
                                    <Input label="Code postal" name="postal_code" value={form.postal_code} onChange={handleInputChange} />
                                </div>
                                {form.latitude !== 0 && (
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> GPS : {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                                    </p>
                                )}
                            </div>

                            {/* Contact */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                    <Phone size={16} className="text-echo-gold" /> Contact & Liens
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Téléphone" name="contact_phone" value={form.contact_phone} onChange={handleInputChange}
                                        className="pl-3" />
                                    <Input label="Site Web" name="website_url" value={form.website_url} onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <Input placeholder="LinkedIn" name="linkedin_url" value={form.linkedin_url} onChange={handleInputChange} />
                                    <Input placeholder="Instagram" name="instagram_url" value={form.instagram_url} onChange={handleInputChange} />
                                    <Input placeholder="X (Twitter)" name="twitter_url" value={form.twitter_url} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Save */}
                            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                {saveSuccess && (
                                    <p className="text-green-400 text-sm flex items-center gap-1">
                                        <CheckCircle2 size={14} /> Modifications enregistrées
                                    </p>
                                )}
                                <div className="ml-auto">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        <Save size={16} className="mr-2" />
                                        {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
