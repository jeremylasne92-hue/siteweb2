import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { ArrowLeft, Mail, MailOpen, CheckCircle, MessageSquare, X } from 'lucide-react';
import { API_URL } from '../config/api';
import { Toast } from '../components/ui/Toast';

const SUBJECT_LABELS: Record<string, string> = {
    question_generale: 'Question générale',
    presse_media: 'Presse & Média',
    partenariat: 'Partenariat',
    autre: 'Autre',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof Mail }> = {
    unread: { label: 'Non lu', color: '#F59E0B', Icon: Mail },
    read: { label: 'Lu', color: '#3B82F6', Icon: MailOpen },
    treated: { label: 'Traité', color: '#10B981', Icon: CheckCircle },
};

interface ContactMsg {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status?: string;
    admin_note?: string;
    created_at: string;
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const MSG_FILTER_DEFAULTS = useMemo(() => ({ status: '' }), []);
    const [urlFilters, setUrlFilter] = useUrlFilters(MSG_FILTER_DEFAULTS);
    const filter = urlFilters.status;
    const [selected, setSelected] = useState<ContactMsg | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchMessages = async () => {
        try {
            const url = filter
                ? `${API_URL}/contact/admin/all?status=${filter}`
                : `${API_URL}/contact/admin/all`;
            const res = await fetch(url, { credentials: 'include' });
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login';
                return;
            }
            if (res.ok) setMessages(await res.json());
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const updateStatus = async (msg: ContactMsg, newStatus: string) => {
        const msgId = msg.id;
        if (!msgId) return;
        try {
            const res = await fetch(`${API_URL}/contact/admin/${msgId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setToast({ message: `Message marqué comme « ${STATUS_CONFIG[newStatus]?.label} »`, type: 'success' });
                fetchMessages();
                if (selected && selected.id === msgId) {
                    setSelected({ ...selected, status: newStatus });
                }
            }
        } catch {
            setToast({ message: 'Erreur lors de la mise à jour', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold mb-6 transition-colors">
                    <ArrowLeft size={16} /> Retour au dashboard
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-echo-gold/20 rounded-xl">
                        <MessageSquare className="text-echo-gold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-white">Messages de contact</h1>
                        <p className="text-echo-textMuted text-sm">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['', 'unread', 'read', 'treated'].map(f => (
                        <button
                            key={f}
                            onClick={() => setUrlFilter('status', f)}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                filter === f
                                    ? 'bg-echo-gold/20 border-echo-gold/50 text-echo-gold'
                                    : 'bg-white/5 border-white/10 text-echo-textMuted hover:text-white'
                            }`}
                        >
                            {f === '' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-echo-textMuted">Chargement...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-echo-textMuted">Aucun message</div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg, i) => {
                            const status = msg.status || 'unread';
                            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unread;
                            const StatusIcon = cfg.Icon;
                            return (
                                <div
                                    key={msg.id || i}
                                    onClick={() => {
                                        setSelected(msg);
                                        if (status === 'unread') updateStatus(msg, 'read');
                                    }}
                                    className={`p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${
                                        status === 'unread' ? 'border-l-2 border-l-amber-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <StatusIcon size={16} style={{ color: cfg.color }} className="mt-1 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-medium text-sm">{msg.name}</span>
                                                    <span className="text-echo-textMuted text-xs">— {SUBJECT_LABELS[msg.subject] || msg.subject}</span>
                                                </div>
                                                <p className="text-echo-textMuted text-sm truncate">{msg.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: cfg.color, borderColor: `${cfg.color}40` }}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-xs text-echo-textMuted">
                                                {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Detail Panel (slide-over) */}
                {selected && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
                        <div className="w-full max-w-lg bg-[#111] border-l border-white/10 p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-serif text-white">Message de {selected.name}</h2>
                                <button onClick={() => setSelected(null)} className="text-echo-textMuted hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="text-echo-textMuted">Email : </span>
                                    <a href={`mailto:${selected.email}`} className="text-echo-gold hover:underline">{selected.email}</a>
                                </div>
                                <div>
                                    <span className="text-echo-textMuted">Sujet : </span>
                                    <span className="text-white">{SUBJECT_LABELS[selected.subject] || selected.subject}</span>
                                </div>
                                <div>
                                    <span className="text-echo-textMuted">Date : </span>
                                    <span className="text-white">{new Date(selected.created_at).toLocaleString('fr-FR')}</span>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-echo-textMuted mb-2">Message :</p>
                                    <p className="text-white whitespace-pre-wrap">{selected.message}</p>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-echo-textMuted mb-2">Statut :</p>
                                    <div className="flex gap-2">
                                        {(['unread', 'read', 'treated'] as const).map(s => {
                                            const c = STATUS_CONFIG[s];
                                            const isActive = (selected.status || 'unread') === s;
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => updateStatus(selected, s)}
                                                    disabled={isActive}
                                                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                                        isActive
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'hover:bg-white/10'
                                                    }`}
                                                    style={{ color: c.color, borderColor: `${c.color}40` }}
                                                >
                                                    {c.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
