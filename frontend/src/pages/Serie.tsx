import { useState, useEffect } from 'react';
import { Play, BookOpen, Facebook, Linkedin, Twitter, Flame, Mountain, Star, Instagram, Palette, Gamepad2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

type Episode = {
    title: string;
    themes: {
        existential: string;
        societal: string;
        social: string;
    };
};

const episodesS1: Episode[] = [
    {
        title: "Révélation",
        themes: {
            existential: "Quête de sens, Rêves, Dualité, Développement personnel, Cosmogonie et symbole africain.",
            societal: "Dérèglement climatique.",
            social: "Inégalités sociales, Incivilité, Minimalisme."
        }
    },
    {
        title: "Catabase (Les Limbes)",
        themes: {
            existential: "Philosophie (ontologie, éthique et morale, ubuntu), Énergie et mécanisme de domination, Neurosciences.",
            societal: "Immigration.",
            social: "Éducation, Communication non violente, Différences générationnelles."
        }
    },
    {
        title: "Anamesis (La Luxure)",
        themes: {
            existential: "Psychologie et psychanalyse, Synchronicités, Art divinatoire, Pouvoir de la pensée, Hypnose, Mentalisme.",
            societal: "Patriarcat, Protection animale, Médias et réseaux sociaux.",
            social: "Industrie de la mode et du luxe, Féminisme, Sexualité."
        }
    },
    {
        title: "Maga ou Sympathie (La Gourmandise)",
        themes: {
            existential: "Substances psychoactives, EMC, Astrologie, Biologie (microcosme / macrocosme).",
            societal: "Sécurité alimentaire, Industrie primaire et secondaire, Gestion des déchets, Greenwashing.",
            social: "Consommation, Énergie."
        }
    },
    {
        title: "Pléonexie (L'Avarice / Prodigue)",
        themes: {
            existential: "Numérologie, Physique quantique, Mathématiques.",
            societal: "Fascisme, extrémiste, Économie, Finance.",
            social: "Publicité."
        }
    },
    {
        title: "Ménis (Colère / Paresse)",
        themes: {
            existential: "Chamanisme, Exorcisme, Spiritisme, Médiumnité, Capacités psychiques.",
            societal: "Industrie pharmaceutique.",
            social: "Santé, Psychiatrie."
        }
    },
    {
        title: "Mythopéïa (L'Hérésie)",
        themes: {
            existential: "Mythologie, Ancienne civilisation, Guru et dérive sectaire.",
            societal: "Impact et risque de l'IA, Transhumanisme, Technologies, Wokisme.",
            social: "Amour."
        }
    },
    {
        title: "Metanoïa (La Violence)",
        themes: {
            existential: "Mort et réincarnation, Karma, Religions.",
            societal: "Guerre, Géopolitique, Cybersécurité.",
            social: "Violence conjugale, Maltraitance."
        }
    },
    {
        title: "Fatum (La Fraude)",
        themes: {
            existential: "Origines et influences des traditions initiatiques, Prophéties, Géométrie sacrée.",
            societal: "Droit et justice, Lobby, Logement et urbanisme.",
            social: "Industrie de l'art et du cinéma."
        }
    },
    {
        title: "Divine Providence (La Trahison 1/2)",
        themes: {
            existential: "Courants mystiques et philosophies spirituelles, Démonologie, Théorie complotiste.",
            societal: "Politique, Syndicats, Pouvoir, Activisme.",
            social: "Industrie musicale."
        }
    },
    {
        title: "Alétheia (La Trahison 2/2)",
        themes: {
            existential: "Cosmogonie, Gémellité, Sotériologie, Le son, Nature de la réalité.",
            societal: "Gouvernance et institutions, Citoyenneté et démocratie, Sécurité.",
            social: "Aucune"
        }
    }
];

export function Serie() {
    const [activeSection, setActiveSection] = useState('apercu');
    const [activeSeason, setActiveSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['apercu', 'prologue', 'saisons', 'personnages'];
            const scrollPosition = window.scrollY + 200; // Offset for header

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // Account for sticky header height (approx 80px main header + 60px sub-nav)
            const offset = 140;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white">
            {/* HERO SECTION */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-echo-red/20 via-black to-black z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517604931442-710e8cd52285?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                <div className="relative z-20 text-center max-w-4xl px-4 animate-fade-in">
                    <span className="text-[#DC143C] uppercase tracking-[0.3em] text-sm font-bold mb-4 block">La Websérie Événement</span>
                    <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tighter text-shadow-lg">
                        La Série ECHO
                    </h1>
                    <p className="text-xl text-[#D1D5DB] max-w-2xl mx-auto italic font-serif mb-8">
                        "Une encyclopédie moderne. Trois saisons pour comprendre, ressentir et agir."
                    </p>
                    <Button variant="primary" size="lg" onClick={() => scrollToSection('apercu')}>
                        <Play className="mr-2" size={20} /> Découvrir
                    </Button>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white rounded-full" />
                    </div>
                </div>
            </section>

            {/* STICKY SUB-MENU */}
            <nav className="sticky top-0 md:top-[80px] z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-y border-white/10 transition-all duration-300">
                <div className="container mx-auto px-4 overflow-x-auto">
                    <div className="flex justify-center min-w-max">
                        {['apercu', 'prologue', 'saisons', 'personnages'].map((section) => (
                            <button
                                key={section}
                                onClick={() => scrollToSection(section)}
                                className={`px-6 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors duration-300 ${activeSection === section
                                    ? 'border-[#D4AF37] text-[#D4AF37]'
                                    : 'border-transparent text-neutral-500 hover:text-white'
                                    }`}
                            >
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* SECTION 1: APERÇU */}
            <section id="apercu" className="min-h-screen py-24 border-b border-white/5 bg-[#0A0A0A] relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-echo-gold/5 via-transparent to-transparent opacity-30 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    {/* SYNOPSIS */}
                    <div className="mb-24 text-center max-w-4xl mx-auto">
                        <h2 className="text-[48px] font-serif font-bold text-[#D4AF37] mb-12">Aperçu</h2>
                        <div className="space-y-8 text-[18px] text-[#D1D5DB] leading-[1.8] font-sans">
                            <p>
                                <strong className="text-white">Et si tout s'effondrait demain ?</strong><br />
                                Si vous deviez choisir entre votre confort et un avenir vivable ?<br />
                                C'est le dilemme auquel fait face Sacha, cadre financier étouffé par un système qu'il ne supporte plus.<br />
                                Plutôt que de se résigner, il choisit d'agir.<br />
                                Il se lance dans un projet ambitieux mais réaliste : révéler ce monde tel qu'il est, transformer en profondeur ce système à bout de souffle et tracer un chemin vers une société plus juste et durable.
                            </p>
                            <p>
                                <strong className="text-white">Une quête moderne, inspirée du voyage initiatique de Dante.</strong><br />
                                <span className="text-[#DC143C] font-semibold">L'Enfer.</span> <span className="text-[#10B981] font-semibold">Le Purgatoire.</span> <span className="text-[#3B82F6] font-semibold">Le Paradis.</span><br />
                                Trois saisons pour traverser les vices de notre époque, explorer des solutions tangibles, et entrevoir une harmonie possible entre l'humain, la nature et nos institutions.
                            </p>
                            <p>
                                <strong className="text-white">ECHO est une fiction ancrée dans la réalité.</strong><br />
                                Une série qui questionne autant qu'elle instruit, qui éclaire autant qu'elle rassemble.<br />
                                33 épisodes pour comprendre le monde et peut-être le transformer... positivement.
                            </p>
                        </div>
                    </div>

                    {/* LES 3 VOLETS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {/* VOLET ÉDUCATIF */}
                        <div className="group p-8 rounded-[16px] bg-[rgba(18,18,18,0.6)] backdrop-blur-[16px] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-300">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_24px_rgba(212,175,55,0.2)]">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white text-center mb-4">Une série ludique</h3>
                            <div className="h-0.5 w-12 bg-[#D4AF37] mx-auto mb-6 opacity-50" />
                            <p className="text-[#D1D5DB] text-center leading-relaxed">
                                Au-delà de la fiction, chaque épisode est adossé à des sources référencées, documentées et rigoureusement vérifiées par nos experts partenaires pour garantir la justesse du propos.
                            </p>
                        </div>

                        {/* VOLET ARTISTIQUE */}
                        <div className="group p-8 rounded-[16px] bg-[rgba(18,18,18,0.6)] backdrop-blur-[16px] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-300">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_24px_rgba(212,175,55,0.2)]">
                                <Palette size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white text-center mb-4">Une œuvre d'art totale</h3>
                            <div className="h-0.5 w-12 bg-[#D4AF37] mx-auto mb-6 opacity-50" />
                            <p className="text-[#D1D5DB] text-center leading-relaxed">
                                Une fusion ambitieuse de tous les arts : spectacle vivant, expression corporelle, cinéma, littérature, peinture et sculpture. La narration s'enrichit d'extraits de paroles d'artistes et d'une identité musicale forte.
                            </p>
                        </div>

                        {/* VOLET INTERACTIF */}
                        <div className="group p-8 rounded-[16px] bg-[rgba(18,18,18,0.6)] backdrop-blur-[16px] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-300">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_24px_rgba(212,175,55,0.2)]">
                                <Gamepad2 size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white text-center mb-4">Agir après chaque épisode</h3>
                            <div className="h-0.5 w-12 bg-[#D4AF37] mx-auto mb-6 opacity-50" />
                            <p className="text-[#D1D5DB] text-center leading-relaxed">
                                L'expérience déborde de l'écran. Débusquez des indices cachés pour résoudre des énigmes réelles. Utilisez <strong className="text-white">Cognisphère</strong> pour maîtriser les savoirs, et <strong className="text-white">ECHOLink</strong> pour bâtir des projets utiles.
                            </p>
                        </div>
                    </div>

                    {/* CTA - REJOINDRE */}
                    <div className="text-center max-w-2xl mx-auto">
                        <p className="text-xl text-[#D1D5DB] mb-8 font-serif italic">
                            Les scénarios sont en cours d'écriture. Vous avez une plume et des convictions ?<br />Participez à la création d'ECHO.
                        </p>
                        <Button
                            className="bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#FFD700] hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-lg transition-all transform hover:scale-105"
                            onClick={() => window.location.href = '/contact'}
                        >
                            Rejoindre l'aventure
                        </Button>
                    </div>
                </div>
            </section>

            {/* SECTION 2: PROLOGUE */}
            <section id="prologue" className="min-h-screen py-24 border-b border-white/5 bg-[#121212] relative">
                <div className="container mx-auto px-4">
                    <h2 className="text-[48px] font-serif font-bold text-white mb-16 text-center">Prologue</h2>

                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* COLONNE GAUCHE : VIDÉO (60%) */}
                        <div className="w-full lg:w-[60%]">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] group">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/5NvxbMIbjAo"
                                    title="PROLOGUE - Teaser"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                ></iframe>
                            </div>
                            <p className="mt-4 text-[#D4AF37] font-serif tracking-widest uppercase text-sm font-bold">PROLOGUE - TEASER</p>
                        </div>

                        {/* COLONNE DROITE : CRÉDITS (40%) */}
                        <div className="w-full lg:w-[40%]">
                            <div className="p-8 rounded-[16px] bg-[rgba(255,255,255,0.03)] backdrop-blur-[16px] border border-white/10 hover:border-[#D4AF37]/30 transition-colors duration-300">
                                <h3 className="text-2xl font-serif text-white mb-8 border-b border-white/10 pb-4">Crédits</h3>

                                <div className="space-y-6 text-sm">
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-2 text-xs">Réalisation & Visuels</h4>
                                        <p className="text-[#D1D5DB]">Intelligence Artificielle (Storyboard Animé) avec Higgsfield et Flow.</p>
                                    </div>

                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-2 text-xs">Scénario & Montage</h4>
                                        <ul className="text-[#D1D5DB] space-y-1">
                                            <li>Eddyason Koffi</li>
                                            <li>Jérémy Lasne</li>
                                            <li>Clément Grandmontagne</li>
                                            <li>Déborah Prévaud</li>
                                            <li>Thierry Korutos-Chatam</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-2 text-xs">Composition Musicale</h4>
                                        <p className="text-[#D1D5DB]">Erela</p>
                                    </div>

                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-2 text-xs">Voix-Off</h4>
                                        <p className="text-[#D1D5DB] italic">À venir</p>
                                    </div>
                                </div>

                                {/* SOCIAL MEDIA */}
                                <div className="mt-10 pt-6 border-t border-white/10 flex justify-center gap-6">
                                    <a href="#" className="text-neutral-500 hover:text-[#D4AF37] transition-colors duration-300 transform hover:scale-110">
                                        <Instagram size={24} />
                                    </a>
                                    <a href="#" className="text-neutral-500 hover:text-[#D4AF37] transition-colors duration-300 transform hover:scale-110">
                                        <Facebook size={24} />
                                    </a>
                                    <a href="#" className="text-neutral-500 hover:text-[#D4AF37] transition-colors duration-300 transform hover:scale-110">
                                        <Linkedin size={24} />
                                    </a>
                                    <a href="#" className="text-neutral-500 hover:text-[#D4AF37] transition-colors duration-300 transform hover:scale-110">
                                        <Twitter size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: SAISONS */}
            <section id="saisons" className="min-h-screen py-24 border-b border-white/5 bg-[#0A0A0A]">
                <div className="container mx-auto px-4">
                    <h2 className="text-[48px] font-serif font-bold text-white mb-16 text-center">Les Saisons</h2>

                    {/* TABS */}
                    <div className="flex justify-center gap-4 mb-20 flex-wrap">
                        {/* SAISON 1 */}
                        <button
                            onClick={() => setActiveSeason(1)}
                            className={`group relative flex items-center gap-3 px-8 py-4 rounded-full border transition-all duration-300 ${activeSeason === 1
                                ? 'bg-[#DC143C]/10 border-[#DC143C] text-white shadow-[0_0_20px_rgba(220,20,60,0.3)]'
                                : 'bg-transparent border-white/10 text-neutral-500 hover:border-[#DC143C]/50 hover:text-white'
                                }`}
                        >
                            <Flame size={20} className={activeSeason === 1 ? 'text-[#DC143C]' : ''} />
                            <div className="text-left">
                                <span className="block text-xs font-bold tracking-widest uppercase">Saison 1</span>
                                <span className="font-serif text-lg font-bold">L'ENFER</span>
                            </div>
                        </button>

                        {/* SAISON 2 */}
                        <button
                            onClick={() => setActiveSeason(2)}
                            className={`group relative flex items-center gap-3 px-8 py-4 rounded-full border transition-all duration-300 ${activeSeason === 2
                                ? 'bg-[#10B981]/10 border-[#10B981] text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : 'bg-transparent border-white/10 text-neutral-500 hover:border-[#10B981]/50 hover:text-white'
                                }`}
                        >
                            <Mountain size={20} className={activeSeason === 2 ? 'text-[#10B981]' : ''} />
                            <div className="text-left">
                                <span className="block text-xs font-bold tracking-widest uppercase">Saison 2</span>
                                <span className="font-serif text-lg font-bold">LE PURGATOIRE</span>
                            </div>
                        </button>

                        {/* SAISON 3 */}
                        <button
                            onClick={() => setActiveSeason(3)}
                            className={`group relative flex items-center gap-3 px-8 py-4 rounded-full border transition-all duration-300 ${activeSeason === 3
                                ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-transparent border-white/10 text-neutral-500 hover:border-[#3B82F6]/50 hover:text-white'
                                }`}
                        >
                            <Star size={20} className={activeSeason === 3 ? 'text-[#3B82F6]' : ''} />
                            <div className="text-left">
                                <span className="block text-xs font-bold tracking-widest uppercase">Saison 3</span>
                                <span className="font-serif text-lg font-bold">LE PARADIS</span>
                            </div>
                        </button>
                    </div>

                    {/* CONTENU SAISON 1 */}
                    {activeSeason === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                            {episodesS1.map((ep, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedEpisode(ep)}
                                    className="group relative h-[200px] bg-[#121212] rounded-xl border border-white/5 p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-[#DC143C] hover:shadow-[0_0_30px_rgba(220,20,60,0.1)] hover:-translate-y-2"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="text-6xl font-serif font-bold text-white">{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="h-full flex flex-col justify-end relative z-10">
                                        <span className="text-[#DC143C] text-xs font-bold tracking-widest uppercase mb-2">Épisode {index + 1}</span>
                                        <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#DC143C] transition-colors">{ep.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CONTENU SAISON 2 (Placeholder) */}
                    {activeSeason === 2 && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in text-center p-8 bg-[#121212]/50 rounded-2xl border border-white/5 border-dashed">
                            <Mountain size={64} className="text-[#10B981] mb-6 opacity-50" />
                            <h3 className="text-3xl font-serif font-bold text-white mb-4">Saison en cours d'écriture</h3>
                            <p className="text-xl text-[#10B981]">Diffusion Avril 2027</p>
                        </div>
                    )}

                    {/* CONTENU SAISON 3 (Placeholder) */}
                    {activeSeason === 3 && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in text-center p-8 bg-[#121212]/50 rounded-2xl border border-white/5 border-dashed">
                            <Star size={64} className="text-[#3B82F6] mb-6 opacity-50" />
                            <h3 className="text-3xl font-serif font-bold text-white mb-4">Vision future</h3>
                            <p className="text-xl text-[#3B82F6]">Diffusion 2027-2028</p>
                        </div>
                    )}
                </div>
            </section>

            {/* MODAL EPISODE DETAILS */}
            <Modal isOpen={!!selectedEpisode} onClose={() => setSelectedEpisode(null)} className="max-w-2xl bg-[#0A0A0A] border-[#D4AF37]/30">
                {selectedEpisode && (
                    <div className="text-left">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-[#DC143C] text-sm font-bold tracking-widest uppercase block mb-1">Saison 1 - Épisode {episodesS1.indexOf(selectedEpisode) + 1}</span>
                                <h3 className="text-4xl font-serif font-bold text-white">{selectedEpisode.title}</h3>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* EXISTENTIELLES */}
                            <div>
                                <h4 className="flex items-center gap-2 text-[#D4AF37] font-bold uppercase tracking-wider mb-3 text-sm border-b border-[#D4AF37]/20 pb-2">
                                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span> Thématiques Existentielles
                                </h4>
                                <p className="text-[#D1D5DB] leading-relaxed">{selectedEpisode.themes.existential}</p>
                            </div>

                            {/* SOCIÉTALES */}
                            <div>
                                <h4 className="flex items-center gap-2 text-white font-bold uppercase tracking-wider mb-3 text-sm border-b border-white/10 pb-2">
                                    <span className="w-2 h-2 rounded-full bg-white"></span> Thématiques Sociétales
                                </h4>
                                <p className="text-[#D1D5DB] leading-relaxed">{selectedEpisode.themes.societal}</p>
                            </div>

                            {/* SOCIALES */}
                            <div>
                                <h4 className="flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-wider mb-3 text-sm border-b border-white/10 pb-2">
                                    <span className="w-2 h-2 rounded-full bg-neutral-400"></span> Thématiques Sociales
                                </h4>
                                <p className="text-[#D1D5DB] leading-relaxed">{selectedEpisode.themes.social}</p>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
                            <Button onClick={() => setSelectedEpisode(null)} variant="outline" className="text-white border-white/20 hover:bg-white/5">
                                Fermer
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* SECTION 4: PERSONNAGES */}
            <section id="personnages" className="min-h-screen py-24 bg-[#121212] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-echo-blue/5 via-transparent to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-[48px] font-serif font-bold text-white mb-4 text-center">Les Personnages</h2>
                    <p className="text-[#D1D5DB] text-center max-w-2xl mx-auto mb-16 italic font-serif">"Ils sont le reflet de nos vices, de nos peurs, mais aussi de nos espoirs."</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* SACHA */}
                        <CharacterCard
                            name="SACHA"
                            role="Le Protagoniste"
                            description="Responsable administratif et financier, Sacha est doté d'une forte empathie et d'une capacité à appréhender les dynamiques systémiques. Il porte en lui le poids immense du « syndrome du sauveur ». Sa détermination à éveiller les consciences et à transformer radicalement la société provient de ses prises de conscience sur l'avenir incertain du monde."
                            image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2574&auto=format&fit=crop"
                        />
                        {/* PHILIPPE */}
                        <CharacterCard
                            name="PHILIPPE"
                            role="Le Prodigue"
                            description="Père de Sacha, Philippe est un homme dont les convictions radicales imprègnent chaque aspect de sa vie. Animé par des préjugés racistes et une mentalité matérialiste poussée à l'extrême, il affiche sans détour un caractère provocateur et agressif. Son autoritarisme et son intolérance sont autant de barrières qui le séparent de son fils."
                            image="https://images.unsplash.com/photo-1562788869-4ed32648eb72?q=80&w=2672&auto=format&fit=crop"
                        />
                        {/* NADINE */}
                        <CharacterCard
                            name="NADINE"
                            role="Les Limbes"
                            description="Mère de Sacha, Nadine est profondément marquée par l'inquiétude et l'anxiété envers son fils. Bien qu'elle agisse toujours avec de bonnes intentions, son anxiété excessive la pousse souvent à étouffer et à entraver l'épanouissement de Sacha, compromettant parfois involontairement son ambition."
                            image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop"
                        />
                        {/* EVA */}
                        <CharacterCard
                            name="EVA"
                            role="L'Amour"
                            description="Petite amie de Sacha, Eva représente la douceur et l'amour au sein de la vie tumultueuse du héros. Elle est amoureuse, mais se trouve constamment tiraillée entre la quête idéaliste de Sacha et ses propres besoins. Cet équilibre délicat rend leur relation intense et complexe, parfois menacée par l'ampleur de la mission que Sacha s'impose."
                            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop"
                        />
                        {/* AKOU */}
                        <CharacterCard
                            name="AKOU"
                            role="Le Guide Spirituel"
                            description="Ami et guide spirituel de Sacha, Akou porte en lui une profonde sagesse et une compréhension intuitive du monde. Habité par une quête constante d'équilibre et d'unité, il devient le repère moral essentiel dans le voyage tumultueux de Sacha."
                            image="https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=2574&auto=format&fit=crop"
                        />
                        {/* LILY */}
                        <CharacterCard
                            name="LILY"
                            role="La Rebelle"
                            description="Rencontre inattendue dans le parcours de Sacha, Lily est une femme libre et intuitive portée par une énergie rebelle. Experte en construction durable, elle allie écologie et sensibilité artistique. Habituée à ne compter que sur elle, son indépendance dissimule une blessure, la peur d'ouvrir pleinement son coeur. Par la suite elle deviendra un moteur de transformation pour elle-même et pour ceux qui l'entourent."
                            image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2664&auto=format&fit=crop"
                        />
                        {/* NOUR */}
                        <CharacterCard
                            name="NOUR"
                            role="Le Soutien"
                            description="Femme de ménage au sein de l'entreprise, Nour est animée d'une générosité sincère et chaleureuse. Malgré une vie modeste marquée par l'exil, elle apporte à Sacha un soutien émotionnel précieux, incarnant l'empathie véritable. Toutefois, son dévouement absolu aux autres révèle aussi sa vulnérabilité : celle de négliger sa propre identité et ses propres besoins pour le bonheur des autres."
                            image="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2574&auto=format&fit=crop"
                        />

                        {/* COLLÈGUES (VICES) */}
                        <CharacterCard
                            name="MARIANNE"
                            role="Luxure"
                            description="Responsable des Ressources Humaines. Incarne le vice de la luxure. Elle symbolise les dérives de l'industrie du luxe, des médias et de la mode, où l'image est valorisée au détriment de l'authenticité. Son parcours amorce une transformation vers la sobriété, réconciliant l'esthétique avec l'éthique, jusque dans sa manière de communiquer, de s'habiller et de vivre."
                            image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2670&auto=format&fit=crop"
                        />
                        <CharacterCard
                            name="DOMINIQUE"
                            role="Gourmandise"
                            description="Responsable des services généraux, représente le vice de la gourmandise. Il reflète les problématiques de l'industrie agro-alimentaire ainsi que des excès d'une société consumériste. Figure de la résistance au changement, Dominique entame pourtant une métamorphose. Sa trajectoire est ciblée sur un retour à la terre, une consommation plus saine et respectueuse de l'environnement."
                            image="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=2680&auto=format&fit=crop"
                        />
                        <CharacterCard
                            name="SOPHIE"
                            role="Avarice"
                            description="Responsable Marketing & Communication, personnifie le vice de l'avarice. Elle illustre les dérives de l'industrie marketing et publicitaire qui manipule nos esprits et nos comportements. Son évolution s'engage vers une approche centrée sur le sens, la transparence et intégrité."
                            image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop"
                        />
                        <CharacterCard
                            name="ALEXANDRE"
                            role="Colère"
                            description="Responsable Achat & Ventes des composants chimiques médicaux, Incarne le vice de la colère. Il représente les abus de l'industrie pharmaceutique. Son cheminement l'amène à un apaisement progressif fondé sur l'utilisation des médecines douces et le sport pour redonner une place prépondérante à sa santé physique et mentale."
                            image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop"
                        />
                        <CharacterCard
                            name="SARA"
                            role="Hérésie"
                            description="Responsable Recherche & Développement, symbolise le vice de l'hérésie. Elle incarne les excès des industries de la tech et en particulier de l'intelligence artificielle, où le culte du progrès technique s'impose au détriment des limites planétaires. Son parcours la conduit à s'intéresser aux ponts entre la science et la spiritualité afin de répondre aux défis contemporains."
                            image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2574&auto=format&fit=crop"
                        />
                        <CharacterCard
                            name="ROHAN"
                            role="Violence"
                            description="Responsable Logistique, Rohan incarne le vice de la violence. Il reflète la violence à tous les niveaux (conjugale, l'armée, la géopolitique). Son parcours amorce une métamorphose, ouvrant un chemin vers l'écoute, l'empathie et la réconciliation familiale. Le sport sera son vecteur d'apaisement, d'émancipation et de rassemblement."
                            image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop"
                        />
                        <CharacterCard
                            name="AYUMI"
                            role="Fraude"
                            description="Responsable Juridique spécialisée en droit des affaires et en homologation des médicaments, illustre le vice de la fraude. Elle évoque l'opacité du système juridique institutionnel, le lobbying et les systèmes normatifs. Son évolution sera marquée par la mise en place d'une justice socialement juste et respectueuse du vivant."
                            image="https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=2572&auto=format&fit=crop"
                        />
                        <CharacterCard
                            name="MATHIEU"
                            role="Trahison"
                            description="Directeur général, incarne le vice de la trahison. Il représente les intérêts privés, l'influence du pouvoir politique, du lobbying et du patronat. Sa réputation l'importe plus que tout. Ses mécanismes de domination, fondée sur le contrôle et la peur, se retourneront à terme contre lui."
                            image="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function CharacterCard({ name, role, description, image }: { name: string, role: string, description: string, image: string }) {
    return (
        <div className="group relative rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            {/* Image */}
            <div className="aspect-[4/5] relative overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />

                {/* Text Overlay (Default Visible) */}
                <div className="absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-2xl font-serif font-bold text-white mb-1">{name}</h3>
                    <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest">{role}</p>
                </div>

                {/* Description Overlay (Hover only) */}
                <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-sm p-8 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-2xl font-serif font-bold text-[#D4AF37] mb-2">{name}</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6">{role}</p>
                    <p className="text-[#D1D5DB] leading-relaxed text-sm">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
