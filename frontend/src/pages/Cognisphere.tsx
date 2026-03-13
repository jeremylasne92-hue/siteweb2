import { useState } from 'react';
import { Brain, BookOpen, Users, Repeat, CalendarClock, Sparkles, FileText, Youtube, StickyNote, Network, MessageSquare, Gamepad2, Map, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TechApplicationForm } from '../components/forms/TechApplicationForm';

const SCREENS = [
    { id: 'dashboard', label: 'Tableau de bord', src: '/images/cognisphere/dashboard.jpg' },
    { id: 'revision', label: 'Révision SRS', src: '/images/cognisphere/revision.jpg' },
    { id: 'graphe', label: 'Graphe de connaissances', src: '/images/cognisphere/graphe.jpg' },
    { id: 'planning', label: 'Smart Planning', src: '/images/cognisphere/planning.jpg' },
    { id: 'tuteur', label: 'Tuteur Socratique', src: '/images/cognisphere/tuteur.jpg' },
];

export function Cognisphere() {
    const [activeScreen, setActiveScreen] = useState(0);

    return (
        <div className="flex flex-col min-h-screen bg-echo-darker text-white">
            {/* Hero */}
            <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-echo-darker">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2765&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                <div className="relative z-20 text-center max-w-4xl px-4 animate-slide-up">
                    <div className="inline-block p-4 rounded-full bg-violet-500/10 mb-6 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                        <Brain className="w-12 h-12 text-violet-400" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 sm:mb-6 tracking-tighter">
                        Cogni<span className="text-violet-400">sphère</span>
                    </h1>
                    <p className="text-base sm:text-xl md:text-2xl text-echo-textMuted mb-4 font-light">
                        Le <span className="text-violet-300 font-medium">système d'apprentissage intelligent</span> qui transforme
                        n'importe quel contenu en connaissance durable.
                    </p>
                    <div className="mb-10" />

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#apercu">
                            <Button variant="primary" size="lg" className="bg-violet-500 hover:bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] border-none">
                                <Sparkles className="mr-2" size={20} /> Découvrir l'application
                            </Button>
                        </a>
                        <a href="#candidature">
                            <Button variant="secondary" size="lg">
                                <BookOpen className="mr-2" size={18} /> Rejoindre l'équipe
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Le Constat */}
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

                    <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
                        <ProblemCard
                            emoji="🧠"
                            problem="L'oubli massif"
                            solution="Répétition espacée (FSRS-5)"
                            desc="L'algorithme planifie vos révisions au moment optimal. Connecté à votre calendrier réel, il détecte les créneaux libres et s'adapte à votre charge."
                        />
                        <ProblemCard
                            emoji="📚"
                            problem="L'infobésité"
                            solution="Transformation par IA"
                            desc="Importez vidéos, PDF, podcasts ou notes. L'IA les transforme en quiz, flashcards, mind maps et résumés, automatiquement et localement."
                        />
                        <ProblemCard
                            emoji="🤝"
                            problem="L'isolement"
                            solution="Réseau social cognitif"
                            desc="Votre graphe de connaissances vous connecte à des apprenants complémentaires. Échangez, collaborez et apprenez ensemble."
                        />
                    </div>
                </div>
            </section>

            {/* Aperçu de l'Application */}
            <section id="apercu" className="py-24 bg-violet-500/5 border-y border-violet-500/10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Aperçu</span>
                        <h2 className="text-4xl font-serif text-white mb-4">Une application pensée pour apprendre</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">
                            Découvrez les différentes interfaces de Cognisphère, actuellement en cours de développement.
                        </p>
                    </div>

                    {/* Screen Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {SCREENS.map((screen, i) => (
                            <button
                                key={screen.id}
                                onClick={() => setActiveScreen(i)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    activeScreen === i
                                        ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {screen.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop Mockup */}
                    <div className="max-w-5xl mx-auto">
                        <div className="relative">
                            {/* Laptop Frame */}
                            <div className="bg-neutral-800 rounded-t-xl p-2 pt-6 relative">
                                {/* Camera dot */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-600" />
                                {/* Screen */}
                                <div className="rounded-lg overflow-hidden bg-black aspect-[16/10] relative">
                                    {SCREENS.map((screen, i) => (
                                        <img
                                            key={screen.id}
                                            src={screen.src}
                                            alt={`Cognisphère — ${screen.label}`}
                                            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
                                                activeScreen === i ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Laptop Base */}
                            <div className="bg-neutral-700 h-4 rounded-b-xl mx-16" />
                            <div className="bg-neutral-600 h-1.5 rounded-b-lg mx-24" />
                        </div>

                        {/* Screen Description */}
                        <div className="text-center mt-8">
                            <ScreenDescription index={activeScreen} />
                        </div>
                    </div>

                    {/* Mobile + Desktop Side by Side */}
                    <div className="mt-12 sm:mt-20 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                        {/* Phone Mockup */}
                        <div className="relative w-[220px] flex-shrink-0">
                            <div className="bg-neutral-800 rounded-[2rem] p-2 pt-8 pb-8 shadow-2xl border border-neutral-700">
                                {/* Notch */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-neutral-900" />
                                {/* Screen */}
                                <div className="rounded-2xl overflow-hidden bg-black aspect-[9/19]">
                                    <img
                                        src="/images/cognisphere/mobile.png"
                                        alt="Cognisphère Mobile — Tableau de bord"
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                {/* Home Bar */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-neutral-600" />
                            </div>
                        </div>

                        {/* Text */}
                        <div className="max-w-md text-center md:text-left">
                            <h3 className="text-2xl font-serif text-white mb-4">Révisez partout</h3>
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                L'application mobile companion vous permet de réviser vos flashcards et quiz
                                en déplacement. Synchronisation transparente avec le desktop.
                            </p>
                            <ul className="space-y-2 text-neutral-400 text-sm">
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-violet-400 flex-shrink-0" /> Révision SRS hors-ligne</li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-violet-400 flex-shrink-0" /> Notifications intelligentes</li>
                                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-violet-400 flex-shrink-0" /> Suivi de streaks et progression</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Les 3 Piliers */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Les fondations</span>
                        <h2 className="text-4xl font-serif text-white mb-4">Trois piliers cognitifs prouvés par la science</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">
                            Cognisphère repose sur des décennies de recherche en psychologie cognitive
                            et en neurosciences de l'apprentissage.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PillarCard
                            icon={<Brain size={28} />}
                            title="Active Recall"
                            subtitle="Rappel actif"
                            desc="Se tester activement plutôt que relire. Les étudiants qui se testent retiennent 50% de plus après une semaine (Roediger & Karpicke, 2006)."
                            detail="Quiz générés par IA, tuteur socratique, validation par le graphe de connaissances."
                        />
                        <PillarCard
                            icon={<CalendarClock size={28} />}
                            title="Spaced Repetition"
                            subtitle="Répétition espacée"
                            desc="Réviser au bon moment grâce à l'algorithme FSRS-5. Chaque carte est planifiée selon sa difficulté, stabilité et probabilité de rappel."
                            detail="Smart Scheduling intégré à Google Calendar et Pronote pour réviser aux créneaux optimaux."
                        />
                        <PillarCard
                            icon={<Users size={28} />}
                            title="Social Learning"
                            subtitle="Apprentissage social"
                            desc="Apprendre seul est moins efficace. La théorie de Vygotsky (ZPD) et l'Effet Protégé montrent la puissance de l'apprentissage collaboratif."
                            detail="Matching de binômes, playlists partagées, Focus Camps et comparaison de graphes."
                        />
                    </div>
                </div>
            </section>

            {/* Fonctionnalités clés */}
            <section className="py-24 bg-white/[0.02] border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Fonctionnalités</span>
                        <h2 className="text-4xl font-serif text-white mb-4">Un écosystème complet d'apprentissage</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <FeatureCard
                            icon={<FileText size={24} />}
                            title="Ingestion Universelle"
                            desc="YouTube, PDF, podcasts, notes, Kindle, Anki... Importez n'importe quel contenu. Tout est traité localement."
                        />
                        <FeatureCard
                            icon={<MessageSquare size={24} />}
                            title="Tuteur Socratique"
                            desc="Un compagnon IA qui guide sans remplacer l'enseignant. Il pose des questions, utilise des analogies et s'adapte à votre niveau pour renforcer la compréhension."
                        />
                        <FeatureCard
                            icon={<CalendarClock size={24} />}
                            title="Smart Scheduling"
                            desc="Connecté à votre calendrier et Pronote, il détecte les créneaux libres et planifie les révisions au moment optimal."
                        />
                        <FeatureCard
                            icon={<Network size={24} />}
                            title="Graphe de Connaissances"
                            desc="Visualisez vos savoirs sous forme de réseau interactif. Identifiez vos forces, lacunes et connexions entre domaines."
                        />
                        <FeatureCard
                            icon={<Gamepad2 size={24} />}
                            title="Gamification"
                            desc="Streaks, XP, certifications 'Proof of Knowledge' et Palais Mental immersif pour rendre l'apprentissage motivant."
                        />
                        <FeatureCard
                            icon={<Map size={24} />}
                            title="Palais Mental"
                            desc="Transformez vos connaissances en environnement 3D explorable. Débloquez des artefacts en maîtrisant des sujets."
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
                            Cognisphère ingère et transforme tous les formats en matériel d'apprentissage actif.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <ContentType icon={<Youtube size={28} />} label="Vidéos YouTube" />
                        <ContentType icon={<FileText size={28} />} label="PDF & Documents" />
                        <ContentType icon={<StickyNote size={28} />} label="Notes & Highlights" />
                        <ContentType icon={<BookOpen size={28} />} label="Articles & Podcasts" />
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section className="py-24 bg-violet-500/5 border-y border-violet-500/10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Roadmap</span>
                        <h2 className="text-4xl font-serif text-white mb-4">Un développement par étapes</h2>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-violet-500/20" />

                            <RoadmapItem
                                phase="Phase 1 — Version Bêta"
                                title="MVP Desktop + Mobile Companion"
                                timeline="Juin 2026"
                                items={['Ingestion (YouTube, PDF, Web)', 'Flashcards & Quiz par IA', 'Algorithme SRS (FSRS-5)', 'App mobile pour réviser en déplacement', 'Interface adaptative par profil d\'âge']}
                                side="left"
                                active
                            />
                            <RoadmapItem
                                phase="Phase 2"
                                title="Social, Gamification & Smart Scheduling"
                                timeline="Décembre 2026"
                                items={['Graphe de connaissances interactif', 'Matching de binômes & playlists', 'Focus Camps collaboratifs', 'Smart Scheduling (Calendar + Pronote)', 'Tuteur Socratique avancé']}
                                side="right"
                            />
                            <RoadmapItem
                                phase="Phase 3+"
                                title="Mobile complet & Palais Mental"
                                timeline="2027"
                                items={['App mobile avec toutes les fonctionnalités', 'Palais Mental 3D (Desktop)', 'Flux éducatif & Principes du Vivant', 'Certifications Proof of Knowledge', 'Cognisphère Wrapped mensuel']}
                                side="left"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Origine ECHO */}
            <section className="py-24 border-t border-white/5">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
                        <div className="md:w-1/3 flex justify-center">
                            <div className="w-32 h-32 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Repeat className="w-16 h-16 text-violet-400" />
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <span className="text-violet-400 uppercase tracking-widest text-sm font-bold mb-4 block">Né du Mouvement ECHO</span>
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                L'idée de Cognisphère est née en hiver 2025, face au constat que nous oublions
                                l'essentiel de ce que nous regardons ou étudions. Nous voulions un outil qui transforme
                                la curiosité en connaissance durable et qui crée du lien entre ceux qui apprennent.
                            </p>
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                Cognisphère est un système de révision et d'apprentissage conçu par l'association
                                Mouvement ECHO.
                            </p>
                            <p className="text-neutral-400 leading-relaxed">
                                Directement lié à la série documentaire ECHO, Cognisphère proposera des parcours
                                d'apprentissage rattachés aux thématiques de chaque épisode avec un accès à des
                                ressources variées et adaptés au profil utilisateur pour ancrer ces savoirs sur le long terme.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CANDIDATURE FORM */}
            <section id="candidature" className="py-24 bg-violet-500/5 border-t border-violet-500/10">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif text-white mb-4">Rejoindre l'équipe technique</h2>
                        <p className="text-neutral-400 text-lg">
                            Cognisphère est en cours de développement. Développeurs, designers, architectes système —
                            contribuez à un projet open-source à fort impact social.
                        </p>
                    </div>
                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
                        <TechApplicationForm project="cognisphere" accentColor="violet-500" accentHex="#8B5CF6" />
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ── Sub-Components ── */

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

function PillarCard({ icon, title, subtitle, desc, detail }: { icon: React.ReactNode; title: string; subtitle: string; desc: string; detail: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/20 transition-all">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 text-violet-400">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-violet-400 text-sm mb-4">{subtitle}</p>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">{desc}</p>
            <p className="text-neutral-500 text-xs leading-relaxed italic">{detail}</p>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <Card variant="glass" className="p-6 hover:border-violet-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 text-violet-400">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
        </Card>
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

function ScreenDescription({ index }: { index: number }) {
    const descriptions = [
        { title: 'Tableau de bord', text: 'Suivez vos cartes révisées, votre taux de rétention, vos compétences et les révisions à venir. Le Principe du Jour enrichit votre pensée systémique.' },
        { title: 'Révision SRS', text: 'Flashcards avec répétition espacée (Again/Hard/Good/Easy) et quiz à choix multiples côte à côte. L\'algorithme FSRS-5 optimise chaque session.' },
        { title: 'Graphe de Connaissances', text: 'Visualisez tous vos concepts sous forme de réseau interactif. Code couleur par maîtrise, profil radar de compétences par domaine.' },
        { title: 'Smart Planning', text: 'Connecté à Google Calendar et Pronote, le planning intelligent détecte vos créneaux libres et propose les révisions au moment optimal.' },
        { title: 'Tuteur Socratique', text: 'Un bot IA qui utilise analogies et questions pour guider votre compréhension. Concepts liés et mind maps contextuels en temps réel.' },
    ];
    const d = descriptions[index];
    return (
        <>
            <h3 className="text-xl font-bold text-white mb-2">{d.title}</h3>
            <p className="text-neutral-400 text-sm max-w-2xl mx-auto">{d.text}</p>
        </>
    );
}

function RoadmapItem({ phase, title, timeline, items, side, active }: {
    phase: string; title: string; timeline: string; items: string[]; side: 'left' | 'right'; active?: boolean;
}) {
    return (
        <div className={`relative flex items-start mb-12 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
            {/* Dot */}
            <div className={`absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${
                active ? 'bg-violet-500 border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-neutral-700 border-neutral-600'
            }`} />

            {/* Content */}
            <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${side === 'right' ? 'md:mr-auto md:pl-0 md:pr-8' : 'md:ml-auto md:pr-0 md:pl-8'}`}>
                <div className={`p-6 rounded-xl border ${active ? 'bg-violet-500/5 border-violet-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-violet-400' : 'text-neutral-500'}`}>{phase}</span>
                    <h3 className="text-lg font-bold text-white mt-1 mb-1">{title}</h3>
                    <p className="text-neutral-500 text-xs mb-3">{timeline}</p>
                    <ul className="space-y-1">
                        {items.map((item, i) => (
                            <li key={i} className="text-neutral-400 text-sm flex items-start gap-2">
                                <ChevronRight size={12} className={`mt-1 flex-shrink-0 ${active ? 'text-violet-400' : 'text-neutral-600'}`} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
