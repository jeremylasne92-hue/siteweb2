import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import {
    CheckCircle2, XCircle, Star, StarOff, Eye, Clock,
    Shield, Users, Filter, RefreshCw, AlertTriangle
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
    category: PartnerCategory;
    thematics: string[];
    city: string;
    country: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    website_url?: string;
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

export default function AdminPartners() {
    const [partners, setPartners] = useState<AdminPartner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'all'>('all');
    const [rejectModalId, setRejectModalId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const token = localStorage.getItem('token') || '';

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            if (!token) {
                setAuthError(true);
                return;
            }
            const url = statusFilter === 'all'
                ? `${API_BASE}/admin/all`
                : `${API_BASE}/admin/all?status=${statusFilter}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                setAuthError(true);
                return;
            }
            if (res.ok) {
                setPartners(await res.json());
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
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
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
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                    'Content-Type': 'application/json'
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
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
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
                                        <tr key={partner.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
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
                                                    onClick={() => handleToggleFeature(partner.id, !partner.is_featured)}
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
                                                    {partner.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(partner.id)}
                                                                disabled={actionLoading === partner.id}
                                                                className="p-1.5 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                                                title="Approuver"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectModalId(partner.id)}
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
