import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Shield, FileSpreadsheet, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EPISODES_API } from '../config/api';

export default function AdminExports() {
    const [downloading, setDownloading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setDownloading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`${EPISODES_API}/admin/export-optins`, {
                credentials: 'include',
            });

            if (res.status === 401 || res.status === 403) {
                setError('Accès refusé. Vérifiez vos permissions administrateur.');
                return;
            }

            if (!res.ok) {
                setError('Erreur lors du téléchargement.');
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'optins-export.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setSuccess(true);
        } catch {
            setError('Impossible de contacter le serveur.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                {/* Back link */}
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-echo-textMuted hover:text-echo-gold transition-colors mb-6">
                    <ArrowLeft size={16} />
                    Retour au dashboard
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-echo-gold/20 rounded-lg">
                        <Download className="text-echo-gold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-white">Exports</h1>
                        <p className="text-sm text-echo-textMuted">Exporter les données de la plateforme</p>
                    </div>
                </div>

                {/* Export Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-echo-gold/10 rounded-lg shrink-0">
                            <FileSpreadsheet className="text-echo-gold" size={28} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-serif text-white mb-1">Emails Opt-In</h2>
                            <p className="text-sm text-echo-textMuted mb-4">
                                Exporter la liste des utilisateurs ayant souscrit aux notifications de sortie d'épisodes.
                                Le fichier CSV contient : email, saison, épisode, date d'inscription.
                            </p>

                            <Button onClick={handleDownload} disabled={downloading}>
                                <Download size={16} className="mr-2" />
                                {downloading ? 'Téléchargement...' : 'Télécharger CSV'}
                            </Button>

                            {success && (
                                <div className="flex items-center gap-2 mt-4 text-sm text-green-400">
                                    <CheckCircle size={16} />
                                    <span>Fichier téléchargé avec succès.</span>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 mt-4 text-sm text-red-400">
                                    <Shield size={16} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
