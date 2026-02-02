import React from 'react';
import { Network, Brain, Share2, Coins, ArrowRight, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function ECHOLink() {
    return (
        <div className="flex flex-col min-h-screen bg-echo-darker text-white">
            {/* Network Hero */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Connection visualization background */}
                <div className="absolute inset-0 bg-echo-darker">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                <div className="relative z-20 text-center max-w-4xl px-4 animate-slide-up">
                    <div className="inline-block p-4 rounded-full bg-echo-blue/10 mb-6 border border-echo-blue/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Network className="w-12 h-12 text-echo-blueLight" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tighter text-glow">
                        ECHOLink
                    </h1>
                    <p className="text-xl md:text-2xl text-echo-textMuted mb-8 font-light">
                        "Transformez l'expérience spectateur en <span className="text-echo-blueLight font-medium">action concrète</span>."
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button variant="primary" size="lg" className="bg-echo-blueLight hover:bg-echo-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border-none">
                            <Share2 className="mr-2" size={20} /> Rejoindre le Développement
                        </Button>
                        <Button variant="secondary" size="lg">
                            <Lock className="mr-2" size={18} /> Connexion Membre
                        </Button>
                    </div>
                </div>
            </section>

            {/* Feature Grid - The Vision */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-serif text-white mb-4">La Vision ECHOLink</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">
                            Une plateforme interactive en cours de développement pour connecter les consciences et les projets.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain size={32} />}
                            title="Apprentissage Ludique"
                            desc="Résolvez des énigmes liées aux épisodes pour approfondir vos connaissances et débloquer du contenu."
                            color="text-echo-gold"
                            borderColor="border-echo-gold/30"
                        />
                        <FeatureCard
                            icon={<Network size={32} />}
                            title="Hubs Collaboratifs"
                            desc="Rejoignez des projets locaux ou lancez les vôtres avec le soutien de la communauté ECHO."
                            color="text-echo-blueLight"
                            borderColor="border-echo-blueLight/30"
                        />
                        <FeatureCard
                            icon={<Coins size={32} />}
                            title="Économie Alternative"
                            desc="Un système d'échange et de valorisation des contributions pour une économie plus juste."
                            color="text-echo-greenLight"
                            borderColor="border-echo-greenLight/30"
                        />
                    </div>
                </div>
            </section>

            {/* Call for Developers */}
            <section className="py-24 bg-echo-blue/5 border-y border-echo-blue/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">Participez à la construction</h2>
                    <p className="text-lg text-neutral-300 max-w-3xl mx-auto mb-12">
                        ECHOLink est un projet ambitieux qui nécessite des talents techniques.
                        Développeurs, designers, architectes système... nous avons besoin de vous.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <Card className="text-left hover:border-echo-blueLight/50 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-2">Stack Technique</h3>
                            <ul className="space-y-2 text-neutral-400 text-sm">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-echo-blueLight rounded-full" /> React / TypeScript / Node.js</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-echo-blueLight rounded-full" /> Graph Database (Neo4j)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-echo-blueLight rounded-full" /> Web3 / Blockchain elements</li>
                            </ul>
                        </Card>
                        <Card className="text-left hover:border-echo-blueLight/50 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-2">Rejoindre l'équipe Tech</h3>
                            <p className="text-sm text-neutral-400 mb-4">
                                Contribuez à un projet open-source à fort impact social.
                            </p>
                            <Button variant="outline" size="sm" className="w-full border-echo-blueLight text-echo-blueLight hover:bg-echo-blueLight/10">
                                Accéder au GitHub <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color, borderColor }: any) {
    return (
        <div className={`p-8 rounded-2xl bg-white/5 border ${borderColor} backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300`}>
            <div className={`w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 ${color}`}>
                {icon}
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">{title}</h3>
            <p className="text-neutral-400 leading-relaxed">
                {desc}
            </p>
        </div>
    );
}
