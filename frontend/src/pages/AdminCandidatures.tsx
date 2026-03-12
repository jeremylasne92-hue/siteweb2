import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, RefreshCw, ArrowLeft, Trash2, X,
    Brain, Share2, Clock, AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CANDIDATURES_API } from '../config/api';

interface TechCandidature {
    id: string;
    name: string;
    email: string;
    project: 'cognisphere' | 'echolink';
    skills: string;
    message: string;
    ip_address?: string;
    created_at: string;
}

type ProjectFilter = 'all' | 'cognisphere' | 'echolink';

const projectConfig = {
    cognisphere: { label: 'CogniSphère', color: '#A78BFA', icon: <Brain size={14} /> },
    echolink: { label: 'ECHOLink', color: '#60A5FA', icon: <Share2 size={14} /> },
};

export default function AdminCandidatures() {
    const [candidatures, setCandidatures] = useState<TechCandidature[]>([]);
    const [filter, setFilter] = useState<ProjectFilter>('all');
    const [selected, setSelected] = useState<TechCandidature | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchCandidatures = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${CANDIDATURES_API}/admin/all?project=${filter}`, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                setError('Accès refusé.');
                return;
            }
            if (!res.ok) throw new Error('Erreur serveur');
            const data = await res.json();
            setCandidatures(data);
        } catch {
            setError('Impossible de charger les candidatures.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidatures();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

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

    const cogniCount = candidatures.filter(c => c.project === 'cognisphere').length;
    const echoCount = candidatures.filter(c => c.project === 'echolink').length;

    const filters: { key: ProjectFilter; label: string; count?: number }[] = [
        { key: 'all', label: 'Toutes', count: candidatures.length },
        { key: 'cognisphere', label: 'CogniSphère', count: filter === 'all' ? cogniCount : undefined },
        { key: 'echolink', label: 'ECHOLink', count: filter === 'all' ? echoCount : undefined },
    ];

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-echo-textMuted hover:text-echo-gold transition-colors mb-6">
                    <ArrowLeft size={16} />
                    Retour au dashboard
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-echo-gold/20 rounded-lg">
                            <FileText className="text-echo-gold" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white">Candidatures techniques</h1>
                            <p className="text-sm text-echo-textMuted">CogniSphère & ECHOLink</p>
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
                <div className="flex gap-2 mb-6">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filter === f.key
                                    ? 'bg-echo-gold/20 text-echo-gold border border-echo-gold/30'
                                    : 'bg-white/5 text-echo-textMuted border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {f.label}
                            {f.count !== undefined && (
                                <span className="ml-2 text-xs opacity-70">({f.count})</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Table */}
                {!error && (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Nom</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Email</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Projet</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Compétences</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-echo-textMuted py-12">
                                            <RefreshCw size={20} className="animate-spin inline mr-2" />
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : candidatures.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-echo-textMuted py-12">
                                            Aucune candidature pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    candidatures.map(c => {
                                        const config = projectConfig[c.project];
                                        return (
                                            <tr
                                                key={c.id}
                                                onClick={() => setSelected(c)}
                                                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-3 text-sm text-white font-medium">{c.name}</td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted">{c.email}</td>
                                                <td className="px-4 py-3">
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
                                                </td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted max-w-[200px] truncate">
                                                    {c.skills}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted whitespace-nowrap">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setSelected(null); setDeleteConfirm(null); }}>
                        <div
                            className="bg-echo-dark border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-serif text-white">{selected.name}</h2>
                                    <p className="text-sm text-echo-textMuted mt-1">{selected.email}</p>
                                </div>
                                <button onClick={() => { setSelected(null); setDeleteConfirm(null); }} className="p-1 text-echo-textMuted hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Project Badge */}
                            {(() => {
                                const config = projectConfig[selected.project];
                                return (
                                    <span
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border mb-6"
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

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-echo-textMuted mb-6">
                                <Clock size={14} />
                                <span>Soumise le {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

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

                            {/* Actions */}
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
