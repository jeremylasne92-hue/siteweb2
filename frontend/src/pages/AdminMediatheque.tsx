import { useState, useEffect, useRef } from 'react';
import {
    BookOpen, Plus, Pencil, Trash2, Shield,
    RefreshCw, X, Save, Upload, Eye, EyeOff, Star, FileText, Video, Wrench, BookMarked
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ADMIN_MEDIATHEQUE_API } from '../config/api';
import type { MediaResource, ResourceType } from '../types/mediatheque';
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLORS } from '../types/mediatheque';

function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const RESOURCE_TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
    document: <FileText size={16} />,
    video: <Video size={16} />,
    livre: <BookMarked size={16} />,
    outil: <Wrench size={16} />,
};

const emptyForm = {
    resource_type: 'document' as ResourceType,
    title: '',
    description: '',
    thumbnail_url: '',
    external_url: '',
    file_url: '',
    file_name: '',
    file_size: 0,
    tags: [] as string[],
    source: '',
    author: '',
    year: undefined as number | undefined,
    is_featured: false,
    is_published: false,
    sort_order: 0,
};

export default function AdminMediatheque() {
    const [resources, setResources] = useState<MediaResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
    const [aiUrl, setAiUrl] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(ADMIN_MEDIATHEQUE_API, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                setAuthError(true);
                return;
            }
            if (res.ok) {
                setResources(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch resources', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchResources(); }, []);

    const handlePdfUpload = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Seuls les fichiers PDF sont acceptés');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError('Fichier trop volumineux (max 20 Mo)');
            return;
        }
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${ADMIN_MEDIATHEQUE_API}/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                setForm(prev => ({ ...prev, file_url: data.file_url, file_name: data.file_name, file_size: data.file_size }));
            } else {
                setError("Échec de l'upload");
            }
        } catch {
            setError("Échec de l'upload");
        }
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handlePdfUpload(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.description) return;
        if (form.resource_type === 'video' && !form.external_url) return;
        if (form.resource_type === 'livre' && !form.author) return;
        if (form.resource_type === 'outil' && !form.external_url) return;

        setSaving(true);
        setError(null);

        // Auto-generate YouTube thumbnail
        let thumbnailUrl = form.thumbnail_url;
        if (form.resource_type === 'video' && form.external_url) {
            const ytId = extractYouTubeId(form.external_url);
            if (ytId && !thumbnailUrl) {
                thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
            }
        }

        const payload = {
            resource_type: form.resource_type,
            title: form.title,
            description: form.description,
            thumbnail_url: thumbnailUrl || null,
            external_url: form.external_url || null,
            file_url: form.file_url || null,
            file_name: form.file_name || null,
            file_size: form.file_size || null,
            tags: form.tags,
            source: form.source || null,
            author: form.author || null,
            year: form.year || null,
            is_featured: form.is_featured,
            is_published: form.is_published,
            sort_order: form.sort_order,
        };

        try {
            const url = editingId ? `${ADMIN_MEDIATHEQUE_API}/${editingId}` : ADMIN_MEDIATHEQUE_API;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                resetForm();
                await fetchResources();
            } else {
                const data = await res.json().catch(() => null);
                setError(data?.detail || `Erreur ${res.status} lors de l'enregistrement.`);
            }
        } catch (err) {
            console.error(err);
            setError('Impossible de contacter le serveur.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (resource: MediaResource) => {
        setForm({
            resource_type: resource.resource_type,
            title: resource.title,
            description: resource.description || '',
            thumbnail_url: resource.thumbnail_url || '',
            external_url: resource.external_url || '',
            file_url: resource.file_url || '',
            file_name: resource.file_name || '',
            file_size: resource.file_size || 0,
            tags: resource.tags || [],
            source: resource.source || '',
            author: resource.author || '',
            year: resource.year ?? undefined,
            is_featured: resource.is_featured,
            is_published: resource.is_published,
            sort_order: resource.sort_order,
        });
        setEditingId(resource.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Supprimer cette ressource ? Cette action est irréversible.')) return;
        try {
            const res = await fetch(`${ADMIN_MEDIATHEQUE_API}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setDeleteConfirmId(null);
                await fetchResources();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleTogglePublish = async (id: string) => {
        try {
            const res = await fetch(`${ADMIN_MEDIATHEQUE_API}/${id}/publish`, {
                method: 'PATCH',
                credentials: 'include',
            });
            if (res.ok) {
                await fetchResources();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAiEnrich = async () => {
        if (!aiUrl.trim()) return;
        setAiLoading(true);
        setError(null);
        try {
            const res = await fetch(`${ADMIN_MEDIATHEQUE_API}/ai-enrich`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ url: aiUrl }),
            });
            if (res.ok) {
                const data = await res.json();
                setForm(prev => ({
                    ...prev,
                    resource_type: data.resource_type || prev.resource_type,
                    title: data.title || prev.title,
                    description: data.ai_description || prev.description,
                    external_url: data.external_url || prev.external_url,
                    thumbnail_url: data.thumbnail_url || prev.thumbnail_url,
                    source: data.source || prev.source,
                    author: data.author || prev.author,
                    tags: data.tags || prev.tags,
                }));
            } else {
                setError('Échec de l\'enrichissement IA. Vérifiez l\'URL.');
            }
        } catch {
            setError('Impossible de contacter le service IA.');
        }
        setAiLoading(false);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        setError(null);
        setAiUrl('');
    };

    const filteredResources = filterType === 'all'
        ? resources
        : resources.filter(r => r.resource_type === filterType);

    const youtubeId = form.resource_type === 'video' && form.external_url
        ? extractYouTubeId(form.external_url)
        : null;

    if (authError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md p-8 bg-white/5 border border-white/10 rounded-xl">
                    <Shield className="mx-auto mb-4 text-red-400" size={48} />
                    <h2 className="text-xl font-serif text-white mb-2">Acces refuse</h2>
                    <p className="text-echo-textMuted mb-4">
                        Cette page est reservee aux administrateurs.
                    </p>
                    <Button onClick={() => window.location.href = '/'}>
                        Retour a l&apos;accueil
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-echo-dark pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-echo-gold/20 rounded-lg">
                            <BookOpen className="text-echo-gold" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white">Gestion de la Mediatheque</h1>
                            <p className="text-sm text-echo-textMuted">Documents, videos, livres et outils pedagogiques</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={fetchResources}>
                            <RefreshCw size={16} className="mr-2" /> Actualiser
                        </Button>
                        <Button onClick={() => { resetForm(); setShowForm(true); }}>
                            <Plus size={16} className="mr-2" /> Nouvelle ressource
                        </Button>
                    </div>
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-serif text-white">
                                {editingId ? 'Modifier la ressource' : 'Nouvelle ressource'}
                            </h2>
                            <button onClick={resetForm} className="text-echo-textMuted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* AI Enrichment */}
                        <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                            <label className="block text-xs text-amber-400 uppercase tracking-wider mb-2">
                                Enrichissement IA — Collez une URL pour pré-remplir
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={aiUrl}
                                    onChange={e => setAiUrl(e.target.value)}
                                    className="flex-1 rounded-md border border-amber-500/30 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    placeholder="https://www.youtube.com/watch?v=... ou https://example.com"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleAiEnrich}
                                    disabled={aiLoading || !aiUrl.trim()}
                                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 shrink-0"
                                >
                                    {aiLoading ? (
                                        <RefreshCw size={16} className="mr-2 animate-spin" />
                                    ) : (
                                        <span className="mr-2">&#10024;</span>
                                    )}
                                    {aiLoading ? 'Analyse...' : 'Enrichir'}
                                </Button>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1.5">
                                L&apos;IA extraira le titre, la description et les tags depuis l&apos;URL.
                            </p>
                        </div>

                        {/* Resource type selector */}
                        <div className="mb-6">
                            <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-2">Type de ressource</label>
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setForm(prev => ({ ...prev, resource_type: type }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                            form.resource_type === type
                                                ? `${RESOURCE_TYPE_COLORS[type].badge} border-current`
                                                : 'bg-white/5 text-echo-textMuted border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {RESOURCE_TYPE_ICONS[type]}
                                        {RESOURCE_TYPE_LABELS[type]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Common fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Titre *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="Titre de la ressource"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Source</label>
                                <input
                                    type="text"
                                    value={form.source}
                                    onChange={e => setForm({ ...form, source: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="Origine de la ressource"
                                />
                            </div>
                            {/* Author — required for livre */}
                            {(form.resource_type === 'livre' || form.resource_type === 'document') && (
                                <div>
                                    <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">
                                        Auteur {form.resource_type === 'livre' ? '*' : ''}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.author}
                                        onChange={e => setForm({ ...form, author: e.target.value })}
                                        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                        placeholder="Nom de l'auteur"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Annee</label>
                                <input
                                    type="number"
                                    value={form.year ?? ''}
                                    onChange={e => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="2026"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Tags (separes par virgule)</label>
                                <input
                                    type="text"
                                    value={form.tags.join(', ')}
                                    onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="ecologie, transition, climat"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Ordre de tri</label>
                                <input
                                    type="number"
                                    value={form.sort_order}
                                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                />
                            </div>
                        </div>

                        {/* External URL — required for video and outil, optional for livre */}
                        {(form.resource_type === 'video' || form.resource_type === 'outil' || form.resource_type === 'livre') && (
                            <div className="mb-4">
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">
                                    {form.resource_type === 'video' ? 'URL YouTube *' :
                                     form.resource_type === 'outil' ? 'Lien vers l\'outil *' :
                                     'Lien d\'achat'}
                                </label>
                                <input
                                    type="url"
                                    value={form.external_url}
                                    onChange={e => setForm({ ...form, external_url: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder={form.resource_type === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
                                />
                                {/* YouTube thumbnail preview */}
                                {youtubeId && (
                                    <div className="mt-2">
                                        <img
                                            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                            alt="YouTube thumbnail"
                                            className="w-48 rounded-lg border border-white/10"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PDF upload — for document (primary) and livre (optional) */}
                        {(form.resource_type === 'document' || form.resource_type === 'livre') && (
                            <div className="mb-4">
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-2">
                                    <FileText size={12} className="inline mr-1" />
                                    Fichier PDF {form.resource_type === 'document' ? '' : '(optionnel)'}
                                </label>

                                {form.file_url ? (
                                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                                        <FileText size={20} className="text-echo-gold shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{form.file_name}</p>
                                            {form.file_size > 0 && (
                                                <p className="text-xs text-echo-textMuted">{formatFileSize(form.file_size)}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setForm(prev => ({ ...prev, file_url: '', file_name: '', file_size: 0 }))}
                                            className="p-1 text-red-400 hover:text-red-300"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                                            dragOver ? 'border-echo-gold bg-echo-gold/5' : 'border-white/20 hover:border-white/40'
                                        }`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mx-auto mb-2 text-echo-textMuted" size={24} />
                                        <p className="text-sm text-echo-textMuted">
                                            {uploading ? 'Upload en cours...' : 'Glissez un PDF ici ou cliquez pour selectionner'}
                                        </p>
                                        <p className="text-xs text-echo-textMuted/60 mt-1">PDF uniquement — max 20 Mo</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-4">
                            <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Description *</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 min-h-[100px]"
                                placeholder="Description de la ressource..."
                            />
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center gap-6 mb-4">
                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                                className="flex items-center gap-2 text-sm"
                            >
                                <Star size={18} className={form.is_featured ? 'text-echo-gold fill-echo-gold' : 'text-echo-textMuted'} />
                                <span className={form.is_featured ? 'text-white' : 'text-echo-textMuted'}>Mise en avant</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={resetForm}>Annuler</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={saving || uploading || !form.title || !form.description}
                            >
                                <Save size={16} className="mr-2" />
                                {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Creer'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Type filter tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            filterType === 'all'
                                ? 'bg-echo-gold/20 text-echo-gold'
                                : 'bg-white/5 text-echo-textMuted hover:bg-white/10'
                        }`}
                    >
                        Tous ({resources.length})
                    </button>
                    {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]).map(type => {
                        const count = resources.filter(r => r.resource_type === type).length;
                        return (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    filterType === type
                                        ? RESOURCE_TYPE_COLORS[type].badge
                                        : 'bg-white/5 text-echo-textMuted hover:bg-white/10'
                                }`}
                            >
                                {RESOURCE_TYPE_ICONS[type]}
                                {RESOURCE_TYPE_LABELS[type]} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Resources Table */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Titre</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Source / Auteur</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Publie</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-echo-textMuted">Chargement...</td></tr>
                                ) : filteredResources.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-echo-textMuted">Aucune ressource. Creez-en une !</td></tr>
                                ) : filteredResources.map(resource => (
                                    <tr key={resource.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${RESOURCE_TYPE_COLORS[resource.resource_type].badge}`}>
                                                {RESOURCE_TYPE_ICONS[resource.resource_type]}
                                                {RESOURCE_TYPE_LABELS[resource.resource_type]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {resource.is_featured && <Star size={14} className="inline mr-1 text-echo-gold fill-echo-gold" />}
                                                    {resource.title}
                                                </p>
                                                {resource.tags.length > 0 && (
                                                    <p className="text-xs text-echo-textMuted mt-0.5">{resource.tags.join(', ')}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-echo-textMuted">
                                                {resource.author || resource.source || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleTogglePublish(resource.id)}
                                                className="transition-colors"
                                                title={resource.is_published ? 'Depublier' : 'Publier'}
                                            >
                                                {resource.is_published ? (
                                                    <Eye size={18} className="text-green-400" />
                                                ) : (
                                                    <EyeOff size={18} className="text-echo-textMuted/40" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(resource)}
                                                    className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                {deleteConfirmId === resource.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(resource.id)}
                                                            className="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600"
                                                        >
                                                            Confirmer
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="px-2 py-1 rounded text-xs bg-white/10 text-white hover:bg-white/20"
                                                        >
                                                            Non
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(resource.id)}
                                                        className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
