import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import {
    CheckCircle2, XCircle, Star, StarOff, Clock,
    Shield, Users, RefreshCw, AlertTriangle,
    Globe, Phone, ExternalLink, MapPin, Calendar, Eye, Pencil, EyeOff, RotateCcw, Save,
    X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../components/ui/Button';
import type { PartnerCategory } from '../components/partners/PartnerCard';
import { PARTNERS_API } from '../config/api';

const API_BASE = PARTNERS_API;

type PartnerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

interface AdminPartner {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    description: string;
    description_long?: string;
    category: PartnerCategory;
    thematics: string[];
    city: string;
    country: string;
    address?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    contact_role?: string;
    website_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    status: PartnerStatus;
    is_featured: boolean;
    created_at: string;
    validated_at?: string;
    rejection_reason?: string;
}

const statusConfig: Record<PartnerStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'En attente', color: '#F59E0B', icon: <Clock size={14} /> },
    approved: { label: 'Approuvé', color: '#10B981', icon: <CheckCircle2 size={14} /> },
    rejected: { label: 'Refusé', color: '#EF4444', icon: <XCircle size={14} /> },
    suspended: { label: 'Suspendu', color: '#6B7280', icon: <AlertTriangle size={14} /> },
};

const categoryLabels: Record<PartnerCategory, string> = {
    expert: 'Expert',
    financier: 'Financier',
    audiovisuel: 'Audiovisuel',
    education: 'Éducation',
    membre: 'Membre',
};

/* Partner Detail Modal */

function AdminPartnerDetail({
    partner,
    onClose,
    onApprove,
    onReject,
    onToggleFeature,
    onSuspend,
    onEdit,
    actionLoading,
}: {
    partner: AdminPartner;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onToggleFeature: (id: string, featured: boolean) => void;
    onSuspend: (id: string) => void;
    onEdit: (id: string, data: Record<string, unknown>) => void;
    actionLoading: string | null;
}) {
    const status = statusConfig[partner.status];

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Record<string, string>>({});

    const startEditing = () => {
        setEditData({
            name: partner.name || '',
            description: partner.description || '',
            description_long: partner.description_long || '',
            category: partner.category || '',
            contact_name: partner.contact_name || '',
            contact_email: partner.contact_email || '',
            contact_phone: partner.contact_phone || '',
            contact_role: partner.contact_role || '',
            address: partner.address || '',
            city: partner.city || '',
            postal_code: partner.postal_code || '',
            website_url: partner.website_url || '',
            linkedin_url: partner.linkedin_url || '',
            instagram_url: partner.instagram_url || '',
            twitter_url: partner.twitter_url || '',
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        const changes: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(editData)) {
            if (value !== (partner as AdminPartner & Record<string, unknown>)[key] && value !== '') {
                changes[key] = value;
            }
        }
        if (Object.keys(changes).length > 0) {
            onEdit(partner.id, changes);
        }
        setIsEditing(false);
    };

    const updateField = (field: string, value: string) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-echo-darker border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-echo-textMuted hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Status banner */}
                <div
                    className="px-6 py-3 flex items-center gap-3 border-b border-white/10"
                    style={{ backgroundColor: `${status.color}15` }}
                >
                    <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                        style={{
                            color: status.color,
                            borderColor: `${status.color}40`,
                            backgroundColor: `${status.color}15`,
                        }}
                    >
                        {status.icon}
                        {status.label}
                    </span>
                    <span className="text-xs text-echo-textMuted flex items-center gap-1">
                        <Calendar size={12} />
                        Inscrit le {new Date(partner.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {partner.validated_at && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Validé le {new Date(partner.validated_at).toLocaleDateString('fr-FR')}
                        </span>
                    )}
                    {partner.rejection_reason && (
                        <span className="text-xs text-red-400">
                            Motif : {partner.rejection_reason}
                        </span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={startEditing}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-echo-textMuted hover:bg-white/10 hover:text-white text-xs transition-colors"
                            >
                                <Pencil size={12} />
                                Éditer
                            </button>
                        )}
                        {isEditing && (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={actionLoading === partner.id}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-600/80 text-white hover:bg-green-600 text-xs transition-colors disabled:opacity-50"
                                >
                                    <Save size={12} />
                                    Sauvegarder
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-echo-textMuted hover:bg-white/10 text-xs transition-colors"
                                >
                                    Annuler
                                </button>
                            </>
                        )}
                        {(partner.status === 'approved' || partner.status === 'suspended') && !isEditing && (
                            <button
                                onClick={() => onSuspend(partner.id)}
                                disabled={actionLoading === partner.id}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors disabled:opacity-50",
                                    partner.status === 'suspended'
                                        ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                        : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
                                )}
                            >
                                {partner.status === 'suspended'
                                    ? <><RotateCcw size={12} /> Réactiver</>
                                    : <><EyeOff size={12} /> Masquer</>
                                }
                            </button>
                        )}
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-col md:flex-row overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Left column — Identity */}
                    <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-white/10 space-y-6">
                        {/* Logo + Name */}
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-2xl font-serif text-echo-gold overflow-hidden">
                                {partner.logo_url
                                    ? <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-cover" />
                                    : partner.name.charAt(0)
                                }
                            </div>
                            {isEditing ? (
                                <input
                                    value={editData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full text-center text-lg font-serif text-white bg-white/5 border border-white/10 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                />
                            ) : (
                                <h2 className="text-lg font-serif text-white">{partner.name}</h2>
                            )}
                            <span className="inline-block mt-1 px-2 py-0.5 bg-echo-gold/10 text-echo-gold text-xs rounded-full">
                                {categoryLabels[partner.category] || partner.category}
                            </span>
                        </div>

                        {/* Thematics */}
                        {partner.thematics.length > 0 && (
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-echo-textMuted mb-2">Thématiques</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {partner.thematics.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-echo-textMuted">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Referent */}
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-echo-textMuted mb-2">Référent</h4>
                            {isEditing ? (
                                <input
                                    value={editData.contact_name}
                                    onChange={(e) => updateField('contact_name', e.target.value)}
                                    className="w-full text-sm text-white bg-white/5 border border-white/10 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                />
                            ) : (
                                <p className="text-sm text-white">{partner.contact_name}</p>
                            )}
                            {partner.contact_role && (
                                <p className="text-xs text-echo-textMuted">{partner.contact_role}</p>
                            )}
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-echo-textMuted mb-2">Contact</h4>
                            <div className="space-y-1.5">
                                <a
                                    href={`mailto:${partner.contact_email}`}
                                    className="flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold transition-colors"
                                >
                                    <span className="text-xs">✉</span>
                                    {isEditing ? (
                                        <input
                                            value={editData.contact_email}
                                            onChange={(e) => updateField('contact_email', e.target.value)}
                                            className="flex-1 text-sm text-white bg-white/5 border border-white/10 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                        />
                                    ) : (
                                        partner.contact_email
                                    )}
                                </a>
                                {partner.contact_phone && (
                                    <a
                                        href={`tel:${partner.contact_phone}`}
                                        className="flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold transition-colors"
                                    >
                                        <Phone size={12} />
                                        {partner.contact_phone}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Links */}
                        {(partner.website_url || partner.linkedin_url || partner.instagram_url || partner.twitter_url) && (
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-echo-textMuted mb-2">Liens</h4>
                                <div className="space-y-1.5">
                                    {partner.website_url && (
                                        <a href={partner.website_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold transition-colors">
                                            <Globe size={12} /> Site web <ExternalLink size={10} className="ml-auto opacity-50" />
                                        </a>
                                    )}
                                    {partner.linkedin_url && (
                                        <a href={partner.linkedin_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold transition-colors">
                                            <Globe size={12} /> LinkedIn <ExternalLink size={10} className="ml-auto opacity-50" />
                                        </a>
                                    )}
                                    {partner.instagram_url && (
                                        <a href={partner.instagram_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold transition-colors">
                                            <Globe size={12} /> Instagram <ExternalLink size={10} className="ml-auto opacity-50" />
                                        </a>
                                    )}
                                    {partner.twitter_url && (
                                        <a href={partner.twitter_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold transition-colors">
                                            <Globe size={12} /> X / Twitter <ExternalLink size={10} className="ml-auto opacity-50" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column — Details + Admin */}
                    <div className="w-full md:w-2/3 p-6 space-y-6">
                        {/* About */}
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-echo-textMuted mb-2">À propos</h4>
                            {isEditing ? (
                                <textarea
                                    value={editData.description_long || editData.description}
                                    onChange={(e) => updateField('description_long', e.target.value)}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 min-h-[100px]"
                                />
                            ) : (
                                <p className="text-sm text-echo-textMuted leading-relaxed whitespace-pre-line">
                                    {partner.description_long || partner.description}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-echo-textMuted mb-2 flex items-center gap-1.5">
                                <MapPin size={12} />
                                Localisation
                            </h4>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                {partner.address && (
                                    <p className="text-sm text-white">{partner.address}</p>
                                )}
                                <p className="text-sm text-echo-textMuted">
                                    {[partner.postal_code, partner.city].filter(Boolean).join(' ')}
                                    {partner.country && partner.country !== 'France' && `, ${partner.country}`}
                                </p>
                                {partner.latitude != null && partner.longitude != null && (
                                    <p className="text-xs text-echo-textMuted/50 mt-1">
                                        GPS : {partner.latitude.toFixed(4)}, {partner.longitude.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Featured toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onToggleFeature(partner.id, !partner.is_featured)}
                                disabled={actionLoading === partner.id}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm disabled:opacity-50",
                                    partner.is_featured
                                        ? "border-echo-gold/40 bg-echo-gold/10 text-echo-gold"
                                        : "border-white/10 bg-white/5 text-echo-textMuted hover:bg-white/10"
                                )}
                            >
                                {partner.is_featured
                                    ? <><Star size={16} className="fill-echo-gold" /> Partenaire vedette</>
                                    : <><StarOff size={16} /> Mettre en vedette</>
                                }
                            </button>
                        </div>

                        {/* Action buttons */}
                        {partner.status === 'pending' && (
                            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                <Button
                                    onClick={() => onApprove(partner.id)}
                                    disabled={actionLoading === partner.id}
                                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                >
                                    <CheckCircle2 size={16} />
                                    Approuver le partenaire
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onReject(partner.id)}
                                    disabled={actionLoading === partner.id}
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                                >
                                    <XCircle size={16} />
                                    Refuser
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Main Admin Partners Page */

export default function AdminPartners() {
    const [partners, setPartners] = useState<AdminPartner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'all'>('all');
    const [rejectModalId, setRejectModalId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<AdminPartner | null>(null);

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            const url = statusFilter === 'all'
                ? `${API_BASE}/admin/all`
                : `${API_BASE}/admin/all?status=${statusFilter}`;
            const res = await fetch(url, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                setAuthError(true);
                return;
            }
            if (res.ok) {
                const data: AdminPartner[] = await res.json();
                setPartners(data);
                // Update selected partner if detail modal is open
                if (selectedPartner) {
                    const updated = data.find(p => p.id === selectedPartner.id);
                    if (updated) {
                        setSelectedPartner(updated);
                    } else {
                        setSelectedPartner(null);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch admin partners', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPartners(); }, [statusFilter]);

    const handleApprove = async (partnerId: string) => {
        setActionLoading(partnerId);
        try {
            const res = await fetch(`${API_BASE}/admin/${partnerId}/approve`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (res.ok) {
                await fetchPartners();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (partnerId: string) => {
        if (!rejectReason.trim()) return;
        setActionLoading(partnerId);
        try {
            const res = await fetch(`${API_BASE}/admin/${partnerId}/reject`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: rejectReason })
            });
            if (res.ok) {
                setRejectModalId(null);
                setRejectReason('');
                await fetchPartners();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleFeature = async (partnerId: string, featured: boolean) => {
        setActionLoading(partnerId);
        try {
            const res = await fetch(`${API_BASE}/admin/${partnerId}/feature?is_featured=${featured}`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (res.ok) {
                await fetchPartners();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSuspend = async (partnerId: string) => {
        setActionLoading(partnerId);
        try {
            const res = await fetch(`${API_BASE}/admin/${partnerId}/suspend`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (res.ok) {
                await fetchPartners();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEdit = async (partnerId: string, data: Record<string, unknown>) => {
        setActionLoading(partnerId);
        try {
            const res = await fetch(`${API_BASE}/admin/${partnerId}/edit`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await fetchPartners();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleOpenReject = (partnerId: string) => {
        setSelectedPartner(null);
        setRejectModalId(partnerId);
    };

    const counts = {
        all: partners.length,
        pending: partners.filter(p => p.status === 'pending').length,
        approved: partners.filter(p => p.status === 'approved').length,
        rejected: partners.filter(p => p.status === 'rejected').length,
    };

    if (authError) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md p-8 bg-white/5 border border-white/10 rounded-xl">
                        <Shield className="mx-auto mb-4 text-red-400" size={48} />
                        <h2 className="text-xl font-serif text-white mb-2">Accès refusé</h2>
                        <p className="text-echo-textMuted mb-4">
                            Cette page est réservée aux administrateurs. Veuillez vous connecter avec un compte administrateur.
                        </p>
                        <Button onClick={() => window.location.href = '/'}>
                            Retour à l'accueil
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-echo-dark pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-echo-gold/20 rounded-lg">
                                <Shield className="text-echo-gold" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif text-white">Gestion des Partenaires</h1>
                                <p className="text-sm text-echo-textMuted">Administration & validation des demandes</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={fetchPartners}>
                            <RefreshCw size={16} className="mr-2" /> Actualiser
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "p-4 rounded-xl border transition-all text-left",
                                    statusFilter === status
                                        ? "bg-white/10 border-echo-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {status === 'all' ? <Users size={16} className="text-white" /> : statusConfig[status].icon}
                                    <span className="text-xs uppercase tracking-wider text-echo-textMuted">
                                        {status === 'all' ? 'Tous' : statusConfig[status].label}
                                    </span>
                                </div>
                                <span className="text-2xl font-bold text-white">{counts[status]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Partenaire</th>
                                        <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Catégorie</th>
                                        <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Ville</th>
                                        <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Statut</th>
                                        <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Vedette</th>
                                        <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-echo-textMuted">Chargement...</td></tr>
                                    ) : partners.length === 0 ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-echo-textMuted">Aucun partenaire trouvé</td></tr>
                                    ) : partners.map(partner => (
                                        <tr
                                            key={partner.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => setSelectedPartner(partner)}
                                        >
                                            {/* Name & Contact */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-serif text-echo-gold shrink-0">
                                                        {partner.logo_url
                                                            ? <img src={partner.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                                            : partner.name.charAt(0)
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{partner.name}</p>
                                                        <p className="text-xs text-echo-textMuted">{partner.contact_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Category */}
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-echo-textMuted">{categoryLabels[partner.category] || partner.category}</span>
                                            </td>
                                            {/* City */}
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-echo-textMuted">{partner.city}</span>
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                                                    style={{
                                                        color: statusConfig[partner.status]?.color || '#fff',
                                                        borderColor: `${statusConfig[partner.status]?.color || '#fff'}40`,
                                                        backgroundColor: `${statusConfig[partner.status]?.color || '#fff'}15`
                                                    }}
                                                >
                                                    {statusConfig[partner.status]?.icon}
                                                    {statusConfig[partner.status]?.label || partner.status}
                                                </span>
                                            </td>
                                            {/* Featured */}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleFeature(partner.id, !partner.is_featured); }}
                                                    disabled={actionLoading === partner.id}
                                                    className="text-echo-textMuted hover:text-echo-gold transition-colors disabled:opacity-50"
                                                    title={partner.is_featured ? "Retirer de la vedette" : "Mettre en vedette"}
                                                >
                                                    {partner.is_featured
                                                        ? <Star size={18} className="fill-echo-gold text-echo-gold" />
                                                        : <StarOff size={18} />
                                                    }
                                                </button>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedPartner(partner); }}
                                                        className="p-1.5 rounded-md bg-white/5 text-echo-textMuted hover:bg-white/10 hover:text-white transition-colors"
                                                        title="Voir la fiche"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {partner.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleApprove(partner.id); }}
                                                                disabled={actionLoading === partner.id}
                                                                className="p-1.5 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                                                title="Approuver"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setRejectModalId(partner.id); }}
                                                                disabled={actionLoading === partner.id}
                                                                className="p-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                                title="Refuser"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {partner.status === 'approved' && (
                                                        <span className="text-xs text-green-500/60">✓ Actif</span>
                                                    )}
                                                    {partner.status === 'rejected' && (
                                                        <span className="text-xs text-red-500/60" title={partner.rejection_reason}>
                                                            Motif: {partner.rejection_reason?.substring(0, 30) || '—'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partner Detail Modal */}
            {selectedPartner && (
                <AdminPartnerDetail
                    partner={selectedPartner}
                    onClose={() => setSelectedPartner(null)}
                    onApprove={handleApprove}
                    onReject={handleOpenReject}
                    onToggleFeature={handleToggleFeature}
                    onSuspend={handleSuspend}
                    onEdit={handleEdit}
                    actionLoading={actionLoading}
                />
            )}

            {/* Reject Modal */}
            {rejectModalId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRejectModalId(null)} />
                    <div className="relative w-full max-w-md bg-echo-darker border border-white/10 rounded-xl shadow-2xl p-6">
                        <h3 className="text-lg font-serif text-white mb-4">Motif du refus</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Indiquez le motif du refus..."
                            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[100px] mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => { setRejectModalId(null); setRejectReason(''); }}>
                                Annuler
                            </Button>
                            <Button
                                onClick={() => handleReject(rejectModalId)}
                                disabled={!rejectReason.trim() || actionLoading === rejectModalId}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Confirmer le refus
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
