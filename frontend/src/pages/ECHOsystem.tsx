import React from 'react';
import { Sprout, Briefcase, GraduationCap, HandHeart } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ECHOsystem() {
    return (
        <div className="flex flex-col min-h-screen bg-echo-dark text-white font-sans">
            {/* Nature Hero */}
            <section className="relative py-32 flex items-center justify-center bg-gradient-to-b from-[#0a2f1c] to-echo-dark overflow-hidden">
                {/* Abstract organic shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-echo-green/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-echo-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <span className="text-echo-greenLight uppercase tracking-widest font-bold mb-4 block">L'Écosystème</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-8">
                        Cultiver des Alliances <br /> <span className="text-echo-gold italic">Durables</span>
                    </h1>
                    <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
                        Experts, entreprises et associations : ensemble, nous formons un maillage résilient pour amplifier l'impact du projet.
                    </p>
                </div>
            </section>

            {/* Partners Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <PartnerCategory
                            icon={<Sprout size={24} />}
                            title="Experts & Scientifiques"
                            desc="Garantissant la rigueur de nos contenus."
                            partners={["Cyril Dion (Accord principe)", "Timothée Parrique", "Camille Étienne"]}
                            color="text-echo-greenLight"
                        />
                        <PartnerCategory
                            icon={<Briefcase size={24} />}
                            title="Partenaires Financiers"
                            desc="Soutenant la production et le développement."
                            partners={["Fondation X", "Entreprise Y", "Mécènes Privés"]}
                            color="text-echo-gold"
                        />
                        <PartnerCategory
                            icon={<GraduationCap size={24} />}
                            title="Éducation & Culture"
                            desc="Diffusant les messages dans les écoles."
                            partners={["Universités", "Cinémas Art & Essai", "Écoles de Commerce"]}
                            color="text-echo-blueLight"
                        />
                        <PartnerCategory
                            icon={<HandHeart size={24} />}
                            title="ONG & Associations"
                            desc="Agissant sur le terrain."
                            partners={["On The Green Road", "MakeSense", "Colibris"]}
                            color="text-echo-redLight"
                        />
                    </div>
                </div>
            </section>

            {/* Join CTA */}
            <section className="py-24 bg-white/5 border-t border-white/5">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif text-white mb-8">Rejoindre l'ECHOSystem</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button variant="primary" size="lg" className="bg-echo-greenLight hover:bg-echo-green text-black border-none">
                            Devenir Partenaire
                        </Button>
                        <Button variant="outline" size="lg">
                            Télécharger le Dossier
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function PartnerCategory({ icon, title, desc, partners, color }: any) {
    return (
        <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
            <div className={`flex items-center gap-3 mb-6 ${color}`}>
                {icon}
                <h3 className="font-serif font-bold text-lg text-white">{title}</h3>
            </div>
            <p className="text-sm text-neutral-400 mb-6 min-h-[40px]">{desc}</p>
            <ul className="space-y-3">
                {partners.map((p: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${color}`} />
                        {p}
                    </li>
                ))}
            </ul>
        </div>
    );
}
