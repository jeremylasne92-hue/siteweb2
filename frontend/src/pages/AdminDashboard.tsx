import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, Users, Calendar, Download, FileText, Heart,
    Clock, ChevronRight, AlertTriangle, MessageSquare, BookOpen, GraduationCap, Newspaper, Mail
} from 'lucide-react';
import { API_URL, PARTNERS_API, CANDIDATURES_API } from '../config/api';

export default function AdminDashboard() {
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [pendingCandidatureCount, setPendingCandidatureCount] = useState<number>(0);
    const [pendingVolunteerCount, setPendingVolunteerCount] = useState<number>(0);
    const [pendingStudentCount, setPendingStudentCount] = useState<number>(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
    const [pending, setPending] = useState<{
        partners: number; candidatures: number; volunteers: number;
        members: number; messages: number; total: number;
    } | null>(null);
    const [onboardingStats, setOnboardingStats] = useState<{
        step_0_waiting_coulisses: number;
        step_1_waiting_candidature: number;
        step_3_completed: number;
        total_users: number;
        last_cron_run: string;
        last_cron_sent: number;
    } | null>(null);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${PARTNERS_API}/admin/all`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const partners = await res.json();
                    setPendingCount(partners.filter((p: { status: string }) => p.status === 'pending').length);
                }
            } catch {
                // silent
            }
            try {
                const res = await fetch(`${CANDIDATURES_API}/admin/all`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const candidatures = await res.json();
                    setPendingCandidatureCount(candidatures.filter((c: { status: string }) => c.status === 'pending').length);
                }
            } catch {
                // silent
            }
            try {
                const res = await fetch(`${API_URL}/volunteers/admin/all`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const volunteers = await res.json();
                    setPendingVolunteerCount(volunteers.filter((v: { status: string }) => v.status === 'pending').length);
                }
            } catch {
                // silent
            }
            try {
                const res = await fetch(`${API_URL}/students/admin/all`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const students = await res.json();
                    setPendingStudentCount(students.filter((s: { status: string }) => s.status === 'pending').length);
                }
            } catch {
                // silent
            }
            try {
                const res = await fetch(`${API_URL}/contact/admin/all?status=unread`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const msgs = await res.json();
                    setUnreadMessageCount(msgs.length);
                }
            } catch {
                // silent
            }
            try {
                const res = await fetch(`${API_URL}/admin/pending`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setPending(data);
                }
            } catch {
                // silent
            }
            try {
                const res = await fetch(`${API_URL}/admin/onboarding/stats`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setOnboardingStats(data);
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
                : undefined,
            badgeColor: '#F59E0B',
        },
        {
            title: 'Candidatures',
            description: 'Consulter les candidatures techniques CogniSphère & ECHOLink',
            icon: <FileText size={24} />,
            href: '/admin/candidatures',
            active: true,
            badge: pendingCandidatureCount > 0 ? `${pendingCandidatureCount} en attente` : undefined,
            badgeColor: '#F59E0B',
        },
        {
            title: 'Candidatures bénévoles',
            description: 'Gérer les candidatures bénévoles du mouvement',
            icon: <Heart size={24} />,
            href: '/admin/benevoles',
            active: true,
            badge: pendingVolunteerCount > 0 ? `${pendingVolunteerCount} en attente` : undefined,
            badgeColor: '#F59E0B',
        },
        {
            title: 'Stages & Alternance',
            description: 'Gérer les candidatures stages et alternance',
            icon: <GraduationCap size={24} />,
            href: '/admin/students',
            active: true,
            badge: pendingStudentCount > 0 ? `${pendingStudentCount} en attente` : undefined,
            badgeColor: '#F59E0B',
        },
        {
            title: 'Membres',
            description: 'Gérer les profils et statuts des membres',
            icon: <Users size={24} />,
            href: '/admin/membres',
            active: true,
        },
        {
            title: 'Événements',
            description: 'Créer et gérer les événements publics',
            icon: <Calendar size={24} />,
            href: '/admin/events',
            active: true,
        },
        {
            title: 'Messages',
            description: 'Consulter les messages du formulaire de contact',
            icon: <MessageSquare size={24} />,
            href: '/admin/messages',
            active: true,
            notificationCount: unreadMessageCount,
            notificationColor: 'bg-blue-500',
        },
        {
            title: 'Médiathèque',
            description: 'Gérer les ressources : documents, vidéos, livres, outils',
            icon: <BookOpen size={24} />,
            href: '/admin/mediatheque',
            active: true,
        },
        {
            title: 'Newsletter',
            description: 'Composer et envoyer des newsletters',
            icon: <Newspaper size={24} />,
            href: '/admin/newsletter',
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

                {/* Pending items banner */}
                {pending && pending.total > 0 && (
                    <div className="mb-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Clock size={20} className="text-amber-400" />
                            <h2 className="text-lg font-serif text-white">{pending.total} élément{pending.total > 1 ? 's' : ''} à traiter</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {pending.partners > 0 && (
                                <Link to="/admin/partenaires" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-amber-300 hover:bg-white/10 transition-colors">
                                    {pending.partners} partenaire{pending.partners > 1 ? 's' : ''} en attente
                                </Link>
                            )}
                            {pending.candidatures > 0 && (
                                <Link to="/admin/candidatures" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-purple-300 hover:bg-white/10 transition-colors">
                                    {pending.candidatures} candidature{pending.candidatures > 1 ? 's' : ''} en attente
                                </Link>
                            )}
                            {pending.volunteers > 0 && (
                                <Link to="/admin/benevoles" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-green-300 hover:bg-white/10 transition-colors">
                                    {pending.volunteers} bénévole{pending.volunteers > 1 ? 's' : ''} en attente
                                </Link>
                            )}
                            {pending.messages > 0 && (
                                <Link to="/admin/messages" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-blue-300 hover:bg-white/10 transition-colors">
                                    {pending.messages} message{pending.messages > 1 ? 's' : ''} non lu{pending.messages > 1 ? 's' : ''}
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Onboarding Stats */}
                {onboardingStats && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail size={20} className="text-echo-gold" />
                            <h2 className="text-lg font-serif text-white">Onboarding emails</h2>
                        </div>
                        <div className="flex flex-wrap gap-6 mb-3">
                            <div>
                                <span className="text-2xl font-bold text-echo-gold">{onboardingStats.step_0_waiting_coulisses}</span>
                                <span className="text-sm text-echo-textMuted ml-2">en attente J+3</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-echo-gold">{onboardingStats.step_1_waiting_candidature}</span>
                                <span className="text-sm text-echo-textMuted ml-2">en attente J+10</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-green-400">{onboardingStats.step_3_completed}</span>
                                <span className="text-sm text-echo-textMuted ml-2">terminés</span>
                            </div>
                        </div>
                        <p className="text-xs text-echo-textMuted">
                            Dernier cron : {new Date(onboardingStats.last_cron_run).toLocaleString('fr-FR')} — {onboardingStats.last_cron_sent} email{onboardingStats.last_cron_sent > 1 ? 's' : ''} envoyé{onboardingStats.last_cron_sent > 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sections.map(section => (
                        <div key={section.title} className="relative">
                            {section.notificationCount != null && section.notificationCount > 0 && (
                                <span className={`absolute -top-2 -right-2 ${section.notificationColor || 'bg-red-500'} text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 z-10`}>
                                    {section.notificationCount}
                                </span>
                            )}
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

function SectionContent({ section }: { section: { title: string; description: string; icon: React.ReactNode; active: boolean; badge?: string; badgeColor?: string; notificationCount?: number; notificationColor?: string } }) {
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
