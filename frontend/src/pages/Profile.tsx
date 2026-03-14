import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/seo/SEO';
import {
    Download, Trash2, Shield, AlertTriangle,
    Pencil, Save, X, Calendar, Heart, ExternalLink,
    Tag, FileText, ChevronRight, Brain, Share2,
    Clock, Users, CheckCircle2, XCircle
} from 'lucide-react';
import { API_URL, CANDIDATURES_API } from '../config/api';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../features/auth/store';

interface UserData {
    id: string;
    username: string;
    email: string;
    role: string;
    picture?: string;
    email_opt_out: boolean;
    created_at: string;
    last_login?: string;
    bio?: string;
    interests: string[];
    avatar_url?: string;
    is_member: boolean;
    member_since?: string;
}

const AVAILABLE_INTERESTS = [
    { id: 'philosophie-conscience', label: 'Philosophie & Conscience', emoji: '🧠' },
    { id: 'spiritualite-esoterisme', label: 'Spiritualité & Ésotérisme', emoji: '🔮' },
    { id: 'religions-traditions', label: 'Religions & Traditions', emoji: '📿' },
    { id: 'mythes-civilisations', label: 'Mythes & Civilisations', emoji: '🏛️' },
    { id: 'sciences-neurosciences', label: 'Sciences & Neurosciences', emoji: '🧬' },
    { id: 'ecologie-climat', label: 'Écologie & Climat', emoji: '🌍' },
    { id: 'justice-droits', label: 'Justice & Droits', emoji: '⚖️' },
    { id: 'geopolitique-pouvoir', label: 'Géopolitique & Pouvoir', emoji: '🌐' },
    { id: 'economie-industrie', label: 'Économie & Industrie', emoji: '💰' },
    { id: 'technologies-ia', label: 'Technologies & IA', emoji: '🤖' },
    { id: 'sante-bien-etre', label: 'Santé & Bien-être', emoji: '🏥' },
    { id: 'arts-medias-culture', label: 'Arts, Médias & Culture', emoji: '🎭' },
];

export default function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [savingField, setSavingField] = useState<string | null>(null);

    // Editable fields
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioDraft, setBioDraft] = useState('');

    const [myCandidatures, setMyCandidatures] = useState<{
        id: string; project: string; status: string; status_note?: string; created_at: string;
    }[]>([]);

    const [myVolunteerCandidature, setMyVolunteerCandidature] = useState<{
        id: string; status: string; status_note?: string; created_at: string; availability?: string;
    } | null>(null);

    const logout = useAuthStore((s) => s.logout);

    useEffect(() => {
        fetchUser();
        fetchMyCandidatures();
        fetchMyVolunteerCandidature();
    }, []);

    const fetchUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
            if (res.status === 401) {
                setError('Vous devez être connecté pour accéder à cette page.');
                return;
            }
            if (!res.ok) throw new Error('Erreur serveur');
            const data = await res.json();
            // Ensure defaults
            setUserData({
                ...data,
                interests: data.interests || [],
                is_member: data.is_member || false,
            });
        } catch {
            setError('Impossible de charger votre profil.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyCandidatures = async () => {
        try {
            const res = await fetch(`${CANDIDATURES_API}/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setMyCandidatures(data);
            }
        } catch {
            // silent — not critical
        }
    };

    const fetchMyVolunteerCandidature = async () => {
        try {
            const res = await fetch(`${API_URL}/volunteers/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setMyVolunteerCandidature(data);
            }
        } catch {
            // silent — not critical
        }
    };

    const updateProfile = async (fields: Record<string, unknown>) => {
        const fieldName = Object.keys(fields)[0];
        setSavingField(fieldName);
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fields),
            });
            if (res.ok) {
                setUserData(prev => prev ? { ...prev, ...fields } as UserData : null);
            }
        } catch (err) {
            console.error('Update failed', err);
        } finally {
            setSavingField(null);
        }
    };

    const handleSaveBio = async () => {
        await updateProfile({ bio: bioDraft });
        setIsEditingBio(false);
    };

    const toggleInterest = async (interestId: string) => {
        if (!userData) return;
        const current = userData.interests;
        const updated = current.includes(interestId)
            ? current.filter(i => i !== interestId)
            : [...current, interestId];
        await updateProfile({ interests: updated });
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const res = await fetch(`${API_URL}/auth/me/export`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mes-donnees-echo.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!userData) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/auth/user/${userData.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                logout();
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase();
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return { label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
            case 'partner':
                return { label: 'Partenaire', color: 'bg-echo-gold/20 text-echo-gold border-echo-gold/30' };
            default:
                return { label: 'Membre', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-echo-gold border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md p-8 bg-white/5 border border-white/10 rounded-xl">
                    <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
                    <h2 className="text-xl font-serif text-white mb-2">Accès restreint</h2>
                    <p className="text-echo-textMuted mb-4">{error}</p>
                    <Button onClick={() => window.location.href = '/login'}>
                        Se connecter
                    </Button>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    const roleBadge = getRoleBadge(userData.role);

    return (
        <>
            <SEO title="Mon Profil" description="Gérez votre profil et vos données personnelles sur la plateforme ECHO." />
            <div className="min-h-screen bg-echo-dark pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ===== En-tête Profil ===== */}
                    <div className="flex items-start gap-3 sm:gap-5 mb-10">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-echo-gold/30 to-echo-gold/10 border border-echo-gold/20 flex items-center justify-center shrink-0">
                            {userData.avatar_url || userData.picture ? (
                                <img
                                    src={userData.avatar_url || userData.picture}
                                    alt={userData.username}
                                    className="w-full h-full rounded-2xl object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-echo-gold">
                                    {getInitials(userData.username)}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-serif text-white">{userData.username}</h1>
                                <span className={`text-xs px-2.5 py-1 rounded-full border ${roleBadge.color}`}>
                                    {roleBadge.label}
                                </span>
                                {userData.is_member && (
                                    <span className="text-xs px-2.5 py-1 rounded-full border bg-echo-gold/20 text-echo-gold border-echo-gold/30 flex items-center gap-1">
                                        <Heart size={10} /> Adhérent
                                    </span>
                                )}
                            </div>
                            <p className="text-echo-textMuted text-sm mt-1">{userData.email}</p>
                            <p className="text-echo-textMuted text-xs mt-1 flex items-center gap-1">
                                <Calendar size={12} />
                                Membre depuis {formatDate(userData.created_at)}
                                {userData.last_login && (
                                    <span className="ml-2">· Dernière connexion : {formatDate(userData.last_login)}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* ===== Bio & Intérêts ===== */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-echo-gold" />
                            Bio & Centres d'intérêt
                        </h2>

                        {/* Bio */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-echo-textMuted">Ma présentation</label>
                                {!isEditingBio && (
                                    <button
                                        onClick={() => { setIsEditingBio(true); setBioDraft(userData.bio || ''); }}
                                        className="text-xs text-echo-gold hover:underline flex items-center gap-1"
                                    >
                                        <Pencil size={12} /> Modifier
                                    </button>
                                )}
                            </div>
                            {isEditingBio ? (
                                <div>
                                    <textarea
                                        value={bioDraft}
                                        onChange={e => setBioDraft(e.target.value)}
                                        maxLength={280}
                                        rows={3}
                                        placeholder="Décrivez-vous en quelques mots…"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-echo-gold/50 resize-none"
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-neutral-500">{bioDraft.length}/280</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditingBio(false)}
                                                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                                            >
                                                <X size={12} /> Annuler
                                            </button>
                                            <button
                                                onClick={handleSaveBio}
                                                disabled={savingField === 'bio'}
                                                className="text-xs text-echo-gold hover:underline flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Save size={12} /> {savingField === 'bio' ? 'Enregistrement…' : 'Enregistrer'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-300 italic">
                                    {userData.bio || 'Aucune bio définie. Cliquez sur "Modifier" pour vous présenter.'}
                                </p>
                            )}
                        </div>

                        {/* Intérêts */}
                        <div>
                            <label className="text-sm text-echo-textMuted mb-3 block flex items-center gap-1">
                                <Tag size={14} /> Mes thématiques d'intérêt
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_INTERESTS.map(interest => {
                                    const isSelected = userData.interests.includes(interest.id);
                                    return (
                                        <button
                                            key={interest.id}
                                            onClick={() => toggleInterest(interest.id)}
                                            disabled={savingField === 'interests'}
                                            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                                isSelected
                                                    ? 'bg-echo-gold/20 border-echo-gold/40 text-echo-gold'
                                                    : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                                            }`}
                                        >
                                            {interest.emoji} {interest.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ===== Mes candidatures ===== */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-echo-gold" />
                            Mes candidatures
                        </h2>
                        {myCandidatures.length === 0 && !myVolunteerCandidature ? (
                            <p className="text-sm text-neutral-400 italic">Vous n&apos;avez pas encore soumis de candidature.</p>
                        ) : (
                            <div className="space-y-3">
                                {/* Volunteer candidature */}
                                {myVolunteerCandidature && (() => {
                                    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
                                        pending: { label: 'En attente', color: '#F59E0B', icon: <Clock size={12} /> },
                                        entretien: { label: 'Entretien', color: '#3B82F6', icon: <Users size={12} /> },
                                        accepted: { label: 'Acceptée', color: '#10B981', icon: <CheckCircle2 size={12} /> },
                                        rejected: { label: 'Non retenue', color: '#EF4444', icon: <XCircle size={12} /> },
                                    };
                                    const st = statusMap[myVolunteerCandidature.status] || statusMap.pending;
                                    return (
                                        <div key={myVolunteerCandidature.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                                                        style={{ color: '#10B981', borderColor: '#10B98140', backgroundColor: '#10B98115' }}
                                                    >
                                                        <Heart size={12} />
                                                        Bénévole
                                                    </span>
                                                    <span className="text-xs text-echo-textMuted">
                                                        {new Date(myVolunteerCandidature.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                                                    style={{ color: st.color, borderColor: `${st.color}40`, backgroundColor: `${st.color}15` }}
                                                >
                                                    {st.icon}
                                                    {st.label}
                                                </span>
                                            </div>
                                            {myVolunteerCandidature.status === 'entretien' && (
                                                <a
                                                    href="https://calendar.app.google/GSpXrQq72uqWhhSx9"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-echo-gold/20 text-echo-gold border border-echo-gold/30 hover:bg-echo-gold/30 transition-colors mt-2"
                                                >
                                                    <Calendar size={12} />
                                                    Réserver un créneau d&apos;entretien
                                                </a>
                                            )}
                                            {myVolunteerCandidature.status_note && (
                                                <p className="text-xs text-echo-textMuted mt-2 pl-1 border-l-2 border-white/10 ml-1">
                                                    {myVolunteerCandidature.status_note}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}
                                {/* Tech candidatures */}
                                {myCandidatures.map(c => {
                                    const projectLabels: Record<string, string> = { cognisphere: 'CogniSphère', echolink: 'ECHOLink', scenariste: 'Scénariste' };
                                    const projectColors: Record<string, string> = { cognisphere: '#A78BFA', echolink: '#60A5FA', scenariste: '#F59E0B' };
                                    const projectIcons: Record<string, typeof Brain> = { cognisphere: Brain, echolink: Share2, scenariste: FileText };
                                    const projectLabel = projectLabels[c.project] || c.project;
                                    const projectColor = projectColors[c.project] || '#888';
                                    const ProjectIcon = projectIcons[c.project] || FileText;
                                    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
                                        pending: { label: 'En attente', color: '#F59E0B', icon: <Clock size={12} /> },
                                        entretien: { label: 'Entretien', color: '#3B82F6', icon: <Users size={12} /> },
                                        accepted: { label: 'Acceptée', color: '#10B981', icon: <CheckCircle2 size={12} /> },
                                        rejected: { label: 'Non retenue', color: '#EF4444', icon: <XCircle size={12} /> },
                                    };
                                    const st = statusMap[c.status] || statusMap.pending;
                                    return (
                                        <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                                                        style={{ color: projectColor, borderColor: `${projectColor}40`, backgroundColor: `${projectColor}15` }}
                                                    >
                                                        <ProjectIcon size={12} />
                                                        {projectLabel}
                                                    </span>
                                                    <span className="text-xs text-echo-textMuted">
                                                        {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                                                    style={{ color: st.color, borderColor: `${st.color}40`, backgroundColor: `${st.color}15` }}
                                                >
                                                    {st.icon}
                                                    {st.label}
                                                </span>
                                            </div>
                                            {c.status === 'entretien' && (
                                                <a
                                                    href="https://calendar.app.google/GSpXrQq72uqWhhSx9"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-echo-gold/20 text-echo-gold border border-echo-gold/30 hover:bg-echo-gold/30 transition-colors mt-2"
                                                >
                                                    <Calendar size={12} />
                                                    Réserver un créneau d&apos;entretien
                                                </a>
                                            )}
                                            {c.status_note && (
                                                <p className="text-xs text-echo-textMuted mt-2 pl-1 border-l-2 border-white/10 ml-1">
                                                    {c.status_note}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ===== Préférences de notification — masqué en attente de la newsletter ===== */}

                    {/* ===== Raccourcis ===== */}
                    {(userData.role === 'partner' || userData.role === 'admin') && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                                <ExternalLink size={18} className="text-echo-gold" />
                                Raccourcis
                            </h2>
                            <div className="space-y-2">
                                {(userData.role === 'partner' || userData.role === 'admin') && (
                                    <Link
                                        to="/mon-compte/partenaire"
                                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield size={16} className="text-echo-gold" />
                                            <span className="text-white text-sm">Espace Partenaire</span>
                                        </div>
                                        <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                                    </Link>
                                )}
                                {userData.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield size={16} className="text-red-400" />
                                            <span className="text-white text-sm">Administration</span>
                                        </div>
                                        <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ===== Statut Adhérent ===== */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                            <Heart size={18} className="text-echo-gold" />
                            Adhésion à l'association
                        </h2>
                        {userData.is_member ? (
                            <div className="flex items-center gap-3 p-4 bg-echo-gold/10 border border-echo-gold/20 rounded-lg">
                                <Heart size={20} className="text-echo-gold shrink-0" />
                                <div>
                                    <p className="text-white text-sm font-medium">Vous êtes adhérent(e) du Mouvement ECHO</p>
                                    {userData.member_since && (
                                        <p className="text-echo-textMuted text-xs mt-0.5">Depuis le {formatDate(userData.member_since)}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-neutral-400 text-sm mb-4">
                                    Vous n'êtes pas encore adhérent(e). Rejoignez l'association pour soutenir le mouvement !
                                </p>
                                <Link to="/soutenir">
                                    <Button variant="outline" size="sm">
                                        Devenir adhérent <ExternalLink size={14} className="ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ===== Données (RGPD) ===== */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-serif text-white mb-2 flex items-center gap-2">
                            <Shield size={18} className="text-echo-gold" />
                            Mes Données (RGPD)
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Conformément au RGPD, vous pouvez exporter ou supprimer vos données personnelles.
                        </p>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                            <button
                                onClick={handleExportData}
                                disabled={isExporting}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <Download size={16} />
                                {isExporting ? 'Export en cours…' : 'Exporter mes données'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={16} />
                                Supprimer mon compte
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-serif text-white mb-3">Supprimer votre compte ?</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                        </p>
                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-4 py-2.5 text-sm bg-red-600 rounded-lg text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? 'Suppression…' : 'Confirmer la suppression'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
