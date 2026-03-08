import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { API_URL } from '../../config/api';

interface TechApplicationFormProps {
    project: 'cognisphere' | 'echolink';
    accentColor: string;     // e.g. "violet-500" or "echo-blueLight"
    accentHex: string;       // e.g. "#8B5CF6" or "#60A5FA"
}

export function TechApplicationForm({ project, accentHex }: TechApplicationFormProps) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_URL}/candidatures/tech`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    skills: formData.get('skills'),
                    message: formData.get('message'),
                    project,
                    website: formData.get('website') || '',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.rate_limited) {
                    setError('Trop de soumissions récentes. Réessayez plus tard.');
                } else {
                    setSubmitted(true);
                }
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } catch {
            setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${accentHex}20` }}>
                    <CheckCircle className="w-8 h-8" style={{ color: accentHex }} />
                </div>
                <h3 className="text-2xl font-serif text-white mb-3">Candidature envoyée !</h3>
                <p className="text-neutral-400 max-w-md">
                    Merci pour votre intérêt. Notre équipe examinera votre profil et vous contactera prochainement.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Nom complet" name="name" placeholder="Votre nom" required minLength={2} maxLength={100} />
                <Input label="Email" name="email" type="email" placeholder="votre@email.com" required />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Compétences techniques</label>
                <textarea
                    name="skills"
                    className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm resize-y min-h-[80px]"
                    placeholder="React, TypeScript, Python, Node.js..."
                    required
                    minLength={2}
                    maxLength={500}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Motivation</label>
                <textarea
                    name="message"
                    className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 text-sm resize-y min-h-[120px]"
                    placeholder="Pourquoi souhaitez-vous rejoindre l'équipe ?"
                    required
                    minLength={10}
                    maxLength={2000}
                />
            </div>

            {/* Honeypot — hidden from users, visible to bots */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex justify-end">
                <Button
                    variant="primary"
                    className="flex items-center gap-2 hover:opacity-90"
                    style={{ backgroundColor: accentHex }}
                    disabled={loading}
                >
                    {loading ? 'Envoi...' : 'Envoyer ma candidature'} <Send className="w-4 h-4" />
                </Button>
            </div>
        </form>
    );
}
