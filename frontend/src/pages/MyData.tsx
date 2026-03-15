import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/seo/SEO';
import { Download, Trash2, Shield, AlertTriangle, User, Mail, Calendar, Tag } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuthStore } from '../features/auth/store';

interface UserData {
    id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
    last_login?: string;
    bio?: string;
    interests: string[];
    is_member: boolean;
    member_since?: string;
    email_opt_out: boolean;
}

export default function MyData() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
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
            setUserData({
                ...data,
                interests: data.interests || [],
                is_member: data.is_member || false,
            });
        } catch {
            setError('Impossible de charger vos données.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const res = await fetch(`${API_URL}/auth/my-data/export`, { credentials: 'include' });
            if (res.ok) {
                const blob = await res.blob();
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

    const handleRequestDeletion = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/auth/my-data`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setDeleteSuccess(true);
                setShowDeleteConfirm(false);
                setTimeout(() => {
                    logout();
                    navigate('/');
                }, 3000);
            }
        } catch (err) {
            console.error('Deletion request failed', err);
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

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrateur';
            case 'partner': return 'Partenaire';
            default: return 'Utilisateur';
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
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2.5 text-sm bg-echo-gold text-echo-dark rounded-lg hover:bg-echo-goldLight transition-colors"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <>
            <SEO
                title="Mes données personnelles"
                description="Consultez, exportez ou demandez la suppression de vos données personnelles conformément au RGPD."
            />
            <div className="min-h-screen bg-echo-dark pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-2xl sm:text-3xl font-serif text-white flex items-center gap-3">
                            <Shield size={28} className="text-echo-gold" />
                            Mes données personnelles
                        </h1>
                        <p className="text-echo-textMuted mt-2 text-sm">
                            Conformément aux articles 12 à 22 du RGPD, vous pouvez consulter, exporter et demander la suppression de vos données.
                        </p>
                    </div>

                    {/* Deletion success banner */}
                    {deleteSuccess && (
                        <div className="mb-6 p-4 bg-echo-gold/10 border border-echo-gold/20 rounded-xl text-echo-gold text-sm">
                            Votre demande de suppression a été enregistrée. Votre compte sera supprimé sous 30 jours. Vous allez être redirigé...
                        </div>
                    )}

                    {/* Section 1: Mes données personnelles */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-echo-gold" />
                            Données stockées
                        </h2>
                        <p className="text-sm text-neutral-400 mb-5">
                            Voici un résumé des informations que nous conservons à votre sujet.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <User size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Nom d&apos;utilisateur</p>
                                    <p className="text-sm text-white">{userData.username}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <Mail size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Adresse e-mail</p>
                                    <p className="text-sm text-white">{userData.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <Calendar size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Date d&apos;inscription</p>
                                    <p className="text-sm text-white">{formatDate(userData.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <Tag size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Rôle</p>
                                    <p className="text-sm text-white">{getRoleLabel(userData.role)}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-neutral-500 mt-4">
                            D&apos;autres données peuvent être associées à votre compte (sessions, candidatures, messages de contact, progression vidéo). Utilisez le bouton d&apos;export ci-dessous pour obtenir l&apos;intégralité de vos données.
                        </p>
                    </div>

                    {/* Section 2: Exporter mes données */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-serif text-white mb-2 flex items-center gap-2">
                            <Download size={18} className="text-echo-gold" />
                            Exporter mes données
                        </h2>
                        <p className="text-sm text-neutral-400 mb-5">
                            Téléchargez l&apos;ensemble de vos données personnelles au format JSON (art. 15 et 20 du RGPD).
                        </p>
                        <button
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-echo-gold/10 border border-echo-gold/30 rounded-lg text-echo-gold hover:bg-echo-gold/20 transition-colors disabled:opacity-50"
                        >
                            <Download size={16} />
                            {isExporting ? 'Export en cours...' : 'Télécharger mes données (JSON)'}
                        </button>
                    </div>

                    {/* Section 3: Supprimer mon compte */}
                    <div className="bg-white/5 border border-red-500/20 rounded-xl p-6">
                        <h2 className="text-lg font-serif text-white mb-2 flex items-center gap-2">
                            <Trash2 size={18} className="text-red-400" />
                            Supprimer mon compte
                        </h2>
                        <p className="text-sm text-neutral-400 mb-5">
                            Vous pouvez demander la suppression de votre compte et de toutes vos données personnelles (art. 17 du RGPD). La suppression sera effective sous 30 jours.
                        </p>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={deleteSuccess}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            Demander la suppression de mon compte
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle size={24} className="text-red-400 shrink-0" />
                            <h3 className="text-lg font-serif text-white">Confirmer la suppression</h3>
                        </div>
                        <p className="text-sm text-neutral-400 mb-2">
                            Êtes-vous sûr de vouloir demander la suppression de votre compte ?
                        </p>
                        <ul className="text-sm text-neutral-400 mb-6 list-disc pl-5 space-y-1">
                            <li>Toutes vos données personnelles seront supprimées</li>
                            <li>Cette action sera effective sous 30 jours</li>
                            <li>Vous serez déconnecté après confirmation</li>
                        </ul>
                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleRequestDeletion}
                                disabled={isDeleting}
                                className="px-4 py-2.5 text-sm bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'En cours...' : 'Confirmer la suppression'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
