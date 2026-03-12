import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEO } from '../components/seo/SEO';
import { User, Download, Trash2, Mail, Shield, AlertTriangle } from 'lucide-react';
import { API_URL } from '../config/api';
import { Button } from '../components/ui/Button';

interface UserData {
    id: string;
    username: string;
    email: string;
    role: string;
    email_opt_out: boolean;
    created_at: string;
    last_login?: string;
}

export default function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isTogglingEmail, setIsTogglingEmail] = useState(false);

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
            setUserData(data);
        } catch {
            setError('Impossible de charger votre profil.');
        } finally {
            setIsLoading(false);
        }
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
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleEmailOptOut = async () => {
        if (!userData) return;
        setIsTogglingEmail(true);
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_opt_out: !userData.email_opt_out }),
            });
            if (res.ok) {
                setUserData(prev => prev ? { ...prev, email_opt_out: !prev.email_opt_out } : null);
            }
        } catch (err) {
            console.error('Toggle email opt-out failed', err);
        } finally {
            setIsTogglingEmail(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
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
                        <Button onClick={() => window.location.href = '/login'}>
                            Se connecter
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!userData) return null;

    return (
        <Layout>
            <SEO title="Mon Profil — ECHO" description="Gérez votre profil et vos données personnelles sur la plateforme ECHO." />
            <div className="min-h-screen bg-echo-dark pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <User size={28} className="text-echo-gold" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-serif text-white">Mon Profil</h1>
                            <p className="text-echo-textMuted text-sm mt-1">{userData.email}</p>
                        </div>
                    </div>

                    {/* Section: Informations */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-echo-gold" />
                            Informations personnelles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-xs text-echo-textMuted uppercase tracking-wider mb-1">Nom d'utilisateur</p>
                                <p className="text-white font-medium">{userData.username}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-xs text-echo-textMuted uppercase tracking-wider mb-1">Email</p>
                                <p className="text-white font-medium">{userData.email}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-xs text-echo-textMuted uppercase tracking-wider mb-1">Membre depuis</p>
                                <p className="text-white font-medium">{formatDate(userData.created_at)}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-xs text-echo-textMuted uppercase tracking-wider mb-1">Dernière connexion</p>
                                <p className="text-white font-medium">
                                    {userData.last_login ? formatDate(userData.last_login) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section: Préférences emails */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-echo-gold" />
                            Préférences emails
                        </h2>
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium">Recevoir les emails du mouvement ECHO</p>
                                <p className="text-echo-textMuted text-xs mt-1">
                                    Actualités, événements et mises à jour de la série documentaire
                                </p>
                            </div>
                            <button
                                onClick={handleToggleEmailOptOut}
                                disabled={isTogglingEmail}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                                    userData.email_opt_out
                                        ? 'bg-white/20'
                                        : 'bg-echo-gold'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                                        userData.email_opt_out ? 'translate-x-0' : 'translate-x-6'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Section: RGPD */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-serif text-white mb-2 flex items-center gap-2">
                            <Shield size={20} className="text-echo-gold" />
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
                                {isExporting ? 'Export en cours...' : 'Exporter mes données'}
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
                                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
