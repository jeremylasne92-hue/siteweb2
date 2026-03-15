import { Network, Brain, Share2, Coins, Lock, Puzzle, Users, Handshake, QrCode, Trophy, MapPin, Heart, ShieldCheck, Eye } from 'lucide-react';

import { Button } from '../components/ui/Button';

import { TechApplicationForm } from '../components/forms/TechApplicationForm';
import { useAnalytics } from '../hooks/useAnalytics';

export function ECHOLink() {
    const { trackEvent } = useAnalytics();

    return (
        <div className="flex flex-col min-h-screen bg-echo-darker text-white">
            {/* Hero */}
            <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-echo-darker">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                <div className="relative z-20 text-center max-w-4xl px-4 animate-slide-up">
                    <div className="inline-block p-4 rounded-full bg-echo-blue/10 mb-6 border border-echo-blue/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Network className="w-12 h-12 text-echo-blueLight" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 sm:mb-6 tracking-tighter">
                        ECHO<span className="text-echo-blueLight">Link</span>
                    </h1>
                    <p className="text-base sm:text-xl md:text-2xl text-echo-textMuted mb-4 font-light">
                        La <span className="text-echo-blueLight font-medium">plateforme collaborative</span> qui transforme
                        l'expérience spectateur en action concrète.
                    </p>
                    <div className="mb-10" />

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#fonctionnalites">
                            <Button variant="primary" size="lg" className="bg-echo-blueLight hover:bg-echo-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border-none">
                                <Share2 className="mr-2" size={20} /> Découvrir la plateforme
                            </Button>
                        </a>
                        <a href="#candidature" onClick={() => trackEvent('cta_click', 'echosystem_candidature')}>
                            <Button variant="secondary" size="lg">
                                <Lock className="mr-2" size={18} /> Rejoindre l'équipe
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Le constat */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <span className="text-echo-blueLight uppercase tracking-widest text-sm font-bold mb-4 block">Le constat</span>
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">Regarder ne suffit plus</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div>
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                On regarde une série, on est touché, on veut agir... mais comment ?
                                Les plateformes actuelles isolent le spectateur. Le contenu reste passif,
                                l'engagement retombe.
                            </p>
                            <p className="text-neutral-400 leading-relaxed">
                                ECHOLink est né de cette frustration : créer un pont entre la prise de
                                conscience et le passage à l'action, en connectant les personnes qui
                                partagent les mêmes convictions autour de projets concrets et locaux.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard number="3" label="Fonctionnalités clés" />
                            <StatCard number="∞" label="Projets possibles" />
                            <StatCard number="100%" label="Collaboratif" />
                            <StatCard number="0" label="Intermédiaire" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 Fonctionnalités */}
            <section id="fonctionnalites" className="py-24 bg-white/[0.02]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <span className="text-echo-blueLight uppercase tracking-widest text-sm font-bold mb-4 block">La vision</span>
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Trois piliers, un écosystème</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">
                            ECHOLink repose sur trois fonctionnalités complémentaires qui transforment
                            chaque spectateur en acteur du changement.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
                        <FeatureCard
                            icon={<Puzzle size={32} />}
                            title="Énigmes et apprentissage"
                            desc="Des défis liés aux épisodes de la série ECHO pour approfondir les thématiques et débloquer du contenu exclusif."
                            color="text-echo-gold"
                            borderColor="border-echo-gold/30"
                        />
                        <FeatureCard
                            icon={<Users size={32} />}
                            title="Hubs de projets"
                            desc="Lancez ou rejoignez des projets collaboratifs locaux avec un système de matching et des outils de gestion intégrés."
                            color="text-echo-blueLight"
                            borderColor="border-echo-blueLight/30"
                        />
                        <FeatureCard
                            icon={<Coins size={32} />}
                            title="Économie alternative"
                            desc="Un système d'échange basé sur une monnaie numérique interne, le troc conscient et la valorisation des contributions."
                            color="text-echo-greenLight"
                            borderColor="border-echo-greenLight/30"
                        />
                    </div>
                </div>
            </section>

            {/* Détail: Énigmes */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-echo-gold/10 flex items-center justify-center">
                                    <Puzzle className="text-echo-gold" size={24} />
                                </div>
                                <span className="text-echo-gold uppercase tracking-widest text-sm font-bold">Fonctionnalité 1</span>
                            </div>
                            <h3 className="text-3xl font-serif text-white mb-6">Énigmes et apprentissage</h3>
                            <p className="text-neutral-400 leading-relaxed mb-6">
                                Chaque épisode de la série ECHO génère des énigmes et des défis que les
                                utilisateurs peuvent résoudre pour approfondir les thématiques abordées.
                                Les réponses ne sont pas données : il faut chercher, comprendre, relier.
                            </p>
                            <ul className="space-y-3">
                                <DetailItem icon={<Brain size={18} />} text="Énigmes narratives liées aux épisodes" />
                                <DetailItem icon={<QrCode size={18} />} text="QR codes IRL lors d'événements et projections" />
                                <DetailItem icon={<Trophy size={18} />} text="Système de points et progression" />
                            </ul>
                        </div>
                        <div className="bg-white/5 border border-echo-gold/20 rounded-2xl p-8 backdrop-blur-sm">
                            <h4 className="text-lg font-bold text-white mb-4">Exemple concret</h4>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Après l'épisode sur les mythologies, un indice glissé dans la narration
                                vous donne accès à une énigme virtuelle : une quête historique et
                                mythologique urbaine. Pour la résoudre, il faudra arpenter votre ville
                                et terminer les dernières énigmes dans le réel, en allant chercher
                                l'indice final auprès des partenaires de notre ECHOSystem.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Détail: Hubs */}
            <section className="py-24 bg-white/[0.02]">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div className="order-2 md:order-1 rounded-2xl overflow-hidden border border-echo-blueLight/20">
                            <img
                                src="/images/echolink/hub-carte.png"
                                alt="Mockup ECHOLink — Carte interactive des Hubs de projets"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-echo-blueLight/10 flex items-center justify-center">
                                    <Users className="text-echo-blueLight" size={24} />
                                </div>
                                <span className="text-echo-blueLight uppercase tracking-widest text-sm font-bold">Fonctionnalité 2</span>
                            </div>
                            <h3 className="text-3xl font-serif text-white mb-6">Hubs de projets collaboratifs</h3>
                            <p className="text-neutral-400 leading-relaxed mb-6">
                                Les Hubs sont des espaces où les utilisateurs peuvent proposer, rejoindre
                                et co-construire des projets concrets liés aux thématiques de la série.
                                Chaque hub est géolocalisé et dispose d'outils de gestion de projet.
                            </p>
                            <ul className="space-y-3">
                                <DetailItem icon={<MapPin size={18} />} text="Projets géolocalisés, impact local" />
                                <DetailItem icon={<Handshake size={18} />} text="Matching automatique par compétences et intérêts" />
                                <DetailItem icon={<Network size={18} />} text="Kanban intégré et suivi collaboratif" />
                            </ul>
                        </div>
                    </div>

                    {/* Mockups supplémentaires */}
                    <div className="grid md:grid-cols-2 gap-8 mt-16">
                        <div className="rounded-2xl overflow-hidden border border-echo-blueLight/20">
                            <img
                                src="/images/echolink/hub-accueil.png"
                                alt="Mockup ECHOLink — Projets à la une"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-echo-blueLight/20">
                            <img
                                src="/images/echolink/hub-projet.png"
                                alt="Mockup ECHOLink — Fiche projet détaillée"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Détail: Économie */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-echo-greenLight/10 flex items-center justify-center">
                                    <Coins className="text-echo-greenLight" size={24} />
                                </div>
                                <span className="text-echo-greenLight uppercase tracking-widest text-sm font-bold">Fonctionnalité 3</span>
                            </div>
                            <h3 className="text-3xl font-serif text-white mb-6">Économie alternative</h3>
                            <p className="text-neutral-400 leading-relaxed mb-6">
                                ECHOLink intègre un système économique interne qui valorise les contributions
                                de chacun. Une monnaie numérique permet d'échanger des services, de soutenir
                                des projets et de rémunérer l'engagement sans passer par le système financier
                                traditionnel.
                            </p>
                            <ul className="space-y-3">
                                <DetailItem icon={<Coins size={18} />} text="Monnaie numérique interne liée aux contributions" />
                                <DetailItem icon={<Share2 size={18} />} text="Troc conscient entre membres" />
                                <DetailItem icon={<Heart size={18} />} text="Prix conscient et accessibilité pour tous" />
                            </ul>
                        </div>
                        <div className="bg-white/5 border border-echo-greenLight/20 rounded-2xl p-8 backdrop-blur-sm">
                            <h4 className="text-lg font-bold text-white mb-4">Exemple concret</h4>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Vous avez participé à la résolution de 10 énigmes et contribué à
                                l'organisation d'un événement local. Vos ECHOCoins vous permettent
                                d'accéder à du contenu exclusif, de soutenir un projet communautaire
                                ou d'échanger un service avec un autre membre du réseau.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valeurs */}
            <section className="py-24 bg-white/[0.02]">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <span className="text-echo-blueLight uppercase tracking-widest text-sm font-bold mb-4 block">Nos valeurs</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Construit sur des principes forts</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ValueCard icon={<Handshake size={24} />} title="Entraide" desc="Chaque action bénéficie à la communauté." />
                        <ValueCard icon={<Heart size={24} />} title="Respect" desc="Des échanges bienveillants et inclusifs." />
                        <ValueCard icon={<Eye size={24} />} title="Transparence" desc="Gouvernance ouverte et traçable." />
                        <ValueCard icon={<ShieldCheck size={24} />} title="Vie privée" desc="Anonymat optionnel et données protégées." />
                    </div>
                </div>
            </section>

            {/* Origine ECHO */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <span className="text-echo-blueLight uppercase tracking-widest text-sm font-bold mb-4 block">Né du Mouvement ECHO</span>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                        ECHOLink est une plateforme collaborative conçue par l'association Mouvement ECHO.
                        Elle prolonge l'univers de la série ECHO en offrant aux spectateurs les outils
                        pour passer de la prise de conscience à l'action collective.
                    </p>
                    <p className="text-neutral-400 leading-relaxed">
                        Connectée à l'ECHOSystem (le réseau de partenaires engagés), la plateforme
                        relie citoyens, associations et acteurs locaux autour de projets concrets
                        pour le bien commun.
                    </p>
                </div>
            </section>

            {/* Call for Developers */}
            <section id="candidature" className="py-24 bg-echo-blue/5 border-y border-echo-blue/10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">Participez à la construction</h2>
                        <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
                            ECHOLink est un projet ambitieux qui nécessite des talents techniques.
                            Développeurs, designers, architectes système... nous avons besoin de vous.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
                        <h3 className="text-2xl font-serif text-white mb-6 text-center">Candidature technique</h3>
                        <TechApplicationForm project="echolink" accentColor="echo-blueLight" accentHex="#60A5FA" />
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ── Sub-components ── */

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: string;
    borderColor: string;
}

function FeatureCard({ icon, title, desc, color, borderColor }: FeatureCardProps) {
    return (
        <div className={`p-8 rounded-2xl bg-white/5 border ${borderColor} backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300`}>
            <div className={`w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 ${color}`}>
                {icon}
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">{title}</h3>
            <p className="text-neutral-400 leading-relaxed">{desc}</p>
        </div>
    );
}

interface DetailItemProps {
    icon: React.ReactNode;
    text: string;
}

function DetailItem({ icon, text }: DetailItemProps) {
    return (
        <li className="flex items-center gap-3 text-neutral-300">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-echo-blueLight">
                {icon}
            </div>
            <span className="text-sm">{text}</span>
        </li>
    );
}

interface StatCardProps {
    number: string;
    label: string;
}

function StatCard({ number, label }: StatCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-echo-blueLight mb-1">{number}</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">{label}</div>
        </div>
    );
}

interface ValueCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

function ValueCard({ icon, title, desc }: ValueCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-echo-blueLight/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-echo-blueLight/10 flex items-center justify-center mx-auto mb-4 text-echo-blueLight">
                {icon}
            </div>
            <h4 className="text-white font-bold mb-2">{title}</h4>
            <p className="text-neutral-500 text-sm">{desc}</p>
        </div>
    );
}
