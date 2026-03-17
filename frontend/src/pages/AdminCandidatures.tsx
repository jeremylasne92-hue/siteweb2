import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUrlFilters } from '../hooks/useUrlFilters';
import {
    FileText, RefreshCw, ArrowLeft, Trash2, X,
    Brain, Share2, Clock, AlertTriangle, CheckCircle2,
    XCircle, Users, MessageSquare, PenTool, ExternalLink, Search,
    ArrowUpDown, ChevronUp, ChevronDown, Pencil, Save
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CANDIDATURES_API } from '../config/api';
import { isValidEmail, parse422Detail } from '../utils/validation';

type CandidatureStatus = 'pending' | 'entretien' | 'accepted' | 'rejected';

interface TechCandidature {
    id: string;
    name: string;
    email: string;
    project: 'cognisphere' | 'echolink' | 'scenariste';
    skills: string;
    message: string;
    status: CandidatureStatus;
    status_note?: string;
    admin_notes?: string;
    portfolio_url?: string;
    creative_interests?: string;
    experience_level?: string;
    ip_address?: string;
    created_at: string;
    updated_at?: string;
}

type ProjectFilter = 'all' | 'cognisphere' | 'echolink' | 'scenariste';
type StatusFilter = 'all' | CandidatureStatus;

const projectConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    cognisphere: { label: 'CogniSphère', color: '#A78BFA', icon: <Brain size={14} /> },
    echolink: { label: 'ECHOLink', color: '#60A5FA', icon: <Share2 size={14} /> },
    scenariste: { label: 'Scénariste', color: '#F59E0B', icon: <PenTool size={14} /> },
};

const experienceLabelMap: Record<string, string> = {
    professional: 'Professionnel',
    student: 'Étudiant·e',
    self_taught: 'Autodidacte',
    motivated: 'Motivé·e',
};

const statusConfig: Record<CandidatureStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'En attente', color: '#F59E0B', icon: <Clock size={14} /> },
    entretien: { label: 'Entretien', color: '#3B82F6', icon: <Users size={14} /> },
    accepted: { label: 'Acceptée', color: '#10B981', icon: <CheckCircle2 size={14} /> },
    rejected: { label: 'Rejetée', color: '#EF4444', icon: <XCircle size={14} /> },
};

const getDaysSince = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "hier";
    return `${days}j`;
};

function StatusBadge({ status, createdAt }: { status: CandidatureStatus; createdAt?: string }) {
    const config = statusConfig[status] || statusConfig.pending;
    const showDuration = createdAt && (status === 'pending' || status === 'entretien');
    // eslint-disable-next-line react-hooks/purity -- Date.now() is acceptable here; value only matters at mount time
    const days = useMemo(() => createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0, [createdAt]);
    const isWarning = (status === 'pending' && days > 7) || (status === 'entretien' && days > 14);
    return (
        <div className="flex flex-col gap-0.5">
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
            {showDuration && (
                <span className={`text-xs ${isWarning ? 'text-amber-400' : 'text-echo-textMuted'}`}>
                    depuis {getDaysSince(createdAt)}
                </span>
            )}
        </div>
    );
}

export default function AdminCandidatures() {
    const [candidatures, setCandidatures] = useState<TechCandidature[]>([]);
    const FILTER_DEFAULTS = useMemo(() => ({ project: 'all' as string, status: 'all' as string, experience: 'all' as string }), []);
    const [urlFilters, setUrlFilter] = useUrlFilters(FILTER_DEFAULTS);
    const projectFilter = urlFilters.project as ProjectFilter;
    const statusFilter = urlFilters.status as StatusFilter;
    const experienceFilter = urlFilters.experience;
    const [selected, setSelected] = useState<TechCandidature | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [statusNote, setStatusNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState<Partial<TechCandidature>>({});
    const [sortField, setSortField] = useState<string>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

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
        if (!window.confirm("Supprimer cette candidature ? Cette action est irréversible.")) return;
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

    const [editError, setEditError] = useState('');

    const handleEditSave = async () => {
        if (!selected) return;
        setEditError('');

        // Validate email before sending
        const emailValue = editForm.email as string | undefined;
        if (emailValue && !isValidEmail(emailValue)) {
            setEditError('Adresse email invalide.');
            return;
        }

        setActionLoading(true);
        try {
            const body: Record<string, unknown> = {};
            if (editForm.name !== undefined && editForm.name !== selected.name) body.name = editForm.name;
            if (editForm.email !== undefined && editForm.email !== selected.email) body.email = editForm.email;
            if (editForm.project !== undefined && editForm.project !== selected.project) body.project = editForm.project;
            if (editForm.skills !== undefined && editForm.skills !== selected.skills) body.skills = editForm.skills;
            if (editForm.message !== undefined && editForm.message !== selected.message) body.message = editForm.message;
            if (editForm.portfolio_url !== undefined && editForm.portfolio_url !== (selected.portfolio_url || '')) body.portfolio_url = editForm.portfolio_url || null;
            if (editForm.creative_interests !== undefined && editForm.creative_interests !== (selected.creative_interests || '')) body.creative_interests = editForm.creative_interests || null;
            if (editForm.experience_level !== undefined && editForm.experience_level !== (selected.experience_level || '')) body.experience_level = editForm.experience_level || null;

            if (Object.keys(body).length === 0) {
                setEditMode(false);
                return;
            }
            const res = await fetch(`${CANDIDATURES_API}/admin/${selected.id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const updated = { ...selected, ...body } as TechCandidature;
                setSelected(updated);
                setCandidatures(prev => prev.map(c => c.id === selected.id ? updated : c));
                setEditMode(false);
            } else {
                const errData = await res.json().catch(() => null);
                const detail = errData?.detail ? parse422Detail(errData.detail) : 'Impossible de sauvegarder.';
                setEditError(`Erreur ${res.status}: ${detail}`);
            }
        } catch {
            setEditError('Erreur réseau.');
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
        { key: 'scenariste', label: 'Scénaristes' },
    ];

    const statusFilters: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: 'Tous statuts' },
        { key: 'pending', label: 'En attente' },
        { key: 'entretien', label: 'Entretien' },
        { key: 'accepted', label: 'Acceptées' },
        { key: 'rejected', label: 'Rejetées' },
    ];

    const experienceFilters: { key: string; label: string }[] = [
        { key: 'all', label: 'Tous niveaux' },
        { key: 'professional', label: 'Professionnel' },
        { key: 'student', label: 'Étudiant·e' },
        { key: 'self_taught', label: 'Autodidacte' },
        { key: 'motivated', label: 'Motivé·e' },
    ];

    const filteredCandidatures = candidatures.filter(c => {
        if (experienceFilter !== 'all' && c.experience_level !== experienceFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
        }
        return true;
    });

    const sortedCandidatures = [...filteredCandidatures].sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? '';
        const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? '';
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : ((aVal as number) > (bVal as number) ? 1 : -1);
        return sortDirection === 'asc' ? cmp : -cmp;
    });

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
                                {filteredCandidatures.length} candidature{filteredCandidatures.length !== 1 ? 's' : ''}{experienceFilter !== 'all' ? ` (${candidatures.length} total)` : ''}
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
                            onClick={() => setUrlFilter('project',f.key)}
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
                <div className="flex flex-wrap gap-2 mb-4">
                    {statusFilters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setUrlFilter('status',f.key)}
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
                <div className="flex flex-wrap gap-2 mb-4">
                    {experienceFilters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setUrlFilter('experience',f.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                experienceFilter === f.key
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-white/5 text-echo-textMuted border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-echo-textMuted" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-echo-textMuted/50 focus:border-echo-gold/40 focus:outline-none"
                    />
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
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 cursor-pointer select-none hover:text-echo-gold transition-colors" onClick={() => handleSort('name')}>
                                        <span className="inline-flex items-center gap-1">
                                            Nom
                                            {sortField === 'name' ? (
                                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </span>
                                    </th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 cursor-pointer select-none hover:text-echo-gold transition-colors" onClick={() => handleSort('project')}>
                                        <span className="inline-flex items-center gap-1">
                                            Projet
                                            {sortField === 'project' ? (
                                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </span>
                                    </th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 cursor-pointer select-none hover:text-echo-gold transition-colors" onClick={() => handleSort('status')}>
                                        <span className="inline-flex items-center gap-1">
                                            Statut
                                            {sortField === 'status' ? (
                                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </span>
                                    </th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden md:table-cell">Compétences</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 cursor-pointer select-none hover:text-echo-gold transition-colors" onClick={() => handleSort('created_at')}>
                                        <span className="inline-flex items-center gap-1">
                                            Date
                                            {sortField === 'created_at' ? (
                                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </span>
                                    </th>
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
                                ) : sortedCandidatures.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-echo-textMuted py-12">
                                            Aucune candidature pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedCandidatures.map(c => {
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
                                                    <StatusBadge status={c.status || 'pending'} createdAt={c.created_at} />
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
                                <div className="flex items-center gap-2">
                                    {!editMode && (
                                        <button
                                            onClick={() => {
                                                setEditMode(true);
                                                setEditForm({
                                                    name: selected.name,
                                                    email: selected.email,
                                                    project: selected.project,
                                                    skills: selected.skills,
                                                    message: selected.message,
                                                    portfolio_url: selected.portfolio_url || '',
                                                    creative_interests: selected.creative_interests || '',
                                                    experience_level: selected.experience_level || '',
                                                    admin_notes: selected.admin_notes || '',
                                                });
                                            }}
                                            className="p-1.5 text-echo-textMuted hover:text-echo-gold transition-colors"
                                            title="Modifier"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => { setSelected(null); setDeleteConfirm(null); setStatusNote(''); setEditMode(false); }} className="p-1 text-echo-textMuted hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {editMode ? (
                                <>
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Nom</label>
                                            <input type="text" value={(editForm.name as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Email</label>
                                            <input type="email" value={(editForm.email as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Projet</label>
                                            <select value={(editForm.project as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, project: e.target.value as TechCandidature['project'] }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40">
                                                <option value="cognisphere">CogniSphère</option>
                                                <option value="echolink">ECHOLink</option>
                                                <option value="scenariste">Scénariste</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Compétences</label>
                                            <input type="text" value={(editForm.skills as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Niveau d&apos;expérience</label>
                                            <select value={(editForm.experience_level as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, experience_level: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40">
                                                <option value="">-- Aucun --</option>
                                                <option value="professional">Professionnel</option>
                                                <option value="student">Étudiant</option>
                                                <option value="self_taught">Autodidacte</option>
                                                <option value="motivated">Motivé</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Portfolio URL</label>
                                            <input type="text" value={(editForm.portfolio_url as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, portfolio_url: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Thématiques</label>
                                            <input type="text" value={(editForm.creative_interests as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, creative_interests: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Message</label>
                                            <textarea value={(editForm.message as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, message: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-echo-gold/40" rows={4} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Notes admin (internes)</label>
                                            <textarea value={(editForm.admin_notes as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, admin_notes: e.target.value }))} placeholder="Notes visibles uniquement par les admins..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-echo-gold/40 placeholder-neutral-500" rows={3} />
                                        </div>
                                    </div>
                                    {editError && (
                                        <p className="text-sm text-red-400 mt-2">{editError}</p>
                                    )}
                                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                                        <Button variant="outline" onClick={handleEditSave} disabled={actionLoading} className="!text-echo-gold !border-echo-gold/30 text-sm">
                                            <Save size={14} className="mr-1.5" />
                                            {actionLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                                        </Button>
                                        <button onClick={() => { setEditMode(false); setEditError(''); }} className="px-3 py-1.5 text-sm text-echo-textMuted hover:text-white transition-colors">
                                            Annuler
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
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
                                <StatusBadge status={selected.status || 'pending'} createdAt={selected.created_at} />
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

                            {/* Admin Notes (if exists) */}
                            {selected.admin_notes && (
                                <div className="mb-6 p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
                                        <MessageSquare size={12} />
                                        Notes internes
                                    </div>
                                    <p className="text-sm text-echo-textMuted whitespace-pre-wrap">{selected.admin_notes}</p>
                                </div>
                            )}

                            {/* Skills */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white mb-2">Compétences</h3>
                                <p className="text-sm text-echo-textMuted bg-white/5 border border-white/10 rounded-lg p-4 whitespace-pre-wrap">
                                    {selected.skills}
                                </p>
                            </div>

                            {/* Portfolio URL (scenariste) */}
                            {selected.portfolio_url && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-white mb-2">Portfolio</h3>
                                    <a
                                        href={selected.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-echo-gold hover:underline bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                                    >
                                        <ExternalLink size={14} />
                                        {selected.portfolio_url}
                                    </a>
                                </div>
                            )}

                            {/* Creative Interests / Thématiques (scenariste) */}
                            {selected.creative_interests && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-white mb-2">Thématiques</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.creative_interests.split(',').map((interest, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                            >
                                                {interest.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experience Level */}
                            {selected.experience_level && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-white mb-2">Niveau d&apos;expérience</h3>
                                    <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20">
                                        {experienceLabelMap[selected.experience_level] || selected.experience_level}
                                    </span>
                                </div>
                            )}

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
                                    href={`mailto:${selected.email}?subject=Candidature ${projectConfig[selected.project]?.label ?? selected.project} — Mouvement ECHO`}
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
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
