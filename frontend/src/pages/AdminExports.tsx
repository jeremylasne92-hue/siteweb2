import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Shield, FileSpreadsheet, CheckCircle, ArrowLeft, Users, Handshake, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { API_URL, EPISODES_API, PARTNERS_API, CANDIDATURES_API } from '../config/api';

type ExportKey = 'optins' | 'users' | 'partners' | 'candidatures';

const EXPORTS: { key: ExportKey; title: string; description: string; url: string; filename: string; icon: React.ReactNode }[] = [
    {
        key: 'optins',
        title: 'Emails Opt-In',
        description: "Liste des utilisateurs ayant souscrit aux notifications de sortie d'episodes. Colonnes : email, saison, episode, date.",
        url: `${EPISODES_API}/admin/export-optins`,
        filename: 'optins-export.csv',
        icon: <FileSpreadsheet className="text-echo-gold" size={28} />,
    },
    {
        key: 'users',
        title: 'Utilisateurs',
        description: "Liste complete des comptes utilisateurs. Colonnes : id, pseudo, email, role, provider OAuth, 2FA, dates.",
        url: `${API_URL}/auth/admin/export-users`,
        filename: 'users-export.csv',
        icon: <Users className="text-blue-400" size={28} />,
    },
    {
        key: 'partners',
        title: 'Partenaires',
        description: "Liste complete des partenaires (tous statuts). Colonnes : nom, categorie, statut, ville, contact, thematiques, reseaux.",
        url: `${PARTNERS_API}/admin/export`,
        filename: 'partenaires-export.csv',
        icon: <Handshake className="text-green-400" size={28} />,
    },
    {
        key: 'candidatures',
        title: 'Candidatures techniques',
        description: "Candidatures CogniSphere & ECHOLink. Colonnes : id, nom, email, projet, competences, message, date.",
        url: `${CANDIDATURES_API}/admin/export`,
        filename: 'candidatures-tech-export.csv',
        icon: <FileText className="text-purple-400" size={28} />,
    },
];

export default function AdminExports() {
    const [downloading, setDownloading] = useState<ExportKey | null>(null);
    const [success, setSuccess] = useState<ExportKey | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async (exp: typeof EXPORTS[number]) => {
        setDownloading(exp.key);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(exp.url, { credentials: 'include' });

            if (res.status === 401 || res.status === 403) {
                setError('Acces refuse. Verifiez vos permissions administrateur.');
                return;
            }
            if (!res.ok) {
                setError('Erreur lors du telechargement.');
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = exp.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setSuccess(exp.key);
        } catch {
            setError('Impossible de contacter le serveur.');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-echo-textMuted hover:text-echo-gold transition-colors mb-6">
                    <ArrowLeft size={16} />
                    Retour au dashboard
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-echo-gold/20 rounded-lg">
                        <Download className="text-echo-gold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-white">Exports</h1>
                        <p className="text-sm text-echo-textMuted">Exporter les donnees de la plateforme</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {EXPORTS.map((exp) => (
                        <div key={exp.key} className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-lg shrink-0">
                                    {exp.icon}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-serif text-white mb-1">{exp.title}</h2>
                                    <p className="text-sm text-echo-textMuted mb-4">{exp.description}</p>

                                    <Button onClick={() => handleDownload(exp)} disabled={downloading !== null}>
                                        <Download size={16} className="mr-2" />
                                        {downloading === exp.key ? 'Telechargement...' : 'Telecharger CSV'}
                                    </Button>

                                    {success === exp.key && (
                                        <div className="flex items-center gap-2 mt-4 text-sm text-green-400">
                                            <CheckCircle size={16} />
                                            <span>Fichier telecharge avec succes.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="flex items-center gap-2 mt-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                        <Shield size={16} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
