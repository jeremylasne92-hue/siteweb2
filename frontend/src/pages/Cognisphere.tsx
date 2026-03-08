import { Brain, BookOpen, Users, Repeat, CalendarClock, Sparkles, FileText, Youtube, StickyNote } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TechApplicationForm } from '../components/forms/TechApplicationForm';

export function Cognisphere() {
    return (
        <div className="flex flex-col min-h-screen bg-echo-darker text-white">
            {/* Hero */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-echo-darker">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2765&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                <div className="relative z-20 text-center max-w-4xl px-4 animate-slide-up">
                    <div className="inline-block p-4 rounded-full bg-violet-500/10 mb-6 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                        <Brain className="w-12 h-12 text-violet-400" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tighter">
                        Cogni<span className="text-violet-400">sphère</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-echo-textMuted mb-4 font-light">
                        Un système de révision et d'apprentissage qui
                        <span className="text-violet-300 font-medium"> met en lien des apprenants</span>.
                    </p>
                    <p className="text-base text-neutral-500 max-w-2xl mx-auto mb-10">
                        Transformez n'importe quel contenu en exercices personnalisés par IA.
                        Mémorisez durablement grâce à la répétition espacée.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#candidature">
                            <Button variant="primary" size="lg" className="bg-violet-500 hover:bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] border-none">
                                <Sparkles className="mr-2" size={20} /> Rejoindre le programme bêta
                            </Button>
                        </a>
                        <a href="#le-constat">
                            <Button variant="secondary" size="lg">
                                <BookOpen className="mr-2" size={18} /> En savoir plus
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Le Problème */}
            <section id="le-constat" className="py-24 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Le constat</span>
                        <h2 className="text-4xl font-serif text-white mb-6">Nous oublions 90% de ce que nous apprenons</h2>
                        <p className="text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                            Selon la courbe d'Ebbinghaus, nous oublions 70% de ce que nous apprenons en 24 heures,
                            et 90% en une semaine. Malgré cela, nos systèmes d'apprentissage reposent encore sur
                            une approche passive et l'accumulation de contenus sans structure.
                        </p>
                    </div>

                    {/* 3 problèmes → 3 solutions */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <ProblemCard
                            emoji="🧠"
                            problem="L'oubli massif"
                            solution="Répétition espacée automatisée"
                            desc="L'algorithme planifie vos révisions en fonction de votre agenda réel, résolvant la procrastination structurelle."
                        />
                        <ProblemCard
                            emoji="📚"
                            problem="L'infobésité"
                            solution="Structuration par l'IA"
                            desc="Transformez vidéos, PDF et notes en quiz, fiches synthèses et mind maps personnalisés automatiquement."
                        />
                        <ProblemCard
                            emoji="🤝"
                            problem="L'isolement"
                            solution="Connexion entre apprenants"
                            desc="Créez des liens avec des apprenants partageant vos centres d'intérêt et favorisez l'intelligence collective."
                        />
                    </div>
                </div>
            </section>

            {/* Comment ça marche */}
            <section className="py-24 bg-violet-500/5 border-y border-violet-500/10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Comment ça marche</span>
                        <h2 className="text-4xl font-serif text-white mb-4">Du contenu brut à la maîtrise durable</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <StepCard
                            step={1}
                            icon={<FileText size={24} />}
                            title="Importez"
                            desc="Vidéo YouTube, PDF, notes manuscrites numérisées... tout contenu devient matière à apprendre."
                        />
                        <StepCard
                            step={2}
                            icon={<Sparkles size={24} />}
                            title="L'IA génère"
                            desc="Quiz, fiches synthèses, mind maps, questions socratiques — des exercices adaptés à votre niveau."
                        />
                        <StepCard
                            step={3}
                            icon={<CalendarClock size={24} />}
                            title="Révisez"
                            desc="L'algorithme de répétition espacée planifie les séances selon votre emploi du temps réel."
                        />
                        <StepCard
                            step={4}
                            icon={<Users size={24} />}
                            title="Connectez"
                            desc="Partagez vos connaissances et échangez avec des apprenants aux mêmes centres d'intérêt."
                        />
                    </div>
                </div>
            </section>

            {/* Types de contenus */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif text-white mb-4">Tous vos contenus, un seul outil</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">
                            Cognisphère s'adapte à tous les formats et tous les profils d'apprenants.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <ContentType icon={<Youtube size={28} />} label="Vidéos YouTube" />
                        <ContentType icon={<FileText size={28} />} label="PDF de cours" />
                        <ContentType icon={<StickyNote size={28} />} label="Notes manuscrites" />
                        <ContentType icon={<BookOpen size={28} />} label="Articles & ebooks" />
                    </div>
                </div>
            </section>

            {/* Modèle économique */}
            <section className="py-24 bg-white/[0.02] border-t border-white/5">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif text-white mb-4">Accessible à tous</h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto mb-12">
                        Le modèle économique est conçu pour ne jamais exclure.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <Card className="p-8 text-center hover:border-violet-500/30 transition-all">
                            <span className="text-3xl font-bold text-white mb-2 block">Gratuit</span>
                            <span className="text-violet-400 font-serif text-lg mb-4 block">Étudiants</span>
                            <p className="text-neutral-400 text-sm">
                                Accès complet pour les étudiants individuels, sans restriction ni limite de temps.
                            </p>
                        </Card>
                        <Card className="p-8 text-center border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:border-violet-400/50 transition-all relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            <span className="text-3xl font-bold text-white mb-2 block">Licence</span>
                            <span className="text-violet-400 font-serif text-lg mb-4 block">Établissements</span>
                            <p className="text-neutral-400 text-sm">
                                Universités, écoles, centres de formation — déployez Cognisphère pour vos apprenants.
                            </p>
                        </Card>
                        <Card className="p-8 text-center hover:border-violet-500/30 transition-all">
                            <span className="text-3xl font-bold text-white mb-2 block">Licence</span>
                            <span className="text-violet-400 font-serif text-lg mb-4 block">Entreprises & Mairies</span>
                            <p className="text-neutral-400 text-sm">
                                Entreprises, mairies et associations — formez vos publics avec un outil adapté.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Origine ECHO */}
            <section className="py-24 border-t border-white/5">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-1/3 flex justify-center">
                            <div className="w-32 h-32 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Repeat className="w-16 h-16 text-violet-400" />
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Né du Mouvement ECHO</span>
                            <h2 className="text-3xl font-serif text-white mb-4">Un outil au service de l'éveil</h2>
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                Au sein de l'association Mouvement ECHO, nous avons à cœur de sensibiliser notre public
                                aux enjeux contemporains — sociétaux, sociaux, environnementaux et existentiels.
                            </p>
                            <p className="text-neutral-400 leading-relaxed">
                                Ayant conscience des problèmes de santé mentale et de l'isolement croissant,
                                nous avons créé Cognisphère pour structurer les connaissances, les mémoriser sur le long terme
                                et permettre la création de liens entre apprenants. Nous portons ce projet depuis mai 2023.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CANDIDATURE FORM (FR17/FR18) */}
            <section id="candidature" className="py-24 bg-violet-500/5 border-t border-violet-500/10">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif text-white mb-4">Rejoindre l'équipe technique</h2>
                        <p className="text-neutral-400 text-lg">
                            Cognisphère est en cours de développement. Soumettez votre candidature pour contribuer au projet.
                        </p>
                    </div>
                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <TechApplicationForm project="cognisphere" accentColor="violet-500" accentHex="#8B5CF6" />
                    </div>
                </div>
            </section>
        </div>
    );
}

function ProblemCard({ emoji, problem, solution, desc }: { emoji: string; problem: string; solution: string; desc: string }) {
    return (
        <Card variant="glass" className="p-8 hover:border-violet-500/30 transition-all">
            <span className="text-4xl mb-4 block">{emoji}</span>
            <p className="text-neutral-500 text-sm line-through mb-1">{problem}</p>
            <h3 className="text-xl font-bold text-violet-300 mb-3">{solution}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
        </Card>
    );
}

function StepCard({ step, icon, title, desc }: { step: number; icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="text-center p-6">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 relative">
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center">{step}</span>
                <span className="text-violet-400">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function ContentType({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/20 transition-all">
            <span className="text-violet-400">{icon}</span>
            <span className="text-sm text-neutral-300 text-center">{label}</span>
        </div>
    );
}
