import React from 'react';
import { Leaf, Sprout, Users, ArrowRight, Play, ExternalLink } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function Mouvement() {
    return (
        <Layout>
            <div className="bg-stone-950 text-stone-200 font-sans selection:bg-amber-500/30">

                {/* --- Hero Section --- */}
                <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/60 to-stone-950 z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2674&auto=format&fit=crop"
                            alt="Mystical Forest"
                            className="w-full h-full object-cover opacity-60"
                        />
                    </div>

                    <div className="relative z-20 text-center max-w-4xl px-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-8 border border-amber-500/20 animate-fade-in-up">
                            <Sprout className="w-8 h-8 text-amber-500" />
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight animate-fade-in-up delay-100">
                            Mouvement ECHO
                        </h1>

                        <h2 className="text-2xl md:text-3xl text-amber-500 font-light mb-8 italic animate-fade-in-up delay-200">
                            "Comme un Arbre qui Grandit"
                        </h2>

                        <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                            Suivez les branches pour découvrir l'histoire d'un mouvement qui s'enracine,
                            s'élève et déploie ses feuilles pour ombrager le monde de demain.
                        </p>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                        <div className="w-px h-20 bg-gradient-to-b from-transparent via-amber-500 to-transparent" />
                    </div>
                </section>


                {/* --- The Tree Metaphor (Timeline) --- */}
                <section className="relative py-20 overflow-hidden">
                    {/* Vertical Connecting Line (The Trunk) */}
                    <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent md:-translate-x-1/2" />

                    <div className="container mx-auto px-4 relative z-10 space-y-32">

                        {/* 1. Les Racines */}
                        <TimelineItem side="left" icon={Sprout} title="Les Racines" subtitle="Fondation 2023">
                            <p className="mb-4">
                                Tout part d'une graine. D'une volonté de comprendre pourquoi notre monde vacille
                                et comment nous pouvons le stabiliser.
                            </p>
                            <p>
                                L'association ECHO est née de la rencontre entre des artistes, des ingénieurs et
                                des citoyens désireux d'utiliser la fiction comme levier de transformation réelle.
                            </p>
                        </TimelineItem>

                        {/* 2. Le Tronc */}
                        <TimelineItem side="right" icon={Leaf} title="Le Tronc" subtitle="Notre Conviction">
                            <p className="mb-6">
                                Nous croyons que les récits façonnent la réalité. Que pour construire un nouveau monde,
                                il faut d'abord être capable de l'imaginer.
                            </p>
                            <blockquote className="border-l-4 border-amber-500 pl-6 italic text-stone-400 bg-stone-900/50 p-6 rounded-r-lg">
                                "L'audiovisuel n'est pas une fin en soi, c'est un outil d'éveil massif.
                                Une arme de construction massive."
                            </blockquote>
                        </TimelineItem>

                        {/* 3. Première Branche */}
                        <TimelineItem side="left" icon={Leaf} title="Première Branche" subtitle="Raison d'Être">
                            <h4 className="text-xl font-bold text-white mb-2">Raviver la flamme</h4>
                            <p>
                                Dans un monde saturé de dystopies, nous voulons redonner l'envie d'agir.
                                Transformer l'éco-anxiété en énergie créatrice. Montrer que l'effondrement
                                n'est pas une fatalité, mais un appel à la métamorphose.
                            </p>
                        </TimelineItem>

                        {/* 4. Deuxième Branche */}
                        <TimelineItem side="right" icon={Leaf} title="Deuxième Branche" subtitle="Notre Ambition">
                            <h4 className="text-xl font-bold text-white mb-2">Un nouveau paradigme</h4>
                            <p>
                                Nous ne cherchons pas à réparer le vieux monde, mais à en faire pousser un nouveau.
                                Basé sur la coopération plutôt que la compétition. Sur le vivant plutôt que le profit.
                            </p>
                        </TimelineItem>

                        {/* 5. Troisième Branche */}
                        <TimelineItem side="left" icon={Leaf} title="Troisième Branche" subtitle="Notre Mission">
                            <p className="mb-6">
                                Ouvrir les horizons culturels avec bienveillance. Connecter ceux qui font déjà
                                avec ceux qui veulent faire.
                            </p>
                            <blockquote className="border-l-4 border-amber-500 pl-6 italic text-stone-400 bg-stone-900/50 p-6 rounded-r-lg">
                                "Il ne s'agit pas d'entretenir la terreur, mais de susciter l'espoir
                                et la volonté d'agir." <br />
                                <span className="text-amber-500 text-sm mt-2 block">— Inspiré de Pierre Rabhi</span>
                            </blockquote>
                        </TimelineItem>

                    </div>
                </section>


                {/* --- Les Trois Phases (Cards) --- */}
                <section className="py-24 bg-stone-900/50 border-y border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-4">Les Trois Phases</h2>
                            <p className="text-stone-400">Notre feuille de route, inspirée par la structure de La Divine Comédie.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <PhaseCard
                                number="01"
                                title="L'Éveil"
                                season="Saison 1 – L'Enfer"
                                desc="Le constat lucide. Comprendre les mécanismes de l'effondrement et nos propres blocages."
                                actions={["Websérie Saison 1", "Conférences Choc", "Ateliers Fresques"]}
                            />
                            <PhaseCard
                                number="02"
                                title="Le Changement"
                                season="Saison 2 – Le Purgatoire"
                                desc="La transition. Explorer les alternatives, expérimenter, se tromper, et avancer."
                                actions={["Websérie Saison 2", "Platforme ECHOLink", "Réseau de Partenaires"]}
                                isActive
                            />
                            <PhaseCard
                                number="03"
                                title="La Régénération"
                                season="Saison 3 – Le Paradis"
                                desc="L'utopie concrète. Célébrer ce que nous avons sauvé et ce que nous avons construit."
                                actions={["Websérie Saison 3", "Festivals ECHO", "Ecolieux Autonomes"]}
                            />
                        </div>
                    </div>
                </section>


                {/* --- Équipe --- */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Équipe ECHO</h2>
                        <p className="text-amber-500 text-lg mb-16">Une dizaine de membres actifs portés par la même sève.</p>

                        {/* Main Team */}
                        <div className="flex flex-wrap justify-center gap-12 mb-16">
                            {[
                                { name: "Jérémy Lasne", role: "Fondateur & Réalisateur" },
                                { name: "Eddyson Koffi", role: "Directeur Artistique" },
                                { name: "Sarah Connor", role: "Responsable Impact" }, // Placeholder names based on typical structure
                                { name: "Marc Aurel", role: "Développeur" }
                            ].map((member, i) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-stone-800 group-hover:border-amber-500 transition-colors mb-4">
                                        <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-600">
                                            <Users className="w-12 h-12" />
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-lg">{member.name}</h3>
                                    <p className="text-stone-500 text-sm">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* --- CTA --- */}
                <section className="py-24 px-4 container mx-auto">
                    <div className="relative rounded-3xl overflow-hidden bg-stone-900 border border-amber-500/20 p-8 md:p-20 text-center">
                        {/* Background Texture */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                                Ne Soyez Pas Spectateur. <br />
                                <span className="text-amber-500">Écrivez l'Histoire avec Nous.</span>
                            </h2>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <Button variant="primary" size="lg" className="rounded-full px-8 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-900/20">
                                    Rejoindre le Mouvement
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-full px-8 py-3 h-auto text-base border-stone-600 text-stone-300 hover:text-white hover:border-white hover:bg-white/5">
                                    <Play className="w-4 h-4 mr-2" /> Découvrir la Série
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </Layout>
    );
}


// --- Subcomponents ---

function TimelineItem({ side, icon: Icon, title, subtitle, children }: any) {
    const isLeft = side === 'left';

    return (
        <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isLeft ? '' : 'md:flex-row-reverse'}`}>

            {/* Content */}
            <div className={`flex-1 text-center ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    {subtitle}
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">{title}</h3>
                <div className="text-stone-400 space-y-4 leading-relaxed">
                    {children}
                </div>
            </div>

            {/* Icon/Node on the Line */}
            <div className="relative shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-stone-900 border-2 border-amber-500/50 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
            </div>

            {/* Empty space for the other side */}
            <div className="flex-1 hidden md:block" />
        </div>
    );
}

function PhaseCard({ number, title, season, desc, actions, isActive }: any) {
    return (
        <Card className={`relative h-full bg-stone-950 border-stone-800 p-8 hover:border-amber-500/50 transition-all duration-300 group ${isActive ? 'border-amber-500/30' : ''}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl font-bold text-white">{number}</span>
            </div>

            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">{title}</h3>
                <span className="text-sm font-mono text-amber-600">{season}</span>
            </div>

            <p className="text-stone-400 mb-8 min-h-[80px]">
                {desc}
            </p>

            <ul className="space-y-3">
                {actions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start text-stone-300 text-sm">
                        <span className="mr-2 text-amber-500 mt-1">●</span>
                        {action}
                    </li>
                ))}
            </ul>
        </Card>
    );
}
