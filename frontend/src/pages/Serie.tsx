import { useState, useEffect, useCallback } from 'react';
import { Play, BookOpen, Flame, Mountain, Star, Palette, Gamepad2, Bell, BellRing, X, Youtube } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { YouTubeEmbed } from '../components/ui/YouTubeEmbed';
import { Helmet } from 'react-helmet-async';
import { SEO } from '../components/seo/SEO';
import { ScenaristApplicationForm } from '../components/forms/ScenaristApplicationForm';
import { StudentApplicationForm } from '../components/forms/StudentApplicationForm';
import { useAuthStore } from '../features/auth/store';
import { API_URL } from '../config/api';
import { useAnalytics } from '../hooks/useAnalytics';

type Episode = {
    title: string;
    vice: string;
    synopsis: string;
    themes: {
        existential: string;
        societal: string;
        social: string;
    };
};

const episodesS1: Episode[] = [
    {
        title: "Révélation",
        vice: "",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Quête de sens, Rêves, Dualité, Développement personnel, Cosmogonie et symbole africain.",
            societal: "Dérèglement climatique.",
            social: "Inégalités sociales, Incivilité, Minimalisme."
        }
    },
    {
        title: "Catabase",
        vice: "Les Limbes",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Philosophie (ontologie, éthique et morale, ubuntu), Énergie et mécanisme de domination, Neurosciences.",
            societal: "Immigration.",
            social: "Éducation, Communication non violente, Différences générationnelles."
        }
    },
    {
        title: "Anamesis",
        vice: "La Luxure",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Psychologie et psychanalyse, Synchronicités, Art divinatoire, Pouvoir de la pensée, Hypnose, Mentalisme.",
            societal: "Patriarcat, Protection animale, Médias et réseaux sociaux.",
            social: "Industrie de la mode et du luxe, Féminisme, Sexualité."
        }
    },
    {
        title: "Maga ou Sympathie",
        vice: "La Gourmandise",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Substances psychoactives, EMC, Astrologie, Biologie (microcosme / macrocosme).",
            societal: "Sécurité alimentaire, Industrie primaire et secondaire, Gestion des déchets, Greenwashing.",
            social: "Consommation, Énergie."
        }
    },
    {
        title: "Pléonexie",
        vice: "L'Avarice",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Numérologie, Physique quantique, Mathématiques.",
            societal: "Fascisme, extrémiste, Économie, Finance.",
            social: "Publicité."
        }
    },
    {
        title: "Ménis",
        vice: "La Colère",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Chamanisme, Exorcisme, Spiritisme, Médiumnité, Capacités psychiques.",
            societal: "Industrie pharmaceutique.",
            social: "Santé, Psychiatrie."
        }
    },
    {
        title: "Mythopéïa",
        vice: "L'Hérésie",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Mythologie, Ancienne civilisation, Guru et dérive sectaire.",
            societal: "Impact et risque de l'IA, Transhumanisme, Technologies, Wokisme.",
            social: "Amour."
        }
    },
    {
        title: "Metanoïa",
        vice: "La Violence",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Mort et réincarnation, Karma, Religions.",
            societal: "Guerre, Géopolitique, Cybersécurité.",
            social: "Violence conjugale, Maltraitance."
        }
    },
    {
        title: "Fatum",
        vice: "La Fraude",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Origines et influences des traditions initiatiques, Prophéties, Géométrie sacrée.",
            societal: "Droit et justice, Lobby, Logement et urbanisme.",
            social: "Industrie de l'art et du cinéma."
        }
    },
    {
        title: "Divine Providence",
        vice: "La Trahison 1/2",
        synopsis: "Synopsis à venir",
        themes: {
            existential: "Courants mystiques et philosophies spirituelles, Démonologie, Théorie complotiste.",
            societal: "Politique, Syndicats, Pouvoir, Activisme.",
            social: "Industrie musicale."
        }
    },
    {
        title: "Alétheia",
        vice: "La Trahison 2/2",
        synopsis: "Synopsis à venir",
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
    const [showScenaristForm, setShowScenaristForm] = useState(false);
    const [showStudentForm, setShowStudentForm] = useState(false);
    const { trackEvent } = useAnalytics();
    const [myOptins, setMyOptins] = useState<{ season: number; episode: number }[]>([]);
    const [optinLoading, setOptinLoading] = useState(false);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    // Fetch user opt-ins on mount (if authenticated)
    useEffect(() => {
        if (!isAuthenticated) return;
        fetch(`${API_URL}/episodes/opt-in/me`, {
            credentials: 'include',
        })
            .then((res) => res.ok ? res.json() : [])
            .then(setMyOptins)
            .catch(() => { });
    }, [isAuthenticated]);

    const isOptedIn = useCallback((episodeIndex: number) => {
        return myOptins.some((o) => o.season === 1 && o.episode === episodeIndex + 1);
    }, [myOptins]);

    const handleOptIn = async (episodeIndex: number) => {
        if (!isAuthenticated || optinLoading) return;
        setOptinLoading(true);
        try {
            const res = await fetch(`${API_URL}/episodes/opt-in`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ season: 1, episode: episodeIndex + 1 }),
            });
            if (res.ok) {
                setMyOptins((prev) => [...prev, { season: 1, episode: episodeIndex + 1 }]);
            }
        } catch { /* silent */ }
        setOptinLoading(false);
    };

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
            <SEO
                title="La Série"
                description="Série fiction ECHO : 33 épisodes en 3 saisons inspirées de Dante. Écologie, justice sociale, prospective."
                url="https://mouvementecho.fr/serie"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "TVSeries",
                        "@id": "https://mouvementecho.fr/serie#series",
                        "name": "ECHO",
                        "description": "Série fiction de 33 épisodes en 3 saisons. Une encyclopédie moderne sur la transition écologique et la justice sociale.",
                        "numberOfSeasons": 3,
                        "numberOfEpisodes": 33,
                        "genre": ["Drama", "Social"],
                        "inLanguage": "fr",
                        "url": "https://mouvementecho.fr/serie",
                        "image": "https://mouvementecho.fr/og-echo.jpg",
                        "creator": {
                            "@type": "Organization",
                            "name": "Association Mouvement ECHO",
                            "url": "https://mouvementecho.fr"
                        },
                        "containsSeason": [
                            {
                                "@type": "TVSeason",
                                "seasonNumber": 1,
                                "name": "Diagnostic des crises",
                                "numberOfEpisodes": 11
                            },
                            {
                                "@type": "TVSeason",
                                "seasonNumber": 2,
                                "name": "Solutions du terrain",
                                "numberOfEpisodes": 11
                            },
                            {
                                "@type": "TVSeason",
                                "seasonNumber": 3,
                                "name": "Futurs souhaitables",
                                "numberOfEpisodes": 11
                            }
                        ]
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "VideoObject",
                        "name": "ECHO — Prologue (Storyboard IA)",
                        "description": "Storyboard animé assisté par intelligence artificielle présentant l'univers de la série ECHO. Voix et musique originales.",
                        "thumbnailUrl": "https://mouvementecho.fr/og-echo.jpg",
                        "uploadDate": "2026-03-20",
                        "contentUrl": "https://www.youtube.com/watch?v=R34yKJuPDWA",
                        "embedUrl": "https://www.youtube-nocookie.com/embed/R34yKJuPDWA",
                        "duration": "PT5M"
                    })}
                </script>
            </Helmet>
            {/* HERO SECTION */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-echo-red/20 via-black to-black z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517604931442-710e8cd52285?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                <div className="relative z-20 text-center max-w-4xl px-4 animate-fade-in">
                    <img src="/logo-echo-transparent.png" alt="ECHO" className="h-28 sm:h-40 md:h-56 w-auto object-contain mx-auto mt-8 sm:mt-12 -mb-6" />
                    <span className="text-[#DC143C] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm font-bold mb-3 sm:mb-4 block">La Websérie Événement</span>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 sm:mb-6 tracking-tighter text-shadow-lg">
                        La Série ECHO
                    </h1>
                    <p className="text-base sm:text-xl text-[#D1D5DB] max-w-2xl mx-auto italic font-serif mb-6 sm:mb-8">
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
            <nav className="sticky top-14 sm:top-16 md:top-[80px] z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-y border-white/10 transition-all duration-300">
                <div className="container mx-auto px-2 sm:px-4 overflow-x-auto">
                    <div className="flex justify-center min-w-max">
                        {['apercu', 'prologue', 'saisons', 'personnages', 'rejoindre-serie'].map((section) => (
                            <button
                                key={section}
                                onClick={() => scrollToSection(section)}
                                aria-label={`Aller à la section ${section}`}
                                className={`px-6 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors duration-300 ${activeSection === section
                                    ? 'border-[#D4AF37] text-[#D4AF37]'
                                    : 'border-transparent text-neutral-500 hover:text-white'
                                    }`}
                            >
                                {section === 'rejoindre-serie' ? 'Rejoindre' : section.charAt(0).toUpperCase() + section.slice(1)}
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
                        <h2 className="text-3xl sm:text-4xl md:text-[48px] font-serif font-bold text-[#D4AF37] mb-8 sm:mb-12">Aperçu</h2>
                        <div className="space-y-6 sm:space-y-8 text-base sm:text-[18px] text-[#D1D5DB] leading-[1.8] font-sans">
                            <p>
                                <strong className="text-white">Et si tout s'effondrait demain ?</strong><br />
                                Si vous deviez choisir entre votre confort et un avenir vivable ?<br />
                                C'est le dilemme auquel fait face Sacha, cadre financier étouffé par un système qu'il ne supporte plus.<br />
                                Plutôt que de se résigner, il choisit d'agir.<br />
                                Il se lance dans un projet ambitieux mais réaliste : révéler ce monde tel qu'il est, transformer en profondeur ce système à bout de souffle et tracer un chemin vers une société plus juste et durable.
                            </p>
                            <p>
                                <strong className="text-white">Une quête moderne, inspirée du voyage initiatique de Dante.</strong><br />
                                <span className="text-[#DC143C] font-semibold">Comprendre.</span> <span className="text-[#10B981] font-semibold">Ressentir.</span> <span className="text-[#3B82F6] font-semibold">Agir.</span><br />
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

                    {/* Lien ancre vers la section recrutement en bas de page */}
                    <div className="text-center">
                        <a href="#rejoindre-serie" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#FFD700] font-serif text-lg sm:text-xl italic transition-colors group">
                            Participez à la création d'ECHO
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* SECTION 2: PROLOGUE */}
            <section id="prologue" className="min-h-screen py-24 border-b border-white/5 bg-[#121212] relative">
                <div className="container mx-auto px-4">
                    <h2 className="text-[48px] font-serif font-bold text-white mb-6 text-center">Prologue</h2>
                    <p className="text-white/50 text-sm sm:text-base text-center max-w-3xl mx-auto mb-12 leading-relaxed">
                        Ce prologue est un storyboard animé assisté par intelligence artificielle. Il présente le concept, la palette chromatique, l&apos;univers narratif de la série ECHO et ses personnages. Faute de moyens et de temps, l&apos;IA nous a permis de donner forme à cette vision. La série sera produite en <span className="text-white/70 font-medium">tournage réel</span>. Les voix et la bande originale sont authentiques, un <span className="text-white/70 font-medium">contre-pied volontaire</span> à l&apos;IA.
                    </p>

                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* COLONNE GAUCHE : VIDÉO (60%) */}
                        <div className="w-full lg:w-[60%]">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] group">
                                <YouTubeEmbed
                                    videoId="R34yKJuPDWA"
                                    title="PROLOGUE - Teaser"
                                    className="absolute inset-0 w-full h-full"
                                />
                            </div>
                            <p className="mt-4 text-[#D4AF37] font-serif tracking-widest uppercase text-sm font-bold">PROLOGUE - TEASER</p>
                        </div>

                        {/* COLONNE DROITE : CRÉDITS (40%) */}
                        <div className="w-full lg:w-[40%]">
                            <div className="p-8 rounded-[16px] bg-[rgba(255,255,255,0.03)] backdrop-blur-[16px] border border-white/10 hover:border-[#D4AF37]/30 transition-colors duration-300">
                                <h3 className="text-xl font-serif text-white mb-4 border-b border-white/10 pb-3">Crédits</h3>

                                <div className="space-y-3 text-[11px] leading-snug">
                                    {/* Écriture & Réalisation */}
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5 text-[9px]">Écrit et réalisé par</h4>
                                        <p className="text-[#D1D5DB]">Jérémy Lasne, Eddyason Koffi &amp; Clément Grandmontagne</p>
                                    </div>

                                    {/* Création visuelle IA */}
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5 text-[9px]">Création visuelle par IA</h4>
                                        <p className="text-[#D1D5DB]">
                                            Direction artistique, colorimétrie, génération images <span className="text-white/30">(Higgsfield, Nano Banana 2)</span> et vidéo <span className="text-white/30">(Higgsfield, Veo 3.1, Kling AI)</span> — J. Lasne &amp; C. Grandmontagne
                                        </p>
                                    </div>

                                    {/* Voix originales */}
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5 text-[9px]">Voix originales <span className="normal-case font-normal text-white/30">(par ordre d&apos;apparition)</span></h4>
                                        <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0 text-[#D1D5DB]">
                                            <span>Rafael Brouard</span><span className="text-white/40 italic">Sacha</span>
                                            <span>Jenny Sophie</span><span className="text-white/40 italic">Nadine</span>
                                            <span>Eddyason Koffi</span><span className="text-white/40 italic">Akou</span>
                                            <span>Marius Gaillard</span><span className="text-white/40 italic">Sacha (enfant)</span>
                                            <span>Stéphane Gabbay</span><span className="text-white/40 italic">Philippe</span>
                                            <span>Adèle Roqueta</span><span className="text-white/40 italic">Eva</span>
                                            <span>Jenny Sophie</span><span className="text-white/40 italic">Marianne</span>
                                            <span>Jean-Luc Claise</span><span className="text-white/40 italic">Dominique</span>
                                            <span>Stéphane Gabbay</span><span className="text-white/40 italic">Alexandre</span>
                                            <span>Sylvie Seyller</span><span className="text-white/40 italic">Lily</span>
                                            <span>Pierre Gaillard</span><span className="text-white/40 italic">Rohan (enfant)</span>
                                            <span>Adèle Roqueta</span><span className="text-white/40 italic">Femme de Rohan</span>
                                            <span>Adèle Roqueta</span><span className="text-white/40 italic">Ayumi</span>
                                            <span>Benjamin Garnier</span><span className="text-white/40 italic">Mathieu</span>
                                            <span>Adèle Roqueta</span><span className="text-white/40 italic">Axelle</span>
                                            <span>Stéphane Gabbay</span><span className="text-white/40 italic">Psychologue</span>
                                        </div>
                                    </div>

                                    {/* Image & Son */}
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5 text-[9px]">Image &amp; Son</h4>
                                        <p className="text-[#D1D5DB]">Montage image — C. Grandmontagne · Son, montage &amp; mixage — Visanth Moulta</p>
                                    </div>

                                    {/* Musiques */}
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5 text-[9px]">Musiques</h4>
                                        <p className="text-[#D1D5DB]">
                                            <span className="italic">&ldquo;Dance Zulu&rdquo;</span> <span className="text-white/30">— African Drums · Remix V. Moulta · ℗ 2009 African Rhythms Int.</span><br />
                                            <span className="italic">&ldquo;Les racines du rêve&rdquo;</span> <span className="text-white/30">— H. Torgue &amp; S. Houppin · Hopi Mesa / Music Box Pub. · © 2019</span>
                                        </p>
                                    </div>

                                    {/* Bande originale */}
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5 text-[9px]">Bande originale</h4>
                                        <p className="text-[#D1D5DB]">
                                            Arrangements &amp; adaptation — R. Brouard &amp; V. Moulta · Chants — R. Brouard<br />
                                            <span className="text-white/30">Enregistrement &amp; mixage — V. Moulta · Studio Mithra Production</span>
                                        </p>
                                    </div>

                                    {/* Remerciements */}
                                    <div className="pt-2 border-t border-white/5">
                                        <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5 text-[9px]">Remerciements</h4>
                                        <p className="text-white/40 text-[10px]">D. Prévaud, T. Korutos-Chatam, le Collectif 47 et le Studio Mithra Production.</p>
                                    </div>
                                </div>

                                {/* YouTube */}
                                <div className="mt-6 pt-4 border-t border-white/10 flex justify-center">
                                    <a href="https://www.youtube.com/@MouvementECHOFrance" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-neutral-500 hover:text-[#D4AF37] transition-colors duration-300">
                                        <Youtube size={20} />
                                        <span className="text-xs tracking-wide">Notre chaîne YouTube</span>
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
                    <h2 className="text-[48px] font-serif font-bold text-white mb-6 text-center">Les Saisons</h2>
                    <p className="text-center text-sm sm:text-base text-echo-textMuted max-w-2xl mx-auto mb-16">
                        En fonction de la levée de fonds, la première saison est prévue idéalement fin 2026, avec un objectif de diffusion avant avril 2027.
                    </p>

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
                                <span className="font-serif text-sm font-bold">Diagnostic des crises</span>
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
                                <span className="font-serif text-sm font-bold">Solutions du terrain</span>
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
                                <span className="font-serif text-sm font-bold">Futurs souhaitables</span>
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
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && setSelectedEpisode(ep)}
                                    aria-label={`Voir les thèmes de l'épisode ${index + 1}: ${ep.title}`}
                                    className="group relative h-[200px] bg-[#121212] rounded-xl border border-white/5 p-5 cursor-pointer overflow-hidden transition-all duration-300 hover:border-[#DC143C] hover:shadow-[0_0_30px_rgba(220,20,60,0.1)] hover:-translate-y-2"
                                >
                                    {/* Numéro en haut à droite - GRIS */}
                                    <div className="absolute top-3 right-4">
                                        <span className="text-5xl font-serif font-bold text-white/20">{String(index + 1).padStart(2, '0')}</span>
                                    </div>

                                    {/* Épisode + Titre en haut à gauche */}
                                    <div className="relative z-10">
                                        <span className="text-[#DC143C] text-lg font-bold uppercase tracking-wider">Épisode</span>
                                        <h3 className="text-lg font-serif font-bold text-white mt-1">{ep.title}</h3>
                                    </div>

                                    {/* Vice au centre */}
                                    {ep.vice && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white/20 text-2xl font-serif font-bold italic group-hover:text-white/40 transition-colors">
                                                {ep.vice}
                                            </span>
                                        </div>
                                    )}

                                    {/* Badge "Bientôt disponible" (FR7) */}
                                    <div className="absolute bottom-3 left-3">
                                        <span className="text-[#D4AF37]/70 text-xs font-medium bg-[#D4AF37]/5 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                                            Bientôt disponible
                                        </span>
                                    </div>

                                    {/* Indicateur hover */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        <span className="text-[#D4AF37] text-xs font-bold bg-[#0A0A0A]/80 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                                            Voir les thèmes →
                                        </span>
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

                        {/* SYNOPSIS (FR8) */}
                        <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-[#D1D5DB] leading-relaxed italic">{selectedEpisode.synopsis}</p>
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

                        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
                            {/* OPT-IN BUTTON (FR9) — visible only if authenticated */}
                            {isAuthenticated ? (
                                (() => {
                                    const idx = episodesS1.indexOf(selectedEpisode);
                                    const alreadyOptedIn = isOptedIn(idx);
                                    return alreadyOptedIn ? (
                                        <span className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium">
                                            <BellRing size={16} /> Alerte activée
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleOptIn(idx)}
                                            disabled={optinLoading}
                                            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-50"
                                        >
                                            <Bell size={16} /> M'alerter à la sortie
                                        </button>
                                    );
                                })()
                            ) : (
                                <div />
                            )}
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
                    <h2 className="text-3xl sm:text-4xl md:text-[48px] font-serif font-bold text-white mb-4 text-center">Les Personnages</h2>
                    <p className="text-[#D1D5DB] text-center max-w-2xl mx-auto mb-6 italic font-serif text-sm sm:text-base">"Ils sont le reflet de nos vices, de nos peurs, mais aussi de nos espoirs."</p>
                    <p className="text-[#9CA3AF] text-center max-w-3xl mx-auto mb-10 sm:mb-16 text-xs sm:text-sm leading-relaxed">Cette galerie de portraits n'attend qu'une chose, prendre vie dans la réalité avec de vraies actrices et acteurs, afin de se libérer du monde virtuel pour s'ancrer pleinement dans le monde réel. Vous pouvez nous y aider.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {/* SACHA */}
                        <CharacterCard
                            name="SACHA"
                            role="La Vision"
                            description="Responsable administratif et financier, Sacha est doté d'une forte empathie et d'une capacité à appréhender les dynamiques systémiques. Il porte en lui le poids immense du « syndrome du sauveur ». Sa détermination à éveiller les consciences et à transformer radicalement la société provient de ses prises de conscience sur l'avenir incertain du monde."
                            image="/images/characters/sacha.jpeg"
                        />
                        {/* PHILIPPE */}
                        <CharacterCard
                            name="PHILIPPE"
                            role="Le Prodigue"
                            description="Père de Sacha, Philippe est un homme dont les convictions radicales imprègnent chaque aspect de sa vie. Animé par des préjugés racistes et une mentalité matérialiste poussée à l'extrême, il affiche sans détour un caractère provocateur et agressif. Son autoritarisme et son intolérance sont autant de barrières qui le séparent de son fils."
                            image="/images/characters/philippe.jpeg"
                        />
                        {/* NADINE */}
                        <CharacterCard
                            name="NADINE"
                            role="Les Limbes"
                            description="Mère de Sacha, Nadine est profondément marquée par l'inquiétude et l'anxiété envers son fils. Bien qu'elle agisse toujours avec de bonnes intentions, son anxiété excessive la pousse souvent à étouffer et à entraver l'épanouissement de Sacha, compromettant parfois involontairement son ambition."
                            image="/images/characters/nadine.jpeg"
                        />
                        {/* EVA */}
                        <CharacterCard
                            name="EVA"
                            role="L'Amour"
                            description="Petite amie de Sacha, Eva représente la douceur et l'amour au sein de la vie tumultueuse du héros. Elle est amoureuse, mais se trouve constamment tiraillée entre la quête idéaliste de Sacha et ses propres besoins. Cet équilibre délicat rend leur relation intense et complexe, parfois menacée par l'ampleur de la mission que Sacha s'impose."
                            image="/images/characters/eva.jpeg"
                        />
                        {/* AKOU */}
                        <CharacterCard
                            name="AKOU"
                            role="Le Guide"
                            description="Ami et guide de Sacha, Akou porte en lui une profonde sagesse et une compréhension intuitive du monde. Habité par une quête constante d'équilibre et d'unité, il devient le repère moral essentiel dans le voyage tumultueux de Sacha."
                            image="/images/characters/akou.jpeg"
                        />
                        {/* LILY */}
                        <CharacterCard
                            name="LILY"
                            role="La Rebelle"
                            description="Rencontre inattendue dans le parcours de Sacha, Lily est une femme libre et intuitive portée par une énergie rebelle. Experte en construction durable, elle allie écologie et sensibilité artistique. Habituée à ne compter que sur elle, son indépendance dissimule une blessure, la peur d'ouvrir pleinement son coeur. Par la suite elle deviendra un moteur de transformation pour elle-même et pour ceux qui l'entourent."
                            image="/images/characters/lily.jpeg"
                        />
                        {/* NOUR */}
                        <CharacterCard
                            name="NOUR"
                            role="Le Soutien"
                            description="Femme de ménage au sein de l'entreprise, Nour est animée d'une générosité sincère et chaleureuse. Malgré une vie modeste marquée par l'exil, elle apporte à Sacha un soutien émotionnel précieux, incarnant l'empathie véritable. Toutefois, son dévouement absolu aux autres révèle aussi sa vulnérabilité : celle de négliger sa propre identité et ses propres besoins pour le bonheur des autres."
                            image="/images/characters/nour.jpeg"
                        />

                        {/* COLLÈGUES (VICES) */}
                        <CharacterCard
                            name="MARIANNE"
                            role="Luxure"
                            description="Responsable des Ressources Humaines. Incarne le vice de la luxure. Elle symbolise les dérives de l'industrie du luxe, des médias et de la mode, où l'image est valorisée au détriment de l'authenticité. Son parcours amorce une transformation vers la sobriété, réconciliant l'esthétique avec l'éthique, jusque dans sa manière de communiquer, de s'habiller et de vivre."
                            image="/images/characters/marianne.jpeg"
                        />
                        <CharacterCard
                            name="DOMINIQUE"
                            role="Gourmandise"
                            description="Responsable des services généraux, représente le vice de la gourmandise. Il reflète les problématiques de l'industrie agro-alimentaire ainsi que des excès d'une société consumériste. Figure de la résistance au changement, Dominique entame pourtant une métamorphose. Sa trajectoire est ciblée sur un retour à la terre, une consommation plus saine et respectueuse de l'environnement."
                            image="/images/characters/dominique.jpeg"
                        />
                        <CharacterCard
                            name="SOPHIE"
                            role="Avarice"
                            description="Responsable Marketing & Communication, personnifie le vice de l'avarice. Elle illustre les dérives de l'industrie marketing et publicitaire qui manipule nos esprits et nos comportements. Son évolution s'engage vers une approche centrée sur le sens, la transparence et intégrité."
                            image="/images/characters/sophie.jpeg"
                        />
                        <CharacterCard
                            name="ALEXANDRE"
                            role="Colère"
                            description="Responsable Achat & Ventes des composants chimiques médicaux, Incarne le vice de la colère. Il représente les abus de l'industrie pharmaceutique. Son cheminement l'amène à un apaisement progressif fondé sur l'utilisation des médecines douces et le sport pour redonner une place prépondérante à sa santé physique et mentale."
                            image="/images/characters/alexandre.jpeg"
                        />
                        <CharacterCard
                            name="SARA"
                            role="Hérésie"
                            description="Responsable Recherche & Développement, symbolise le vice de l'hérésie. Elle incarne les excès des industries de la tech et en particulier de l'intelligence artificielle, où le culte du progrès technique s'impose au détriment des limites planétaires. Son parcours la conduit à s'intéresser aux ponts entre la science et la spiritualité afin de répondre aux défis contemporains."
                            image="/images/characters/sara.jpeg"
                        />
                        <CharacterCard
                            name="ROHAN"
                            role="Violence"
                            description="Responsable Logistique, Rohan incarne le vice de la violence. Il reflète la violence à tous les niveaux (conjugale, l'armée, la géopolitique). Son parcours amorce une métamorphose, ouvrant un chemin vers l'écoute, l'empathie et la réconciliation familiale. Le sport sera son vecteur d'apaisement, d'émancipation et de rassemblement."
                            image="/images/characters/rohan.jpeg"
                        />
                        <CharacterCard
                            name="AYUMI"
                            role="Fraude"
                            description="Responsable Juridique spécialisée en droit des affaires et en homologation des médicaments, illustre le vice de la fraude. Elle évoque l'opacité du système juridique institutionnel, le lobbying et les systèmes normatifs. Son évolution sera marquée par la mise en place d'une justice socialement juste et respectueuse du vivant."
                            image="/images/characters/ayumi.jpeg"
                        />
                        <CharacterCard
                            name="MATHIEU"
                            role="Trahison"
                            description="Directeur général, incarne le vice de la trahison. Il représente les intérêts privés, l'influence du pouvoir politique, du lobbying et du patronat. Sa réputation l'importe plus que tout. Ses mécanismes de domination, fondée sur le contrôle et la peur, se retourneront à terme contre lui."
                            image="/images/characters/mathieu.jpeg"
                        />
                    </div>

                    <p className="text-[#9CA3AF] text-center text-xs sm:text-sm mt-8 sm:mt-12 max-w-3xl mx-auto italic">
                        * Les images des personnages ont été générées par intelligence artificielle à des fins de présentation de la série et de ses personnages, et pour illustrer la bande-annonce. Nous recherchons activement de véritables acteurs et actrices pour incarner ces rôles.
                    </p>
                </div>
            </section>

            {/* SECTION RECRUTEMENT — Participez à la création */}
            <section id="rejoindre-serie" className="py-24 px-4 container mx-auto">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#1A1A1A] border border-[#D4AF37]/20 p-6 sm:p-8 md:p-12 lg:p-16">
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white text-center mb-3">
                            La série ECHO se construit <span className="text-[#D4AF37]">avec vous</span>
                        </h2>
                        <p className="text-[#9CA3AF] text-center max-w-2xl mx-auto mb-10 sm:mb-14 text-sm sm:text-base">
                            Deux façons de participer à cette aventure collective.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            {/* Carte Scénariste */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 flex flex-col">
                                <span className="text-xs font-mono text-[#D4AF37]/60 tracking-widest uppercase mb-3">Écriture</span>
                                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-4">Devenez scénariste</h3>
                                <p className="text-[#D1D5DB] text-base sm:text-lg leading-relaxed mb-6 flex-1 font-serif italic">
                                    Les scénarios sont en cours d'écriture. Vous avez une plume et des convictions ?
                                    Rejoignez l'équipe de création et participez à l'écriture des épisodes.
                                </p>
                                <Button
                                    className="bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#FFD700] hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] px-6 py-3 text-sm font-bold tracking-widest uppercase rounded-lg transition-all w-full sm:w-auto"
                                    onClick={() => { trackEvent('cta_click', 'serie_candidature_scenariste'); setShowScenaristForm(true); }}
                                >
                                    Rejoindre l'aventure
                                </Button>
                            </div>

                            {/* Carte Étudiants / Production */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 flex flex-col">
                                <span className="text-xs font-mono text-[#D4AF37]/60 tracking-widest uppercase mb-3">Production</span>
                                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-4">Étudiants &amp; stagiaires</h3>
                                <p className="text-[#D1D5DB] text-sm sm:text-base leading-relaxed mb-5 flex-1">
                                    Participez à la production de la série dans votre ville.
                                </p>

                                {/* Ville teaser réalisé */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                                        Nantes — teaser réalisé ✓
                                    </span>
                                    {["Lyon", "Lille", "Bordeaux"].map(city => (
                                        <span key={city} className="px-3 py-1 rounded-full text-xs font-medium bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                                            {city} — teaser à produire
                                        </span>
                                    ))}
                                </div>

                                {/* Autres villes */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {["Rambouillet", "Paris", "Toulouse", "Rouen", "Marseille", "Brest", "Strasbourg"].map(city => (
                                        <span key={city} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-[#9CA3AF] border border-white/10">
                                            {city}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[#9CA3AF] text-xs mb-5 italic">
                                    Production d'épisodes en partenariat avec les écoles locales.
                                </p>

                                <button
                                    className="bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#FFD700] hover:shadow-[0_0_24px_rgba(212,175,55,0.6)] px-6 py-3 text-sm font-bold tracking-widest uppercase rounded-lg transition-all w-full sm:w-auto"
                                    onClick={() => setShowStudentForm(true)}
                                >
                                    Postuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MODALE CANDIDATURE SCÉNARISTE */}
            {showScenaristForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowScenaristForm(false)}>
                    <div
                        className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif text-white">Candidature Scénariste</h2>
                            <button onClick={() => setShowScenaristForm(false)} className="p-1 text-[#D1D5DB] hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <ScenaristApplicationForm />
                    </div>
                </div>
            )}

            {/* MODALE CANDIDATURE STAGE PRODUCTION */}
            {showStudentForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowStudentForm(false)}>
                    <div
                        className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif text-white">Candidature Stage Production</h2>
                            <button onClick={() => setShowStudentForm(false)} className="p-1 text-[#D1D5DB] hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <StudentApplicationForm />
                    </div>
                </div>
            )}
        </div>
    );
}

function CharacterCard({ name, role, description, image }: { name: string, role: string, description: string, image: string }) {
    const [showDesc, setShowDesc] = useState(false);

    return (
        <div
            className="group relative rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/5 transition-all duration-500 hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] cursor-pointer"
            onClick={() => setShowDesc(!showDesc)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowDesc(!showDesc); }}
            aria-expanded={showDesc}
        >
            {/* Image */}
            <div className="aspect-[3/4] relative overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${showDesc ? 'scale-110' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />

                {/* Text Overlay (Default Visible) */}
                <div className={`absolute bottom-0 left-0 w-full p-4 sm:p-6 transform transition-transform duration-500 group-hover:-translate-y-2 ${showDesc ? '-translate-y-2' : ''}`}>
                    <h3 className="text-lg sm:text-2xl font-serif font-bold text-white mb-1">{name}</h3>
                    <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest">{role}</p>
                </div>

                {/* Description Overlay (Hover + Tap) */}
                <div className={`absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-sm p-4 sm:p-8 flex flex-col justify-center transition-opacity duration-300 group-hover:opacity-100 ${showDesc ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37] mb-2">{name}</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 sm:mb-6">{role}</p>
                    <p className="text-[#D1D5DB] leading-relaxed text-xs sm:text-sm">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
