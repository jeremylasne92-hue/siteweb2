import { useState, useEffect } from 'react';
import {
    Calendar, Plus, Pencil, Trash2, Shield,
    RefreshCw, X, Save
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../components/ui/Button';
import { EVENTS_API } from '../config/api';

interface EventItem {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: string;
    image_url?: string;
    is_published: boolean;
    created_at: string;
}

const EVENT_TYPES = ['Projection', 'Atelier', 'Conférence', 'En ligne'];

const emptyForm = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'Projection',
    image_url: '',
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

    const handleSubmit = async () => {
        if (!form.title || !form.description || !form.date || !form.time || !form.location) return;
        setSaving(true);

        const payload = {
            ...form,
            date: new Date(form.date).toISOString(),
            image_url: form.image_url || null,
        };

        try {
            const url = editingId ? `${EVENTS_API}/${editingId}` : EVENTS_API;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                resetForm();
                await fetchEvents();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (event: EventItem) => {
        setForm({
            title: event.title,
            description: event.description,
            date: event.date.split('T')[0],
            time: event.time,
            location: event.location,
            type: event.type,
            image_url: event.image_url || '',
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
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
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
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Heure *</label>
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
                                <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={form.image_url}
                                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs text-echo-textMuted uppercase tracking-wider mb-1">Description *</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 min-h-[100px]"
                                placeholder="Description de l'événement..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={resetForm}>Annuler</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={saving || !form.title || !form.description || !form.date || !form.time || !form.location}
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
                                    <th className="px-4 py-3 text-xs font-medium text-echo-textMuted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-echo-textMuted">Chargement...</td></tr>
                                ) : events.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-echo-textMuted">Aucun événement. Créez-en un !</td></tr>
                                ) : events.map(event => (
                                    <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-white">{event.title}</p>
                                            <p className="text-xs text-echo-textMuted line-clamp-1">{event.description}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-white">
                                                {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="block text-xs text-echo-textMuted">{event.time}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-echo-textMuted">{event.location}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-echo-gold/10 text-echo-gold border border-echo-gold/20">
                                                {event.type}
                                            </span>
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
