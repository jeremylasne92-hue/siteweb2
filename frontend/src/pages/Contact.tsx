import { useState } from 'react';
import { Mail, MapPin, Send, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SEO } from '../components/seo/SEO';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { API_URL } from '../config/api';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const SUBJECT_MAP: Record<string, string> = {
    'Question générale': 'question_generale',
    'Presse & Média': 'presse_media',
    'Partenariat': 'partenariat',
    'Autre': 'autre',
};

export function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Question générale');
    const [message, setMessage] = useState('');
    const [consentRGPD, setConsentRGPD] = useState(false);
    const [website, setWebsite] = useState(''); // honeypot
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consentRGPD) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name,
                    email,
                    subject: SUBJECT_MAP[subject] || 'autre',
                    message,
                    consent_rgpd: consentRGPD,
                    website,
                }),
            });

            if (res.status === 429) {
                setStatus('error');
                setErrorMsg('Trop de messages envoyés. Réessayez plus tard.');
                return;
            }

            if (!res.ok) {
                setStatus('error');
                setErrorMsg('Une erreur est survenue. Veuillez réessayer.');
                return;
            }

            setStatus('success');
            setName('');
            setEmail('');
            setSubject('Question générale');
            setMessage('');
            setConsentRGPD(false);
        } catch {
            setStatus('error');
            setErrorMsg('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
    };

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center py-20 bg-echo-darker">
            <SEO
                title="Contact"
                description="Contactez Mouvement ECHO. Association loi 1901, Bougival (78). Formulaire de contact et informations."
                url="https://mouvementecho.fr/contact"
            />
            <Breadcrumbs items={[{ label: 'Contact' }]} />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center opacity-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

                    {/* Contact Info Side */}
                    <div className="md:w-1/3 bg-echo-darker p-6 sm:p-8 md:p-10 flex flex-col justify-between border-r border-white/5">
                        <div>
                            <h2 className="text-2xl font-serif text-white mb-6">Contactez-nous</h2>
                            <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
                                Vous avez une question, une proposition ou simplement envie d'échanger ? Nous lisons tous les messages.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 text-neutral-300">
                                    <Mail className="w-5 h-5 text-echo-gold mt-1" />
                                    <div>
                                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Email</span>
                                        contact@mouvementecho.fr
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-neutral-300">
                                    <MapPin className="w-5 h-5 text-echo-gold mt-1" />
                                    <div>
                                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">QG</span>
                                        Paris, France
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Réseaux Sociaux</span>
                            <div className="flex gap-4">
                                {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-echo-gold hover:text-black transition-all">
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="md:w-2/3 p-6 sm:p-8 md:p-10 bg-white/[0.02]">
                        {status === 'success' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                <div className="w-16 h-16 rounded-full bg-echo-green/20 flex items-center justify-center mb-6">
                                    <Send className="w-8 h-8 text-echo-greenLight" />
                                </div>
                                <h3 className="text-2xl font-serif text-white mb-3">Message envoyé !</h3>
                                <p className="text-neutral-400 max-w-md">
                                    Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8"
                                    onClick={() => setStatus('idle')}
                                >
                                    Envoyer un autre message
                                </Button>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Nom"
                                        placeholder="Votre nom"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        minLength={2}
                                        maxLength={100}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Honeypot field */}
                                <input
                                    type="text"
                                    name="website"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    style={{ position: 'absolute', left: '-9999px', tabIndex: -1 } as React.CSSProperties}
                                    autoComplete="off"
                                    aria-hidden="true"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Sujet</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-echo-gold text-sm"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    >
                                        <option>Question générale</option>
                                        <option>Presse & Média</option>
                                        <option>Partenariat</option>
                                        <option>Autre</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Message</label>
                                    <textarea
                                        className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-echo-gold min-h-[150px] text-sm resize-y"
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        minLength={10}
                                        maxLength={5000}
                                    />
                                </div>

                                <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={consentRGPD}
                                        onChange={(e) => setConsentRGPD(e.target.checked)}
                                        className="mt-1 accent-echo-gold shrink-0"
                                        required
                                    />
                                    <span>
                                        J'accepte que mes données soient traitées conformément à la{' '}
                                        <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
                                           className="text-echo-gold hover:underline">
                                            politique de confidentialité
                                        </a>.
                                    </span>
                                </label>

                                {status === 'error' && (
                                    <p className="text-red-400 text-sm">{errorMsg}</p>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        className="flex items-center gap-2"
                                        disabled={!consentRGPD || status === 'loading'}
                                    >
                                        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}
