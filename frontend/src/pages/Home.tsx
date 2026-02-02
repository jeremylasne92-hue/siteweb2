import React from 'react';
import { Play, Users, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';

export function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Placeholder - Replace with Video later */}
                <div className="absolute inset-0 bg-gradient-to-b from-echo-dark via-echo-dark/50 to-echo-dark z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center opacity-30 animate-pulse" />

                <div className="relative z-20 text-center max-w-4xl px-4 animate-fade-in">
                    <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tighter text-shadow">
                        ECHO
                    </h1>
                    <p className="text-xl md:text-2xl text-echo-textMuted mb-8 italic font-serif">
                        "Au milieu de mon chemin de vie, je me suis retrouvé dans une forêt en feu,<br />
                        car la voie droite était perdue."
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/serie">
                            <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                <Play className="mr-2" size={20} /> Découvrir la Série
                            </Button>
                        </Link>
                        <Link to="/mouvement">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                <Users className="mr-2" size={20} /> Rejoindre le Mouvement
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white rounded-full" />
                    </div>
                </div>
            </section>

            {/* Les 3 Piliers */}
            <section className="py-24 bg-echo-dark relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-[48px] font-serif font-bold text-[#D4AF37] mb-4 text-center text-shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                            L'Expérience ECHO
                        </h2>
                        <p className="text-[#D1D5DB] text-[18px] font-normal leading-[1.6] max-w-[800px] mx-auto text-center mb-16">
                            Une vision capable d'impulser une évolution des mentalités et des comportements pour faire société autrement. Une vision qui s'appuie sur trois piliers :
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-stretch">
                        {/* Pilier 1 */}
                        <div className="group relative flex flex-col justify-between min-h-[420px] p-10 rounded-[16px] bg-[rgba(18,18,18,0.6)] backdrop-blur-[16px] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-300">
                            <div>
                                <div className="w-[56px] h-[56px] rounded-full mx-auto mb-5 text-[#DC143C] flex items-center justify-center shadow-[0_0_24px_rgba(220,20,60,0.4)]">
                                    <Play size={32} />
                                </div>
                                <div className="text-[14px] font-bold tracking-[2px] text-[#DC143C] uppercase mb-2">INFORMER</div>
                                <h3 className="text-[32px] font-serif font-semibold text-white my-4">La Série</h3>
                                <p className="text-[#D1D5DB] text-[16px] font-normal leading-[1.6] mb-6 font-sans">
                                    Une websérie unique pour décrypter les défis sociaux, sociétaux, et existentiels de notre époque.
                                </p>
                            </div>
                            <Link to="/serie" className="mx-auto block">
                                <button
                                    className="px-7 py-3 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-[#0A0A0A] text-[14px] font-semibold tracking-[1px] uppercase rounded-[8px] border-none cursor-pointer transform hover:scale-105 hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] transition-all duration-200"
                                    aria-label="Découvrir la série ECHO"
                                >
                                    VOIR LES ÉPISODES
                                </button>
                            </Link>
                        </div>

                        {/* Pilier 2 */}
                        <div className="group relative flex flex-col justify-between min-h-[420px] p-10 rounded-[16px] bg-[rgba(18,18,18,0.6)] backdrop-blur-[16px] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-300">
                            <div>
                                <div className="w-[56px] h-[56px] rounded-full mx-auto mb-5 text-[#10B981] flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.4)]">
                                    <Users size={32} />
                                </div>
                                <div className="text-[14px] font-bold tracking-[2px] text-[#10B981] uppercase mb-2">FÉDÉRER</div>
                                <h3 className="text-[32px] font-serif font-semibold text-white my-4">ECHOSystem</h3>
                                <p className="text-[#D1D5DB] text-[16px] font-normal leading-[1.6] mb-6 font-sans">
                                    Un écosystème de partenaires engagés qui tentent de changer positivement ce monde. Rejoignez-les selon votre élan pour construire ensemble une société plus juste et durable.
                                </p>
                            </div>
                            <Link to="/partenaires" className="mx-auto block">
                                <button
                                    className="px-7 py-3 bg-transparent text-[#D4AF37] border-2 border-[#D4AF37] text-[14px] font-semibold tracking-[1px] uppercase rounded-[8px] cursor-pointer transform hover:scale-105 hover:bg-[rgba(212,175,55,0.1)] hover:border-[#FFD700] transition-all duration-200"
                                    aria-label="Rejoindre le mouvement ECHO"
                                >
                                    NOUS REJOINDRE
                                </button>
                            </Link>
                        </div>

                        {/* Pilier 3 */}
                        <div className="group relative flex flex-col justify-between min-h-[420px] p-10 rounded-[16px] bg-[rgba(18,18,18,0.6)] backdrop-blur-[16px] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-300">
                            <div>
                                <div className="w-[56px] h-[56px] rounded-full mx-auto mb-5 text-[#3B82F6] flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.4)]">
                                    <LinkIcon size={32} />
                                </div>
                                <div className="text-[14px] font-bold tracking-[2px] text-[#3B82F6] uppercase mb-2">AGIR</div>
                                <h3 className="text-[32px] font-serif font-semibold text-white my-4">Plateformes</h3>
                                <p className="text-[#D1D5DB] text-[16px] font-normal leading-[1.6] mb-6 font-sans">
                                    <strong>Cognisphère</strong> pour maîtriser vos connaissances, <strong>ECHOLink</strong> pour agir concrètement. Deux outils numériques au service de votre transformation et du bien commun.
                                </p>
                            </div>
                            <Link to="/echolink" className="mx-auto block">
                                <button
                                    className="px-7 py-3 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-[#0A0A0A] text-[14px] font-semibold tracking-[1px] uppercase rounded-[8px] border-none cursor-pointer transform hover:scale-105 hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] transition-all duration-200"
                                    aria-label="Explorer les plateformes ECHOLink et Cognisphère"
                                >
                                    EXPLORER
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Teaser */}
            <section className="py-20 border-t border-white/5 bg-echo-darker">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center">
                        <div className="md:border-r md:border-white/10 md:pr-16 last:border-0 last:pr-0">
                            <div className="text-4xl md:text-5xl font-serif text-echo-gold mb-2">3</div>
                            <div className="text-echo-textMuted uppercase tracking-widest text-sm">Saisons</div>
                        </div>
                        <div className="md:border-r md:border-white/10 md:pr-16 last:border-0 last:pr-0">
                            <div className="text-4xl md:text-5xl font-serif text-echo-gold mb-2">33</div>
                            <div className="text-echo-textMuted uppercase tracking-widest text-sm">Épisodes</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-serif text-echo-gold mb-2">∞</div>
                            <div className="text-echo-textMuted uppercase tracking-widest text-sm">Possibilités</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
