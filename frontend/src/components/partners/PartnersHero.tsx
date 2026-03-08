import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Map } from 'lucide-react';

interface PartnersHeroProps {
    onApplyClick: () => void;
}

export const PartnersHero: React.FC<PartnersHeroProps> = ({ onApplyClick }) => {
    return (
        <section className="relative pt-32 pb-16 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-echo-darker z-0" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-echo-gold/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-echo-greenLight/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-echo-gold text-sm font-medium tracking-wide mb-6">
                        <Map className="w-4 h-4" />
                        <span>L'ÉCHOSYSTEM</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white leading-[1.1] mb-6">
                        Notre réseau de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-echo-gold via-white to-echo-goldLight">
                            partenaires engagés
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                        Le Mouvement ECHO fédère un écosystème d'acteurs d'horizons divers.
                        Découvrez ceux qui s'engagent à nos côtés pour repenser l'apprentissage
                        et la diffusion des savoirs.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button size="lg" className="w-full sm:w-auto gap-2" onClick={onApplyClick}>
                            <span>Devenir partenaire</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Link to="/soutenir" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Soutenir le projet
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
