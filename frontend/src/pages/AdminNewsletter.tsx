import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, TestTube, X, Newspaper, ChevronDown, ChevronUp, RotateCcw, Users, Clock, Save } from 'lucide-react';
import { API_URL } from '../config/api';
import { Toast } from '../components/ui/Toast';

interface NewsletterHistory {
    id: string;
    subject: string;
    content_text?: string;
    recipients_count: number;
    recipient_count?: number;
    status: 'sent' | 'partial' | 'failed' | 'draft';
    sent_at: string;
}

interface SubscriberStats {
    active: number;
    opted_out: number;
    total: number;
}

const DRAFT_STORAGE_KEY = 'echo_newsletter_draft';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    sent: { label: 'Envoy\u00e9', color: '#10B981', bg: '#10B98120' },
    partial: { label: 'Partiel', color: '#F59E0B', bg: '#F59E0B20' },
    failed: { label: '\u00c9chou\u00e9', color: '#DC143C', bg: '#DC143C20' },
    draft: { label: 'Brouillon', color: '#6B7280', bg: '#6B728020' },
};

function plainTextToHtml(text: string): string {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    return text
        .split(/\n\n+/)
        .map(paragraph => {
            const escaped = paragraph
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            const withLinks = escaped.replace(
                urlRegex,
                '<a href="$1" style="color:#D4AF37;text-decoration:underline">$1</a>'
            );
            return `<p style="margin:0 0 16px 0;line-height:1.6">${withLinks.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');
}

function formatRelativeDate(dateStr: string): string {
    const sent = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - sent.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "aujourd'hui";
    if (diffDays === 1) return 'hier';
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
}

export default function AdminNewsletter() {
    // --- Form state ---
    const [subject, setSubject] = useState('');
    const [contentText, setContentText] = useState('');
    const [sending, setSending] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // --- Improvement 1: test-before-send gate ---
    const [testPassed, setTestPassed] = useState(false);
    const [testedSubject, setTestedSubject] = useState('');
    const [testedContent, setTestedContent] = useState('');

    // --- Improvement 2: subscriber stats ---
    const [stats, setStats] = useState<SubscriberStats | null>(null);

    // --- Improvement 3: expandable history ---
    const [history, setHistory] = useState<NewsletterHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // --- Improvement 5: auto-save draft ---
    const [draftSaved, setDraftSaved] = useState(false);
    const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const draftIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialLoadDone = useRef(false);

    // Load draft from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (saved) {
                const draft = JSON.parse(saved) as { subject?: string; content?: string };
                if (draft.subject) setSubject(draft.subject);
                if (draft.content) setContentText(draft.content);
            }
        } catch {
            // ignore corrupted localStorage
        }
        initialLoadDone.current = true;
    }, []);

    // Auto-save draft on subject/content change (debounce 1s)
    useEffect(() => {
        if (!initialLoadDone.current) return;
        if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
        draftTimerRef.current = setTimeout(() => {
            if (subject.trim() || contentText.trim()) {
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ subject, content: contentText }));
                setDraftSaved(true);
                if (draftIndicatorTimerRef.current) clearTimeout(draftIndicatorTimerRef.current);
                draftIndicatorTimerRef.current = setTimeout(() => setDraftSaved(false), 2000);
            } else {
                localStorage.removeItem(DRAFT_STORAGE_KEY);
            }
        }, 1000);
        return () => {
            if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
        };
    }, [subject, contentText]);

    // Invalidate test gate if content changes after a successful test
    useEffect(() => {
        if (testPassed && (subject !== testedSubject || contentText !== testedContent)) {
            setTestPassed(false);
        }
    }, [subject, contentText, testPassed, testedSubject, testedContent]);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/admin/newsletter/history`, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login';
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setHistory(data.items || data);
            }
        } catch {
            // silent
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/admin/newsletter/subscribers/stats`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        fetchStats();
    }, [fetchHistory, fetchStats]);

    const handleSendTest = async () => {
        if (!subject.trim() || !contentText.trim()) {
            setToast({ message: 'Veuillez remplir le sujet et le contenu', type: 'error' });
            return;
        }
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/admin/newsletter/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ subject, content_text: contentText }),
            });
            if (res.ok) {
                setToast({ message: 'Email de test envoy\u00e9 avec succ\u00e8s', type: 'success' });
                setTestPassed(true);
                setTestedSubject(subject);
                setTestedContent(contentText);
            } else {
                const data = await res.json().catch(() => null);
                setToast({ message: data?.detail || 'Erreur lors de l\u2019envoi du test', type: 'error' });
            }
        } catch {
            setToast({ message: 'Erreur r\u00e9seau', type: 'error' });
        } finally {
            setSending(false);
        }
    };

    const handleSendAll = async () => {
        setShowConfirmModal(false);
        if (!subject.trim() || !contentText.trim()) {
            setToast({ message: 'Veuillez remplir le sujet et le contenu', type: 'error' });
            return;
        }
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/admin/newsletter/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ subject, content_text: contentText }),
            });
            if (res.ok) {
                setToast({ message: 'Newsletter envoy\u00e9e avec succ\u00e8s !', type: 'success' });
                setSubject('');
                setContentText('');
                setTestPassed(false);
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                fetchHistory();
            } else {
                const data = await res.json().catch(() => null);
                setToast({ message: data?.detail || 'Erreur lors de l\u2019envoi', type: 'error' });
            }
        } catch {
            setToast({ message: 'Erreur r\u00e9seau', type: 'error' });
        } finally {
            setSending(false);
        }
    };

    const handleReuse = (item: NewsletterHistory) => {
        setSubject(item.subject);
        setContentText(item.content_text || '');
        setTestPassed(false);
        setExpandedId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Derived values
    const previewHtml = plainTextToHtml(contentText);
    const canSendAll = testPassed && !sending && !!subject.trim() && !!contentText.trim();
    const lastSentItem = history.find(h => h.sent_at);

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-echo-textMuted hover:text-echo-gold mb-6 transition-colors">
                    <ArrowLeft size={16} /> Retour au dashboard
                </Link>

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-echo-gold/20 rounded-xl">
                        <Newspaper className="text-echo-gold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-white">Newsletter</h1>
                        <p className="text-echo-textMuted text-sm">Composer et envoyer des newsletters aux abonn&eacute;s</p>
                    </div>
                </div>

                {/* Improvement 2 + 4: Stats bar */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-sm">
                    {stats && (
                        <span className="inline-flex items-center gap-1.5 text-echo-textMuted">
                            <Users size={14} className="text-echo-gold" />
                            <span className="text-white font-medium">{stats.active}</span> abonn&eacute;{stats.active > 1 ? 's' : ''} actif{stats.active > 1 ? 's' : ''}
                            <span className="text-white/30 mx-1">&middot;</span>
                            {stats.opted_out} d&eacute;sinscrit{stats.opted_out > 1 ? 's' : ''}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-echo-textMuted">
                        <Clock size={14} className="text-echo-gold" />
                        {lastSentItem
                            ? <>Derni&egrave;re newsletter envoy&eacute;e {formatRelativeDate(lastSentItem.sent_at)}</>
                            : <>Aucune newsletter envoy&eacute;e</>
                        }
                    </span>
                </div>

                {/* Compose + Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* Form */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-serif text-white">Composition</h2>
                            {/* Improvement 5: draft saved indicator */}
                            {draftSaved && (
                                <span className="inline-flex items-center gap-1 text-xs text-white/40 animate-pulse">
                                    <Save size={12} /> Brouillon sauvegard&eacute;
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nl-subject" className="block text-sm text-echo-textMuted mb-1.5">
                                    Sujet
                                </label>
                                <input
                                    id="nl-subject"
                                    type="text"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="Sujet de la newsletter..."
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-echo-gold/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label htmlFor="nl-content" className="block text-sm text-echo-textMuted mb-1.5">
                                    Contenu (texte brut)
                                </label>
                                <textarea
                                    id="nl-content"
                                    value={contentText}
                                    onChange={e => setContentText(e.target.value)}
                                    placeholder="Tapez votre message ici...&#10;&#10;Les URLs seront automatiquement converties en liens.&#10;Les paragraphes sont s&eacute;par&eacute;s par des lignes vides."
                                    rows={12}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-echo-gold/50 transition-colors resize-y font-mono text-sm"
                                />
                            </div>

                            {/* Improvement 1: test gate message */}
                            {!testPassed && (subject.trim() || contentText.trim()) && (
                                <p className="text-xs text-amber-400/70">
                                    Envoyez d&apos;abord un test pour d&eacute;bloquer l&apos;envoi &agrave; tous.
                                </p>
                            )}

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    onClick={handleSendTest}
                                    disabled={sending || !subject.trim() || !contentText.trim()}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <TestTube size={16} />
                                    Envoyer un test
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={!canSendAll}
                                    title={!testPassed ? 'Envoyez d\'abord un test' : undefined}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-echo-gold/20 border border-echo-gold/40 rounded-lg text-echo-gold text-sm font-medium hover:bg-echo-gold/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                    Envoyer &agrave; tous
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-serif text-white mb-4">Aper&ccedil;u</h2>
                        <div className="rounded-lg overflow-hidden border border-white/10">
                            {/* Email header */}
                            <div className="bg-[#1a1a1a] px-6 py-5 text-center border-b border-[#D4AF37]/30">
                                <h3 className="text-[#D4AF37] text-xl font-serif tracking-wide">ECHO</h3>
                                <p className="text-white/40 text-xs mt-1">Mouvement pour la transition &eacute;cologique</p>
                            </div>
                            {/* Email body */}
                            <div className="bg-[#0f0f0f] px-6 py-6">
                                {subject && (
                                    <h4 className="text-white text-lg font-medium mb-4">{subject}</h4>
                                )}
                                {previewHtml ? (
                                    <div
                                        className="text-white/80 text-sm"
                                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    />
                                ) : (
                                    <p className="text-white/30 text-sm italic">
                                        Le contenu de votre newsletter appara&icirc;tra ici...
                                    </p>
                                )}
                            </div>
                            {/* Email footer */}
                            <div className="bg-[#1a1a1a] px-6 py-4 text-center border-t border-white/10">
                                <p className="text-white/30 text-xs">
                                    Mouvement ECHO &mdash; S&eacute;rie documentaire sur la transition &eacute;cologique
                                </p>
                                <p className="text-white/20 text-xs mt-1">
                                    Vous recevez cet email car vous &ecirc;tes abonn&eacute;(e) &agrave; notre newsletter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History — Improvement 3: expandable rows */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-serif text-white mb-4">Historique des envois</h2>

                    {historyLoading ? (
                        <div className="text-center py-8 text-echo-textMuted">Chargement...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-echo-textMuted">Aucun envoi pour le moment</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-3 text-echo-textMuted font-medium w-8"></th>
                                        <th className="text-left py-3 px-3 text-echo-textMuted font-medium">Date</th>
                                        <th className="text-left py-3 px-3 text-echo-textMuted font-medium">Sujet</th>
                                        <th className="text-center py-3 px-3 text-echo-textMuted font-medium">Destinataires</th>
                                        <th className="text-center py-3 px-3 text-echo-textMuted font-medium">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(item => {
                                        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
                                        const isExpanded = expandedId === item.id;
                                        const recipientCount = item.recipients_count ?? item.recipient_count ?? 0;
                                        return (
                                            <tr key={item.id} className="border-b border-white/5 group">
                                                <td colSpan={5} className="p-0">
                                                    {/* Clickable row */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                                        className="w-full grid grid-cols-[2rem_1fr_2fr_6rem_6rem] items-center hover:bg-white/5 transition-colors text-left"
                                                    >
                                                        <span className="py-3 px-3 text-white/40">
                                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </span>
                                                        <span className="py-3 px-3 text-white/70 whitespace-nowrap">
                                                            {new Date(item.sent_at).toLocaleString('fr-FR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                        <span className="py-3 px-3 text-white truncate">{item.subject}</span>
                                                        <span className="py-3 px-3 text-white/70 text-center">{recipientCount}</span>
                                                        <span className="py-3 px-3 text-center">
                                                            <span
                                                                className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                                                                style={{ color: cfg.color, backgroundColor: cfg.bg }}
                                                            >
                                                                {cfg.label}
                                                            </span>
                                                        </span>
                                                    </button>

                                                    {/* Expanded content */}
                                                    {isExpanded && (
                                                        <div className="px-6 pb-4 pt-1 bg-white/[0.02] border-t border-white/5">
                                                            <p className="text-echo-textMuted text-xs mb-2 font-medium uppercase tracking-wide">Contenu</p>
                                                            {item.content_text ? (
                                                                <p className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mb-3">
                                                                    {item.content_text}
                                                                </p>
                                                            ) : (
                                                                <p className="text-white/30 text-sm italic mb-3">Contenu non disponible</p>
                                                            )}
                                                            <button
                                                                onClick={() => handleReuse(item)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-echo-gold/10 border border-echo-gold/30 rounded-lg text-echo-gold text-xs font-medium hover:bg-echo-gold/20 transition-colors"
                                                            >
                                                                <RotateCcw size={12} />
                                                                R&eacute;utiliser
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-serif text-white">Confirmer l&apos;envoi</h3>
                            <button onClick={() => setShowConfirmModal(false)} className="text-echo-textMuted hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-echo-textMuted text-sm mb-2">
                            Vous &ecirc;tes sur le point d&apos;envoyer cette newsletter
                            {stats != null && (
                                <> &agrave; <span className="text-white font-medium">{stats.active} abonn&eacute;{stats.active > 1 ? 's' : ''}</span></>
                            )}
                            .
                        </p>
                        <p className="text-echo-textMuted text-sm mb-6">
                            Sujet : <span className="text-white">{subject}</span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-sm text-echo-textMuted hover:text-white transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSendAll}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-echo-gold/20 border border-echo-gold/40 rounded-lg text-echo-gold text-sm font-medium hover:bg-echo-gold/30 transition-colors"
                            >
                                <Send size={16} />
                                Confirmer l&apos;envoi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
