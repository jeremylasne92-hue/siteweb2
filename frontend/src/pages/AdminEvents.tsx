import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Calendar, Plus, Pencil, Trash2, Shield,
    RefreshCw, X, Save, Upload, Image as ImageIcon, Link as LinkIcon, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EVENTS_API } from '../config/api';

interface EventItem {
    id: string;
    title: string;
    description?: string;
    date: string;
    date_end?: string;
    time?: string;
    location: string;
    type: string;
    image_url?: string;
    images: string[];
    booking_enabled: boolean;
    booking_url?: string;
    organizer?: string;
    is_published: boolean;
    created_at: string;
}

const EVENT_TYPES = ['Projection', 'Atelier', 'Conférence', 'En ligne'];

const emptyForm = {
    title: '',
    description: '',
    date: '',
    date_end: '',
    time: '',
    location: '',
    type: 'Projection',
    image_url: '',
    images: [] as string[],
    booking_enabled: false,
    booking_url: '',
    organizer: '',
};

export default function AdminEvents() {
    const [events, setEvents] = useState<EventItem[]>([]);
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${EVENTS_API}`, {
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                setAuthError(true);
                return;
            }
            if (res.ok) {
                setEvents(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const uploadImage = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`${EVENTS_API}/upload-image`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                return data.url;
            }
        } catch (err) {
            console.error('Upload failed', err);
        }
        return null;
    };

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const remaining = 10 - form.images.length;
        if (remaining <= 0) return;

        const toUpload = Array.from(files).slice(0, remaining);
        setUploading(true);
        setError(null);

        const urls: string[] = [];
        let failCount = 0;
        for (const file of toUpload) {
            const url = await uploadImage(file);
            if (url) urls.push(url);
            else failCount++;
        }

        if (urls.length > 0) {
            setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
        }
        if (failCount > 0) {
            setError(`${failCount} image(s) n'ont pas pu être envoyées. Vérifiez le format (JPEG, PNG, WebP) et la taille (max 5 Mo).`);
        }
        setUploading(false);
    }, [form.images.length]);

    const removeImage = (index: number) => {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleSubmit = async () => {
        if (!form.title || !form.date || !form.location) return;
        setSaving(true);
        setError(null);

        const payload = {
            title: form.title,
            description: form.description || null,
            date: new Date(form.date).toISOString(),
            date_end: form.date_end ? new Date(form.date_end).toISOString() : null,
            time: form.time || null,
            location: form.location,
            type: form.type,
            image_url: form.image_url || null,
            images: form.images,
            booking_enabled: form.booking_enabled,
            booking_url: form.booking_url || null,
            organizer: form.organizer || null,
        };

        try {
            const url = editingId ? `${EVENTS_API}/${editingId}` : EVENTS_API;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                resetForm();
                await fetchEvents();
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

    const handleEdit = (event: EventItem) => {
        setForm({
            title: event.title,
            description: event.description || '',
            date: event.date.split('T')[0],
            date_end: event.date_end ? event.date_end.split('T')[0] : '',
            time: event.time || '',
            location: event.location,
            type: event.type,
            image_url: event.image_url || '',
            images: event.images || [],
            booking_enabled: event.booking_enabled || false,
            booking_url: event.booking_url || '',
            organizer: event.organizer || '',
        });
        setEditingId(event.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${EVENTS_API}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setDeleteConfirmId(null);
                await fetchEvents();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        setError(null);
    };

    const formatDateRange = (event: EventItem) => {
        const start = new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        if (event.date_end) {
            const end = new Date(event.date_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            return `${start} → ${end}`;
        }
        return start;
    };

    if (authError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md p-8 bg-white/5 border border-white/10 rounded-xl">
                    <Shield className="mx-auto mb-4 text-red-400" size={48} />
                    <h2 className="text-xl font-serif text-white mb-2">Accès refusé</h2>
                    <p className="text-echo-textMuted mb-4">
                        Cette page est réservée aux administrateurs.
                    </p>
                    <Button onClick={() => window.location.href = '/'}>
                        Retour à l'accueil
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
                            <Calendar className="text-echo-gold" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white">Gestion des Événements</h1>
                            <p className="text-sm text-echo-textMuted">Créer, modifier et supprimer des événements publics</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={fetchEvents}>
                            <RefreshCw size={16} className="mr-2" /> Actualiser
                        </Button>
                        <Button onClick={() => { resetForm(); setShowForm(true); }}>
                            <Plus size={16} className="mr-2" /> Nouvel événement
                        </Button>
                    </div>
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-serif text-white">
                                {editingId ? 'Modifier l\'événement' : 'Nouvel événement'}
                            </h2>
                            <button onClick={resetForm} className="text-echo-textMuted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Titre *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="Avant-première Saison 1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Lieu *</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="Paris, Le Grand Rex"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Date début *</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Date fin</label>
                                <input
                                    type="date"
                                    value={form.date_end}
                                    onChange={e => setForm({ ...form, date_end: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Heure</label>
                                <input
                                    type="time"
                                    value={form.time}
                                    onChange={e => setForm({ ...form, time: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Type *</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                >
                                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Organisé par</label>
                                <input
                                    type="text"
                                    value={form.organizer}
                                    onChange={e => setForm({ ...form, organizer: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="L'équipe ECHO (par défaut)"
                                />
                            </div>
                        </div>

                        {/* Booking toggle */}
                        <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, booking_enabled: !prev.booking_enabled }))}
                                    className="text-echo-gold"
                                >
                                    {form.booking_enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-echo-textMuted" />}
                                </button>
                                <span className="text-sm text-white">Réservation activée</span>
                            </div>
                            {form.booking_enabled && (
                                <div className="mt-2">
                                    <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">
                                        <LinkIcon size={12} className="inline mr-1" />
                                        Lien de réservation
                                    </label>
                                    <input
                                        type="url"
                                        value={form.booking_url}
                                        onChange={e => setForm({ ...form, booking_url: e.target.value })}
                                        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                        placeholder="https://www.billetweb.fr/... (vide = redirige vers Contact)"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Images drag & drop */}
                        <div className="mb-4">
                            <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-2">
                                <ImageIcon size={12} className="inline mr-1" />
                                Images ({form.images.length}/10)
                            </label>

                            {/* Drop zone */}
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                                    dragOver ? 'border-echo-gold bg-echo-gold/5' : 'border-white/20 hover:border-white/40'
                                } ${form.images.length >= 10 ? 'opacity-50 pointer-events-none' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mx-auto mb-2 text-echo-textMuted" size={24} />
                                <p className="text-sm text-echo-textMuted">
                                    {uploading ? 'Upload en cours...' : 'Glissez vos images ici ou cliquez pour sélectionner'}
                                </p>
                                <p className="text-xs text-echo-textMuted/60 mt-1">JPEG, PNG, WebP — max 5 Mo par image</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                                />
                            </div>

                            {/* Image previews */}
                            {form.images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                                    {form.images.map((url, i) => (
                                        <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10">
                                            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 p-1 bg-red-500/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} className="text-white" />
                                            </button>
                                            {i === 0 && (
                                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-echo-gold/90 text-black text-[10px] rounded font-medium">
                                                    Principale
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 min-h-[100px]"
                                placeholder="Description de l'événement (facultatif)..."
                            />
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
                                disabled={saving || uploading || !form.title || !form.date || !form.location}
                            >
                                <Save size={16} className="mr-2" />
                                {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Events Table */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Événement</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Lieu</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider">Résa</th>
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-echo-textMuted">Chargement...</td></tr>
                                ) : events.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-echo-textMuted">Aucun événement. Créez-en un !</td></tr>
                                ) : events.map(event => (
                                    <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {(event.images?.[0] || event.image_url) && (
                                                    <img
                                                        src={event.images?.[0] || event.image_url}
                                                        alt=""
                                                        className="w-10 h-10 rounded object-cover shrink-0"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-white">{event.title}</p>
                                                    {event.description && (
                                                        <p className="text-xs text-echo-textMuted line-clamp-1">{event.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-white">{formatDateRange(event)}</span>
                                            {event.time && (
                                                <span className="block text-xs text-echo-textMuted">{event.time}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-echo-textMuted">{event.location}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-echo-gold/10 text-echo-gold border border-echo-gold/20">
                                                {event.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {event.booking_enabled ? (
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                    Oui
                                                </span>
                                            ) : (
                                                <span className="text-xs text-echo-textMuted/40">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(event)}
                                                    className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                {deleteConfirmId === event.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(event.id)}
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
                                                        onClick={() => setDeleteConfirmId(event.id)}
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
