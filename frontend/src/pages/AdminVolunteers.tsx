import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart, RefreshCw, ArrowLeft, Trash2, X,
    Clock, AlertTriangle, CheckCircle2,
    XCircle, Users, MessageSquare, Download, Search,
    ArrowUpDown, ChevronUp, ChevronDown, Pencil, Save
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { API_URL } from '../config/api';

type VolunteerStatus = 'pending' | 'entretien' | 'accepted' | 'rejected';
type AvailabilityType = 'punctual' | 'regular' | 'active';

interface Volunteer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    skills: string[];
    experience_level: string;
    availability: AvailabilityType;
    motivations?: string;
    message?: string;
    status: VolunteerStatus;
    status_note?: string;
    created_at: string;
    updated_at?: string;
}

type StatusFilter = 'all' | VolunteerStatus;
type AvailabilityFilter = 'all' | AvailabilityType;

import { EXPERIENCE_LABELS as EXP_LABELS } from '../config/candidatures';

const AVAIL_LABELS: Record<string, string> = {
    punctual: 'Ponctuel',
    regular: 'Régulier',
    active: 'Moteur',
};

const statusConfig: Record<VolunteerStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'En attente', color: '#F59E0B', icon: <Clock size={14} /> },
    entretien: { label: 'Entretien', color: '#3B82F6', icon: <Users size={14} /> },
    accepted: { label: 'Accepté', color: '#10B981', icon: <CheckCircle2 size={14} /> },
    rejected: { label: 'Rejeté', color: '#EF4444', icon: <XCircle size={14} /> },
};

const availConfig: Record<AvailabilityType, { label: string; color: string }> = {
    punctual: { label: 'Ponctuel', color: '#9CA3AF' },
    regular: { label: 'Régulier', color: '#3B82F6' },
    active: { label: 'Moteur', color: '#F59E0B' },
};

const getDaysSince = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "hier";
    return `${days}j`;
};

function StatusBadge({ status, createdAt }: { status: VolunteerStatus; createdAt?: string }) {
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

function AvailBadge({ availability }: { availability: AvailabilityType }) {
    const config = availConfig[availability] || availConfig.punctual;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
            style={{
                color: config.color,
                borderColor: `${config.color}40`,
                backgroundColor: `${config.color}15`,
            }}
        >
            {config.label}
        </span>
    );
}

export default function AdminVolunteers() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
    const [selected, setSelected] = useState<Volunteer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [statusNote, setStatusNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Volunteer>>({});
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

    const fetchVolunteers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (availabilityFilter !== 'all') params.set('availability', availabilityFilter);
            const res = await fetch(`${API_URL}/volunteers/admin/all?${params}`, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                setError('Accès refusé.');
                return;
            }
            if (!res.ok) throw new Error('Erreur serveur');
            const data = await res.json();
            setVolunteers(data);
            setCheckedIds(new Set());
        } catch {
            setError('Impossible de charger les candidatures bénévoles.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, availabilityFilter]);

    const handleStatusUpdate = async (id: string, status: VolunteerStatus, note?: string) => {
        setActionLoading(true);
        try {
            const body: Record<string, unknown> = { status };
            if (note) body.status_note = note;
            const res = await fetch(`${API_URL}/volunteers/admin/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setVolunteers(prev => prev.map(v =>
                    v.id === id ? { ...v, status, status_note: note || v.status_note } : v
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

    const handleBatchStatus = async (status: VolunteerStatus) => {
        if (checkedIds.size === 0) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/volunteers/admin/batch-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids: Array.from(checkedIds), status }),
            });
            if (res.ok) {
                setVolunteers(prev => prev.map(v =>
                    checkedIds.has(v.id) ? { ...v, status } : v
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
        if (!window.confirm("Supprimer cette candidature bénévole ? Cette action est irréversible.")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/volunteers/admin/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setVolunteers(prev => prev.filter(v => v.id !== id));
                setSelected(null);
                setDeleteConfirm(null);
            }
        } catch {
            // silent
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await fetch(`${API_URL}/volunteers/admin/export`, {
                credentials: 'include',
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'benevoles-echo.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
        } catch {
            // silent
        }
    };

    const handleEditSave = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            const body: Record<string, unknown> = {};
            if (editForm.name !== undefined && editForm.name !== selected.name) body.name = editForm.name;
            if (editForm.email !== undefined && editForm.email !== selected.email) body.email = editForm.email;
            if (editForm.phone !== undefined && editForm.phone !== (selected.phone || '')) body.phone = editForm.phone || null;
            if (editForm.city !== undefined && editForm.city !== (selected.city || '')) body.city = editForm.city;
            if (editForm.skills !== undefined) {
                const newSkills = editForm.skills as unknown as string[];
                if (JSON.stringify(newSkills) !== JSON.stringify(selected.skills)) body.skills = newSkills;
            }
            if (editForm.experience_level !== undefined && editForm.experience_level !== selected.experience_level) body.experience_level = editForm.experience_level;
            if (editForm.availability !== undefined && editForm.availability !== selected.availability) body.availability = editForm.availability;
            if (editForm.message !== undefined && editForm.message !== (selected.message || '')) body.message = editForm.message || null;

            if (Object.keys(body).length === 0) {
                setEditMode(false);
                return;
            }
            const res = await fetch(`${API_URL}/volunteers/admin/${selected.id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const updated = { ...selected, ...body } as Volunteer;
                setSelected(updated);
                setVolunteers(prev => prev.map(v => v.id === selected.id ? updated : v));
                setEditMode(false);
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
        if (checkedIds.size === volunteers.length) {
            setCheckedIds(new Set());
        } else {
            setCheckedIds(new Set(volunteers.map(v => v.id)));
        }
    };

    const statusFilters: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: 'Tous' },
        { key: 'pending', label: 'En attente' },
        { key: 'entretien', label: 'Entretien' },
        { key: 'accepted', label: 'Accepté' },
        { key: 'rejected', label: 'Rejeté' },
    ];

    const availabilityFilters: { key: AvailabilityFilter; label: string }[] = [
        { key: 'all', label: 'Tous' },
        { key: 'punctual', label: 'Ponctuel' },
        { key: 'regular', label: 'Régulier' },
        { key: 'active', label: 'Moteur' },
    ];

    const filteredVolunteers = volunteers.filter(v => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (v.name?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q));
    });

    const sortedVolunteers = [...filteredVolunteers].sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? '';
        const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? '';
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : ((aVal as number) > (bVal as number) ? 1 : -1);
        return sortDirection === 'asc' ? cmp : -cmp;
    });

    const renderSkills = (skills: string[]) => {
        if (!skills || skills.length === 0) return <span className="text-echo-textMuted">—</span>;
        const shown = skills.slice(0, 3);
        const remaining = skills.length - shown.length;
        return (
            <span>
                {shown.join(', ')}
                {remaining > 0 && <span className="text-echo-textMuted"> +{remaining}</span>}
            </span>
        );
    };

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
                            <Heart className="text-echo-gold" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white">Candidatures bénévoles</h1>
                            <p className="text-sm text-echo-textMuted">
                                {volunteers.length} candidature{volunteers.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-echo-textMuted hover:text-echo-gold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            title="Exporter CSV"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                        <button
                            onClick={fetchVolunteers}
                            className="p-2 text-echo-textMuted hover:text-echo-gold transition-colors"
                            title="Rafraîchir"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {statusFilters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === f.key
                                    ? 'bg-echo-gold/20 text-echo-gold border border-echo-gold/30'
                                    : 'bg-white/5 text-echo-textMuted border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {availabilityFilters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setAvailabilityFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                availabilityFilter === f.key
                                    ? 'bg-white/15 text-white border border-white/20'
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
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={volunteers.length > 0 && checkedIds.size === volunteers.length}
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
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden md:table-cell cursor-pointer select-none hover:text-echo-gold transition-colors" onClick={() => handleSort('email')}>
                                        <span className="inline-flex items-center gap-1">
                                            Email
                                            {sortField === 'email' ? (
                                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </span>
                                    </th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden lg:table-cell cursor-pointer select-none hover:text-echo-gold transition-colors" onClick={() => handleSort('city')}>
                                        <span className="inline-flex items-center gap-1">
                                            Ville
                                            {sortField === 'city' ? (
                                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </span>
                                    </th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden md:table-cell">Compétences</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 cursor-pointer select-none hover:text-echo-gold transition-colors" onClick={() => handleSort('availability')}>
                                        <span className="inline-flex items-center gap-1">
                                            Disponibilité
                                            {sortField === 'availability' ? (
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
                                        <td colSpan={8} className="text-center text-echo-textMuted py-12">
                                            <RefreshCw size={20} className="animate-spin inline mr-2" />
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : sortedVolunteers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center text-echo-textMuted py-12">
                                            Aucune candidature bénévole pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedVolunteers.map(v => (
                                        <tr
                                            key={v.id}
                                            className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={checkedIds.has(v.id)}
                                                    onChange={() => toggleCheck(v.id)}
                                                    className="accent-echo-gold"
                                                />
                                            </td>
                                            <td className="px-4 py-3" onClick={() => setSelected(v)}>
                                                <div className="text-sm text-white font-medium">{v.name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-echo-textMuted hidden md:table-cell" onClick={() => setSelected(v)}>
                                                {v.email}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-echo-textMuted hidden lg:table-cell" onClick={() => setSelected(v)}>
                                                {v.city || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-echo-textMuted max-w-[180px] truncate hidden md:table-cell" onClick={() => setSelected(v)}>
                                                {renderSkills(v.skills)}
                                            </td>
                                            <td className="px-4 py-3" onClick={() => setSelected(v)}>
                                                <AvailBadge availability={v.availability} />
                                            </td>
                                            <td className="px-4 py-3" onClick={() => setSelected(v)}>
                                                <StatusBadge status={v.status || 'pending'} createdAt={v.created_at} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-echo-textMuted whitespace-nowrap" onClick={() => setSelected(v)}>
                                                <Clock size={12} className="inline mr-1" />
                                                {new Date(v.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))
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
                                    {selected.phone && (
                                        <p className="text-sm text-echo-textMuted">{selected.phone}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {!editMode && (
                                        <button
                                            onClick={() => {
                                                setEditMode(true);
                                                setEditForm({
                                                    name: selected.name,
                                                    email: selected.email,
                                                    phone: selected.phone || '',
                                                    city: selected.city || '',
                                                    skills: [...selected.skills],
                                                    experience_level: selected.experience_level,
                                                    availability: selected.availability,
                                                    message: selected.message || '',
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
                                            <label className="text-xs text-echo-textMuted block mb-1">Téléphone</label>
                                            <input type="text" value={(editForm.phone as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Ville</label>
                                            <input type="text" value={(editForm.city as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Compétences (séparées par des virgules)</label>
                                            <input type="text" value={(editForm.skills as string[])?.join(', ') ?? ''} onChange={e => setEditForm(f => ({ ...f, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Niveau d&apos;expérience</label>
                                            <select value={(editForm.experience_level as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, experience_level: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40">
                                                <option value="professional">Professionnel</option>
                                                <option value="student">Étudiant</option>
                                                <option value="self_taught">Autodidacte</option>
                                                <option value="motivated">Motivé</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Disponibilité</label>
                                            <select value={(editForm.availability as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, availability: e.target.value as AvailabilityType }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40">
                                                <option value="punctual">Ponctuel</option>
                                                <option value="regular">Régulier</option>
                                                <option value="active">Moteur</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-echo-textMuted block mb-1">Message</label>
                                            <textarea value={(editForm.message as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, message: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-echo-gold/40" rows={4} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                                        <Button variant="outline" onClick={handleEditSave} disabled={actionLoading} className="!text-echo-gold !border-echo-gold/30 text-sm">
                                            <Save size={14} className="mr-1.5" />
                                            {actionLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                                        </Button>
                                        <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm text-echo-textMuted hover:text-white transition-colors">
                                            Annuler
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <AvailBadge availability={selected.availability} />
                                <StatusBadge status={selected.status || 'pending'} createdAt={selected.created_at} />
                                {selected.city && (
                                    <span className="text-xs text-echo-textMuted">{selected.city}</span>
                                )}
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

                            {/* Experience Level */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white mb-2">Niveau d&apos;expérience</h3>
                                <p className="text-sm text-echo-textMuted">
                                    {EXP_LABELS[selected.experience_level] || selected.experience_level}
                                </p>
                            </div>

                            {/* Availability */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white mb-2">Disponibilité</h3>
                                <p className="text-sm text-echo-textMuted">
                                    {AVAIL_LABELS[selected.availability] || selected.availability}
                                </p>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white mb-2">Compétences</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selected.skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full text-xs font-medium bg-echo-gold/15 text-echo-gold border border-echo-gold/30"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Motivations */}
                            {selected.motivations && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-white mb-2">Motivations</h3>
                                    <p className="text-sm text-echo-textMuted bg-white/5 border border-white/10 rounded-lg p-4 whitespace-pre-wrap">
                                        {selected.motivations}
                                    </p>
                                </div>
                            )}

                            {/* Message */}
                            {selected.message && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-white mb-2">Message</h3>
                                    <p className="text-sm text-echo-textMuted bg-white/5 border border-white/10 rounded-lg p-4 whitespace-pre-wrap">
                                        {selected.message}
                                    </p>
                                </div>
                            )}

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
                                    href={`mailto:${selected.email}?subject=Candidature bénévole — Mouvement ECHO`}
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
