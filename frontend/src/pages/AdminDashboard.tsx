import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, Users, Calendar, Download,
    Clock, ChevronRight, AlertTriangle
} from 'lucide-react';
import { PARTNERS_API } from '../config/api';

export default function AdminDashboard() {
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${PARTNERS_API}/admin/all`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const partners = await res.json();
                    setTotalCount(partners.length);
                    setPendingCount(partners.filter((p: any) => p.status === 'pending').length);
                }
            } catch {
                // silent
            }
        };
        fetchStats();
    }, []);

    const sections = [
        {
            title: 'Partenaires',
            description: 'Gérer les candidatures et profils partenaires',
            icon: <Users size={24} />,
            href: '/admin/partenaires',
            active: true,
            badge: pendingCount && pendingCount > 0
                ? `${pendingCount} en attente`
                : totalCount !== null ? `${totalCount} partenaires` : undefined,
            badgeColor: pendingCount && pendingCount > 0 ? '#F59E0B' : '#10B981',
        },
        {
            title: 'Événements',
            description: 'Créer et gérer les événements publics',
            icon: <Calendar size={24} />,
            href: '/admin/events',
            active: true,
        },
        {
            title: 'Exports',
            description: 'Exporter la base des emails opt-in',
            icon: <Download size={24} />,
            href: '/admin/exports',
            active: true,
        },
    ];

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-echo-gold/20 rounded-xl">
                        <Shield className="text-echo-gold" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-white">Administration</h1>
                        <p className="text-echo-textMuted">Tableau de bord ECHO</p>
                    </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sections.map(section => (
                        <div key={section.title} className="relative">
                            {section.active ? (
                                <Link
                                    to={section.href}
                                    className="block p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-echo-gold/30 transition-all group h-full"
                                >
                                    <SectionContent section={section} />
                                </Link>
                            ) : (
                                <div className="block p-6 bg-white/5 border border-white/10 rounded-xl opacity-50 cursor-not-allowed h-full">
                                    <SectionContent section={section} />
                                    <div className="flex items-center gap-1.5 mt-4 text-xs text-echo-textMuted">
                                        <Clock size={12} />
                                        <span>Bientôt disponible</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Quick Info */}
                <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-echo-gold mt-0.5 shrink-0" />
                        <div className="text-sm text-echo-textMuted">
                            <p className="text-white font-medium mb-1">Accès restreint</p>
                            <p>Ce tableau de bord est réservé aux administrateurs de l'équipe ECHO. Toutes les actions sont tracées et associées à votre compte.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionContent({ section }: { section: { title: string; description: string; icon: React.ReactNode; active: boolean; badge?: string; badgeColor?: string } }) {
    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-white/5 rounded-lg text-echo-gold">
                    {section.icon}
                </div>
                {section.active && (
                    <ChevronRight size={18} className="text-echo-textMuted group-hover:text-echo-gold group-hover:translate-x-1 transition-all" />
                )}
            </div>
            <h3 className="text-lg font-serif text-white mb-2">{section.title}</h3>
            <p className="text-sm text-echo-textMuted leading-relaxed">{section.description}</p>
            {section.badge && (
                <div
                    className="inline-flex items-center gap-1.5 mt-4 px-2.5 py-1 rounded-full text-xs font-medium border"
                    style={{
                        color: section.badgeColor,
                        borderColor: `${section.badgeColor}40`,
                        backgroundColor: `${section.badgeColor}15`
                    }}
                >
                    {section.badge}
                </div>
            )}
        </>
    );
}
