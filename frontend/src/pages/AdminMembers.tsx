import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, RefreshCw, ArrowLeft, X,
    CheckCircle2, XCircle, MapPin, Save, Globe, Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CityAutocomplete } from '../components/ui/CityAutocomplete';
import { API_URL } from '../config/api';
import { PROJECT_LABELS, EXPERIENCE_LABELS } from '../config/candidatures';

type MembershipStatus = 'active' | 'inactive' | 'suspended' | 'alumni';

interface AdminMember {
    id: string;
    display_name: string;
    slug: string;
    bio?: string;
    avatar_url?: string;
    city?: string;
    region?: string;
    department?: string;
    latitude?: number;
    longitude?: number;
    project: string;
    role_title?: string;
    skills: string[];
    experience_level?: string;
    availability?: string;
    contact_email?: string;
    social_links?: { platform: string; url: string }[];
    visible: boolean;
    membership_status: MembershipStatus;
    joined_at: string;
    created_at: string;
    updated_at: string;
}

const STATUS_CONFIG: Record<MembershipStatus, { label: string; color: string }> = {
    active: { label: 'Actif', color: '#10B981' },
    inactive: { label: 'Inactif', color: '#9CA3AF' },
    suspended: { label: 'Suspendu', color: '#F59E0B' },
    alumni: { label: 'Alumni', color: '#8B5CF6' },
};

const REGION_LABELS: Record<string, string> = {
    auvergne_rhone_alpes: 'Auvergne-Rhône-Alpes',
    bourgogne_franche_comte: 'Bourgogne-Franche-Comté',
    bretagne: 'Bretagne',
    centre_val_de_loire: 'Centre-Val de Loire',
    corse: 'Corse',
    grand_est: 'Grand Est',
    hauts_de_france: 'Hauts-de-France',
    ile_de_france: 'Île-de-France',
    normandie: 'Normandie',
    nouvelle_aquitaine: 'Nouvelle-Aquitaine',
    occitanie: 'Occitanie',
    pays_de_la_loire: 'Pays de la Loire',
    provence_alpes_cote_d_azur: "Provence-Alpes-Côte d'Azur",
    outre_mer: 'Outre-mer',
};

export default function AdminMembers() {
    const [members, setMembers] = useState<AdminMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [projectFilter, setProjectFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState<AdminMember | null>(null);
    const [editForm, setEditForm] = useState<Record<string, unknown>>({});
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [geocoding, setGeocoding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ limit: '100' });
            if (projectFilter !== 'all') params.set('project', projectFilter);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            const res = await fetch(`${API_URL}/admin/members/?${params}`, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                setError('Accès refusé.');
                return;
            }
            if (!res.ok) throw new Error('Erreur serveur');
            const data = await res.json();
            setMembers(data.members || []);
        } catch {
            setError('Impossible de charger les membres.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectFilter, statusFilter]);

    const openEdit = (member: AdminMember) => {
        setSelected(member);
        setEditForm({
            display_name: member.display_name,
            bio: member.bio || '',
            city: member.city || '',
            region: member.region || '',
            department: member.department || '',
            project: member.project,
            role_title: member.role_title || '',
            skills: member.skills.join(', '),
            experience_level: member.experience_level || '',
            availability: member.availability || '',
            contact_email: member.contact_email || '',
        });
        setSaveMsg('');
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        setSaveMsg('');
        try {
            const payload: Record<string, unknown> = {};
            if (editForm.display_name !== selected.display_name) payload.display_name = editForm.display_name;
            if (editForm.bio !== (selected.bio || '')) payload.bio = editForm.bio || null;
            if (editForm.city !== (selected.city || '')) payload.city = editForm.city || null;
            if (editForm.region !== (selected.region || '')) payload.region = editForm.region || null;
            if (editForm.department !== (selected.department || '')) payload.department = editForm.department || null;
            if (editForm.project !== selected.project) payload.project = editForm.project;
            if (editForm.role_title !== (selected.role_title || '')) payload.role_title = editForm.role_title || null;
            if (editForm.experience_level !== (selected.experience_level || '')) payload.experience_level = editForm.experience_level || null;
            if (editForm.availability !== (selected.availability || '')) payload.availability = editForm.availability || null;
            if (editForm.contact_email !== (selected.contact_email || '')) payload.contact_email = editForm.contact_email || null;

            const newSkills = (editForm.skills as string).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
            if (JSON.stringify(newSkills) !== JSON.stringify(selected.skills)) payload.skills = newSkills;

            if (Object.keys(payload).length === 0) {
                setSaveMsg('Aucune modification détectée.');
                setSaving(false);
                return;
            }

            const res = await fetch(`${API_URL}/admin/members/${selected.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const updated = await res.json();
                setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
                setSelected(updated);
                openEdit(updated);
                setSaveMsg('Profil mis à jour avec succès.');
            } else {
                const errData = await res.json().catch(() => null);
                setSaveMsg(`Erreur ${res.status}: ${errData?.detail || 'Impossible de sauvegarder.'}`);
            }
        } catch {
            setSaveMsg('Erreur réseau.');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (profileId: string, status: MembershipStatus) => {
        try {
            const res = await fetch(`${API_URL}/admin/members/${profileId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ membership_status: status }),
            });
            if (res.ok) {
                setMembers(prev => prev.map(m =>
                    m.id === profileId ? { ...m, membership_status: status } : m
                ));
                if (selected?.id === profileId) {
                    setSelected(prev => prev ? { ...prev, membership_status: status } : null);
                }
                setSaveMsg(`Statut changé en "${STATUS_CONFIG[status].label}".`);
            } else {
                const errData = await res.json().catch(() => null);
                setSaveMsg(`Erreur ${res.status}: ${errData?.detail || 'Impossible de changer le statut.'}`);
            }
        } catch {
            setSaveMsg('Erreur réseau lors du changement de statut.');
        }
    };

    const handleBackfillGeocoding = async () => {
        setGeocoding(true);
        try {
            const res = await fetch(`${API_URL}/admin/members/backfill-geocoding`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                console.warn(data.message);
                fetchMembers();
            }
        } catch {
            console.warn('Erreur lors du géocodage.');
        } finally {
            setGeocoding(false);
        }
    };

    const filteredMembers = members.filter(m => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (m.display_name?.toLowerCase().includes(q) || m.contact_email?.toLowerCase().includes(q));
    });

    const projectFilters = [
        { key: 'all', label: 'Tous' },
        { key: 'benevole', label: 'Bénévoles' },
        { key: 'cognisphere', label: 'CogniSphère' },
        { key: 'echolink', label: 'ECHOLink' },
        { key: 'scenariste', label: 'Scénaristes' },
        { key: 'serie_echo', label: 'Série ECHO' },
        { key: 'projet_echo', label: 'Projet ECHO' },
    ];

    const statusFilters = [
        { key: 'all', label: 'Tous' },
        { key: 'active', label: 'Actifs' },
        { key: 'inactive', label: 'Inactifs' },
        { key: 'suspended', label: 'Suspendus' },
        { key: 'alumni', label: 'Alumni' },
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
                            <Users className="text-echo-gold" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white">Gestion des membres</h1>
                            <p className="text-sm text-echo-textMuted">
                                {members.length} membre{members.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBackfillGeocoding}
                            disabled={geocoding}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-echo-textMuted hover:text-echo-gold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                            title="Géocoder les membres sans coordonnées"
                        >
                            <Globe size={16} className={geocoding ? 'animate-spin' : ''} />
                            Géocoder
                        </button>
                        <button
                            onClick={fetchMembers}
                            className="p-2 text-echo-textMuted hover:text-echo-gold transition-colors"
                            title="Rafraîchir"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
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
                <div className="flex flex-wrap gap-2 mb-4">
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

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                        <XCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Table */}
                {!error && (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Nom</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Projet</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden md:table-cell">Ville</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden lg:table-cell">Compétences</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Statut</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3 hidden md:table-cell">GPS</th>
                                    <th className="text-left text-xs text-echo-textMuted font-medium px-4 py-3">Inscrit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-echo-textMuted py-12">
                                            <RefreshCw size={20} className="animate-spin inline mr-2" />
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-echo-textMuted py-12">
                                            Aucun membre trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map(m => {
                                        const projectLabel = PROJECT_LABELS[m.project]?.label || m.project;
                                        const projectColor = PROJECT_LABELS[m.project]?.color || '#9CA3AF';
                                        const statusCfg = STATUS_CONFIG[m.membership_status] || STATUS_CONFIG.active;
                                        const hasCoords = m.latitude != null && m.longitude != null;
                                        return (
                                            <tr
                                                key={m.id}
                                                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                                onClick={() => openEdit(m)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-white font-medium">{m.display_name}</div>
                                                    {m.role_title && <div className="text-xs text-echo-textMuted">{m.role_title}</div>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                                                        style={{ color: projectColor, borderColor: `${projectColor}40`, backgroundColor: `${projectColor}15` }}
                                                    >
                                                        {projectLabel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted hidden md:table-cell">
                                                    {m.city || '\u2014'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted max-w-[180px] truncate hidden lg:table-cell">
                                                    {m.skills.length > 0 ? m.skills.slice(0, 3).join(', ') : '\u2014'}
                                                    {m.skills.length > 3 && <span className="text-echo-textMuted"> +{m.skills.length - 3}</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                                                        style={{ color: statusCfg.color, borderColor: `${statusCfg.color}40`, backgroundColor: `${statusCfg.color}15` }}
                                                    >
                                                        {statusCfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    {hasCoords ? (
                                                        <MapPin size={14} className="text-blue-400" />
                                                    ) : (
                                                        <span className="text-echo-textMuted text-xs">\u2014</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-echo-textMuted whitespace-nowrap">
                                                    {new Date(m.joined_at).toLocaleDateString('fr-FR')}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal */}
                {selected && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
                        <div
                            className="bg-echo-dark border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-serif text-white">Éditer le profil</h2>
                                    <p className="text-sm text-echo-textMuted mt-1">/{selected.slug}</p>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-1 text-echo-textMuted hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* display_name */}
                                <div>
                                    <label className="block text-xs text-echo-textMuted mb-1">Nom affiché</label>
                                    <input
                                        type="text"
                                        value={editForm.display_name as string || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                    />
                                </div>

                                {/* bio */}
                                <div>
                                    <label className="block text-xs text-echo-textMuted mb-1">Bio</label>
                                    <textarea
                                        value={editForm.bio as string || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-echo-gold/40"
                                    />
                                </div>

                                {/* city + region */}
                                <div className="grid grid-cols-2 gap-4">
                                    <CityAutocomplete
                                        label="Ville"
                                        name="city"
                                        placeholder="Rechercher une ville..."
                                        value={editForm.city as string || ''}
                                        onChange={(city) => setEditForm(prev => ({ ...prev, city }))}
                                    />
                                    <div>
                                        <label className="block text-xs text-echo-textMuted mb-1">Région</label>
                                        <select
                                            value={editForm.region as string || ''}
                                            onChange={e => setEditForm(prev => ({ ...prev, region: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                        >
                                            <option value="">{'\u2014'}</option>
                                            {Object.entries(REGION_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* department */}
                                <div>
                                    <label className="block text-xs text-echo-textMuted mb-1">Département</label>
                                    <input
                                        type="text"
                                        value={editForm.department as string || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                    />
                                </div>

                                {/* project + role_title */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-echo-textMuted mb-1">Projet</label>
                                        <select
                                            value={editForm.project as string || ''}
                                            onChange={e => setEditForm(prev => ({ ...prev, project: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                        >
                                            <option value="benevole">Bénévole</option>
                                            <option value="cognisphere">CogniSphère</option>
                                            <option value="echolink">ECHOLink</option>
                                            <option value="scenariste">Scénariste</option>
                                            <option value="serie_echo">Série ECHO</option>
                                            <option value="projet_echo">Projet ECHO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-echo-textMuted mb-1">Titre du rôle</label>
                                        <input
                                            type="text"
                                            value={editForm.role_title as string || ''}
                                            onChange={e => setEditForm(prev => ({ ...prev, role_title: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                        />
                                    </div>
                                </div>

                                {/* skills */}
                                <div>
                                    <label className="block text-xs text-echo-textMuted mb-1">Compétences (séparées par des virgules)</label>
                                    <input
                                        type="text"
                                        value={editForm.skills as string || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                    />
                                </div>

                                {/* experience_level + availability */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-echo-textMuted mb-1">Niveau d&apos;expérience</label>
                                        <select
                                            value={editForm.experience_level as string || ''}
                                            onChange={e => setEditForm(prev => ({ ...prev, experience_level: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                        >
                                            <option value="">{'\u2014'}</option>
                                            {Object.entries(EXPERIENCE_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-echo-textMuted mb-1">Disponibilité</label>
                                        <select
                                            value={editForm.availability as string || ''}
                                            onChange={e => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                        >
                                            <option value="">{'\u2014'}</option>
                                            <option value="punctual">Ponctuel</option>
                                            <option value="regular">Régulier</option>
                                            <option value="active">Moteur</option>
                                        </select>
                                    </div>
                                </div>

                                {/* contact_email */}
                                <div>
                                    <label className="block text-xs text-echo-textMuted mb-1">Email de contact</label>
                                    <input
                                        type="email"
                                        value={editForm.contact_email as string || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, contact_email: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-echo-gold/40"
                                    />
                                </div>

                                {/* GPS coordinates (read-only) */}
                                {(selected.latitude != null || selected.longitude != null) && (
                                    <div className="flex items-center gap-2 text-xs text-echo-textMuted p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                                        <MapPin size={14} className="text-blue-400" />
                                        <span>GPS : {selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}</span>
                                    </div>
                                )}

                                {/* Status actions */}
                                <div className="pt-4 border-t border-white/10">
                                    <label className="block text-xs text-echo-textMuted mb-2">Statut du membre</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.entries(STATUS_CONFIG) as [MembershipStatus, { label: string; color: string }][]).map(([key, cfg]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleStatusChange(selected.id, key)}
                                                disabled={selected.membership_status === key}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                    selected.membership_status === key
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:opacity-80'
                                                }`}
                                                style={{ color: cfg.color, borderColor: `${cfg.color}40`, backgroundColor: `${cfg.color}15` }}
                                            >
                                                {selected.membership_status === key ? <CheckCircle2 size={12} /> : null}
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save button */}
                                <div className="flex items-center justify-between pt-4">
                                    {saveMsg && (
                                        <span className={`text-sm ${saveMsg.includes('succès') || saveMsg.includes('changé') ? 'text-green-400' : saveMsg.includes('Erreur') ? 'text-red-400' : 'text-echo-textMuted'}`}>
                                            {saveMsg}
                                        </span>
                                    )}
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="ml-auto"
                                    >
                                        <Save size={14} className="mr-1.5" />
                                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
