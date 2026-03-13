import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, RefreshCw, ArrowLeft, Trash2, X,
    Brain, Share2, Clock, AlertTriangle, CheckCircle2,
    XCircle, Users, MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CANDIDATURES_API } from '../config/api';

type CandidatureStatus = 'pending' | 'entretien' | 'accepted' | 'rejected';

interface TechCandidature {
    id: string;
    name: string;
    email: string;
    project: 'cognisphere' | 'echolink';
    skills: string;
    message: string;
    status: CandidatureStatus;
    status_note?: string;
    ip_address?: string;
    created_at: string;
    updated_at?: string;
}

type ProjectFilter = 'all' | 'cognisphere' | 'echolink';
type StatusFilter = 'all' | CandidatureStatus;

const projectConfig = {
    cognisphere: { label: 'CogniSphère', color: '#A78BFA', icon: <Brain size={14} /> },
    echolink: { label: 'ECHOLink', color: '#60A5FA', icon: <Share2 size={14} /> },
};

const statusConfig: Record<CandidatureStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'En attente', color: '#F59E0B', icon: <Clock size={14} /> },
    entretien: { label: 'Entretien', color: '#3B82F6', icon: <Users size={14} /> },
    accepted: { label: 'Acceptée', color: '#10B981', icon: <CheckCircle2 size={14} /> },
    rejected: { label: 'Rejetée', color: '#EF4444', icon: <XCircle size={14} /> },
};

function StatusBadge({ status }: { status: CandidatureStatus }) {
    const config = statusConfig[status] || statusConfig.pending;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
            style={{
                color: config.color,
                borderColor: `${config.color}40`,
                backgroundColor: `${config.color}15`,
            }}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

export default function AdminCandidatures() {
    const [candidatures, setCandidatures] = useState<TechCandidature[]>([]);
    const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selected, setSelected] = useState<TechCandidature | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [statusNote, setStatusNote] = useState('');

    const fetchCandidatures = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (projectFilter !== 'all') params.set('project', projectFilter);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            const res = await fetch(`${CANDIDATURES_API}/admin/all?${params}`, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                setError('Accès refusé.');
                return;
            }
            if (!res.ok) throw new Error('Erreur serveur');
            const data = await res.json();
            setCandidatures(data);
            setCheckedIds(new Set());
        } catch {
            setError('Impossible de charger les candidatures.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidatures();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectFilter, statusFilter]);

    const handleStatusUpdate = async (id: string, status: CandidatureStatus, note?: string) => {
        setActionLoading(true);
        try {
            const body: Record<string, unknown> = { status };
            if (note) body.status_note = note;
            const res = await fetch(`${CANDIDATURES_API}/admin/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setCandidatures(prev => prev.map(c =>
                    c.id === id ? { ...c, status, status_note: note || c.status_note } : c
                ));
                if (selected?.id === id) {
                    setSelected(prev => prev ? { ...prev, status, status_note: note || prev.status_note } : null);
                }
                setStatusNote('');
            }
        } catch {
            // silent
        } finally {
            setActionLoading(false);
        }
    };

    const handleBatchStatus = async (status: CandidatureStatus) => {
        if (checkedIds.size === 0) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${CANDIDATURES_API}/admin/batch-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids: Array.from(checkedIds), status }),
            });
            if (res.ok) {
                setCandidatures(prev => prev.map(c =>
                    checkedIds.has(c.id) ? { ...c, status } : c
                ));
                setCheckedIds(new Set());
            }
        } catch {
            // silent
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${CANDIDATURES_API}/admin/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setCandidatures(prev => prev.filter(c => c.id !== id));
                setSelected(null);
                setDeleteConfirm(null);
            }
        } catch {
            // silent
        } finally {
            setActionLoading(false);
        }
    };

    const toggleCheck = (id: string) => {
        setCheckedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (checkedIds.size === candidatures.length) {
            setCheckedIds(new Set());
        } else {
            setCheckedIds(new Set(candidatures.map(c => c.id)));
        }
    };

    const projectFilters: { key: ProjectFilter; label: string }[] = [
        { key: 'all', label: 'Tous projets' },
        { key: 'cognisphere', label: 'CogniSphère' },
        { key: 'echolink', label: 'ECHOLink' },
    ];

    const statusFilters: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: 'Tous statuts' },
        { key: 'pending', label: 'En attente' },
        { key: 'entretien', label: 'Entretien' },
        { key: 'accepted', label: 'Acceptées' },
        { key: 'rejected', label: 'Rejetées' },
    ];

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-echo-textMuted hover:text-echo-gold transition-colors mb-6">
                    <ArrowLeft size={16} />
                    Retour au dashboard
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-echo-gold/20 rounded-lg">
                            <FileText className="text-echo-gold" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white">Candidatures techniques</h1>
                            <p className="text-sm text-echo-textMuted">
                                {candidatures.length} candidature{candidatures.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchCandidatures}
                        className="p-2 text-echo-textMuted hover:text-echo-gold transition-colors"
                        title="Rafraîchir"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {projectFilters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setProjectFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                projectFilter === f.key
                                    ? 'bg-echo-gold/20 text-echo-gold border border-echo-gold/30'
                                    : 'bg-white/5 text-echo-textMuted border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                    {statusFilters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === f.key
                                    ? 'bg-white/15 text-white border border-white/20'
                                    : 'bg-white/5 text-echo-textMuted border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Batch Action Bar */}
                {checkedIds.size > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-3 bg-echo-gold/10 border border-echo-gold/20 rounded-xl">
                        <span className="text-sm text-echo-gold font-medium">
                            {checkedIds.size} sélectionnée{checkedIds.size > 1 ? 's' : ''}
                        </span>
                        <div className="flex flex-wrap gap-2 sm:ml-auto">
                            <Button
                                variant="outline"
                                onClick={() => handleBatchStatus('entretien')}
                                disabled={actionLoading}
                                className="!text-blue-400 !border-blue-400/30 text-xs px-3 py-1"
                            >
                                <Users size={14} className="mr-1" />
                                Convoquer en entretien
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleBatchStatus('accepted')}
                                disabled={actionLoading}
                                className="!text-green-400 !border-green-400/30 text-xs px-3 py-1"
                            >
                                <CheckCircle2 size={14} className="mr-1" />
                                Accepter
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleBatchStatus('rejected')}
                                disabled={actionLoading}
                                className="!text-red-400 !border-red-400/30 text-xs px-3 py-1"
                            >
                                <XCircle size={14} className="mr-1" />
                                Rejeter
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Table */}
                {!error && (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={candidatures.length > 0 && checkedIds.size === candidatures.length}
                                            onChange={toggleAll}
                                            className="accent-echo-gold"
                                        />
                                    </th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Nom</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Projet</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Statut</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden md:table-cell">Compétences</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-echo-textMuted py-12">
                                            <RefreshCw size={20} className="animate-spin inline mr-2" />
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : candidatures.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-echo-textMuted py-12">
                                            Aucune candidature pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    candidatures.map(c => {
                                        const pConfig = projectConfig[c.project];
                                        return (
                                            <tr
                                                key={c.id}
                                                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedIds.has(c.id)}
                                                        onChange={() => toggleCheck(c.id)}
                                                        className="accent-echo-gold"
                                                    />
                                                </td>
                                                <td className="px-4 py-3" onClick={() => setSelected(c)}>
                                                    <div className="text-sm text-white font-medium">{c.name}</div>
                                                    <div className="text-xs text-echo-textMuted">{c.email}</div>
                                                </td>
                                                <td className="px-4 py-3" onClick={() => setSelected(c)}>
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                                                        style={{
                                                            color: pConfig.color,
                                                            borderColor: `${pConfig.color}40`,
                                                            backgroundColor: `${pConfig.color}15`,
                                                        }}
                                                    >
                                                        {pConfig.icon}
                                                        {pConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3" onClick={() => setSelected(c)}>
                                                    <StatusBadge status={c.status || 'pending'} />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted max-w-[180px] truncate hidden md:table-cell" onClick={() => setSelected(c)}>
                                                    {c.skills}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted whitespace-nowrap" onClick={() => setSelected(c)}>
                                                    <Clock size={12} className="inline mr-1" />
                                                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Detail Modal */}
                {selected && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setSelected(null); setDeleteConfirm(null); setStatusNote(''); }}>
                        <div
                            className="bg-echo-dark border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-serif text-white">{selected.name}</h2>
                                    <p className="text-sm text-echo-textMuted mt-1">{selected.email}</p>
                                </div>
                                <button onClick={() => { setSelected(null); setDeleteConfirm(null); setStatusNote(''); }} className="p-1 text-echo-textMuted hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-4">
                                {(() => {
                                    const config = projectConfig[selected.project];
                                    return (
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                                            style={{
                                                color: config.color,
                                                borderColor: `${config.color}40`,
                                                backgroundColor: `${config.color}15`,
                                            }}
                                        >
                                            {config.icon}
                                            {config.label}
                                        </span>
                                    );
                                })()}
                                <StatusBadge status={selected.status || 'pending'} />
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-echo-textMuted mb-6">
                                <Clock size={14} />
                                <span>Soumise le {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Status Note (if exists) */}
                            {selected.status_note && (
                                <div className="mb-6 p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                                    <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium mb-1">
                                        <MessageSquare size={12} />
                                        Note admin
                                    </div>
                                    <p className="text-sm text-echo-textMuted">{selected.status_note}</p>
                                </div>
                            )}

                            {/* Skills */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white mb-2">Compétences</h3>
                                <p className="text-sm text-echo-textMuted bg-white/5 border border-white/10 rounded-lg p-4 whitespace-pre-wrap">
                                    {selected.skills}
                                </p>
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white mb-2">Message</h3>
                                <p className="text-sm text-echo-textMuted bg-white/5 border border-white/10 rounded-lg p-4 whitespace-pre-wrap">
                                    {selected.message}
                                </p>
                            </div>

                            {/* Status Note Input */}
                            <div className="mb-4">
                                <label className="text-xs text-echo-textMuted block mb-1">Note (optionnelle)</label>
                                <textarea
                                    value={statusNote}
                                    onChange={e => setStatusNote(e.target.value)}
                                    placeholder="Commentaire sur cette candidature..."
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-echo-textMuted/50 resize-none focus:outline-none focus:border-echo-gold/40"
                                    rows={2}
                                />
                            </div>

                            {/* Status Actions */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selected.status !== 'entretien' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selected.id, 'entretien', statusNote || undefined)}
                                        disabled={actionLoading}
                                        className="!text-blue-400 !border-blue-400/30 text-sm"
                                    >
                                        <Users size={14} className="mr-1.5" />
                                        Convoquer en entretien
                                    </Button>
                                )}
                                {selected.status !== 'accepted' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selected.id, 'accepted', statusNote || undefined)}
                                        disabled={actionLoading}
                                        className="!text-green-400 !border-green-400/30 text-sm"
                                    >
                                        <CheckCircle2 size={14} className="mr-1.5" />
                                        Accepter
                                    </Button>
                                )}
                                {selected.status !== 'rejected' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selected.id, 'rejected', statusNote || undefined)}
                                        disabled={actionLoading}
                                        className="!text-red-400 !border-red-400/30 text-sm"
                                    >
                                        <XCircle size={14} className="mr-1.5" />
                                        Rejeter
                                    </Button>
                                )}
                                {selected.status !== 'pending' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selected.id, 'pending', statusNote || undefined)}
                                        disabled={actionLoading}
                                        className="!text-yellow-400 !border-yellow-400/30 text-sm"
                                    >
                                        <Clock size={14} className="mr-1.5" />
                                        Remettre en attente
                                    </Button>
                                )}
                            </div>

                            {/* Bottom Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <a
                                    href={`mailto:${selected.email}?subject=Candidature ${projectConfig[selected.project].label} — Mouvement ECHO`}
                                    className="text-sm text-echo-gold hover:underline"
                                >
                                    Répondre par email
                                </a>

                                {deleteConfirm === selected.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-red-400">Confirmer ?</span>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDelete(selected.id)}
                                            disabled={actionLoading}
                                            className="!text-red-400 !border-red-400/30 text-xs px-3 py-1"
                                        >
                                            {actionLoading ? 'Suppression...' : 'Oui, supprimer'}
                                        </Button>
                                        <button onClick={() => setDeleteConfirm(null)} className="text-xs text-echo-textMuted hover:text-white">
                                            Annuler
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(selected.id)}
                                        className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
