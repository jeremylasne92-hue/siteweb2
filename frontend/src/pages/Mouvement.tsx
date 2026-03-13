import { Sprout, TreePine, TreeDeciduous, Network, Flower2, Apple, Play, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/seo/SEO';

export function Mouvement() {
    return (
        <div className="bg-stone-950 text-stone-200 font-sans selection:bg-amber-500/30">
            <SEO
                title="Le Mouvement"
                description="Nous ne cherchons pas à réparer le vieux monde, mais à en faire pousser un nouveau. Rejoignez notre action citoyenne."
                url="https://mouvement-echo.fr/mouvement"
            />
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

                <div className="relative z-20 text-center max-w-4xl px-4 sm:px-6">
                    <img src="/logo-mouvement.png" alt="Mouvement ECHO" className="h-20 sm:h-28 md:h-44 w-auto object-contain mx-auto mb-4" />

                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 tracking-tight animate-fade-in-up delay-100">
                        Mouvement ECHO
                    </h1>

                    <h2 className="text-2xl md:text-3xl text-amber-500 font-light mb-8 italic animate-fade-in-up delay-200">
                        "Comme un Arbre qui Grandit"
                    </h2>

                    <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                        Sept étapes pour comprendre l'essence de notre mouvement, de la graine à la fructification.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-amber-500 to-transparent" />
                </div>
            </section>


            {/* --- Les 7 Étapes du Mouvement (Timeline) --- */}
            <section className="relative py-20 sm:py-28 overflow-hidden">
                {/* Vertical Connecting Line (The Trunk) */}
                <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2">
                    <div className="w-full h-full bg-gradient-to-b from-amber-900/40 via-amber-500/30 to-emerald-600/20" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="space-y-24 sm:space-y-32">
                        {/* 1. La Graine */}
                        <TimelineItem side="left" icon={CircleDot} step="01" title="La Graine" subtitle="Notre Origine">
                            <p>
                                Tout commence par une graine, une question : <em className="text-amber-400/80">Quel monde je souhaite laisser aux futures générations ?</em> À l'intérieur de cette graine réside l'essence de notre potentiel, de toute notre volonté : celle d'agir pour défendre et préserver le vivant.
                            </p>
                            <p>
                                Le Mouvement ECHO est né de ce désir de partager des constats, une réflexion et des solutions face aux crises de notre époque et de faire de la fiction un levier de transformation sociale et sociétale. C'est l'étincelle originelle, celle qui porte déjà en elle le germe d'une belle aventure humaine.
                            </p>
                        </TimelineItem>

                        {/* 2. La Germination */}
                        <TimelineItem side="right" icon={Sprout} step="02" title="La Germination" subtitle="Notre Raison d'Être">
                            <p>
                                Sous la surface, l'invisible se met en mouvement. La graine craque, l'énergie de vie latente jaillit et traverse l'obscurité pour retrouver la lumière. C'est le passage de l'idée à l'action, porté par <em className="text-amber-400/80">l'amour qui meut le ciel et les étoiles</em>.
                            </p>
                            <p>
                                Face à une époque paralysée par l'anxiété, notre raison d'être est d'incarner cette poussée vitale. Nous voulons raviver la flamme, tisser des liens entre acteurs du changement, faire reconnaître notre interdépendance et prouver qu'ensemble, nous avons le pouvoir de faire grandir un nouvel arbre sous lequel se reposer.
                            </p>
                        </TimelineItem>

                        {/* 3. L'Enracinement */}
                        <TimelineItem side="left" icon={TreePine} step="03" title="L'Enracinement" subtitle="Notre Mission">
                            <p>
                                Dans la forêt, aucun arbre ne grandit seul. Ses racines communiquent, échangent et s'entraident grâce à un vaste réseau souterrain symbiotique. Notre mission s'inspire directement de cette intelligence collective.
                            </p>
                            <p>
                                Nous œuvrons pour relier les forces vives de la société. En ouvrant les esprits par la culture et en connectant les pionniers du changement avec les citoyens en quête de sens, nous créons un véritable écosystème solidaire. C'est de cette interconnexion profonde que naîtra notre capacité d'agir à grande échelle.
                            </p>
                        </TimelineItem>

                        {/* 4. L'Émergence */}
                        <TimelineItem side="right" icon={TreeDeciduous} step="04" title="L'Émergence" subtitle="Notre Ambition">
                            <p>
                                Portée par ses racines, la jeune pousse perce le sol pour former un axe central capable de soutenir tout un écosystème. Ce tronc inébranlable, c'est l'association Mouvement ECHO.
                            </p>
                            <p>
                                Notre ambition suit une logique de croissance pérenne : élargir nos anneaux année après année pour bâtir une alliance robuste. En devenant le pilier d'un nouveau récit sociétal et en traçant une voie inédite entre spectateurs et acteurs engagés, nous voulons prouver qu'une société basée sur la coopération et le respect du vivant est non seulement possible, mais absolument nécessaire.
                            </p>
                        </TimelineItem>

                        {/* 5. Les Branches */}
                        <TimelineItem side="left" icon={Network} step="05" title="Les Branches" subtitle="L'Écosystème en Action">
                            <p>
                                L'arbre ne conserve pas sa sève pour lui-même : il la distribue jusqu'à l'extrémité de son feuillage. Ces ramifications sont les projets qui découlent de notre Mouvement et prennent vie grâce à ECHOLink.
                            </p>
                            <p>
                                De la plateforme numérique à la réalité du terrain, chaque nouvelle pousse représente une action utile au bien commun propulsée par nos partenaires de l'ECHOSystem. En rejoignant ou en créant une initiative locale, vous devenez cette extension vitale. Déployé dans toutes les directions, ce réseau solidaire offre un espace d'engagement et des solutions tangibles.
                            </p>
                        </TimelineItem>

                        {/* 6. La Floraison */}
                        <TimelineItem side="right" icon={Flower2} step="06" title="La Floraison" subtitle="L'Attraction du Vivant">
                            <p>
                                Un arbre en fleurs déploie ses couleurs pour attirer la vie. Avec cette même intention, notre websérie met en lumière la diversité de notre écosystème. Le Mouvement ECHO utilise la puissance de la fiction pour sublimer le travail des acteurs de terrain.
                            </p>
                            <p>
                                Face à l'attrait de ces solutions concrètes, l'audience se métamorphose. Le spectateur, touché par une thématique spécifique, est invité à s'engager dans l'initiative correspondante. Cette pollinisation vitale entre l'œuvre et le public permet à tous nos projets de s'épanouir pleinement.
                            </p>
                        </TimelineItem>

                        {/* 7. La Fructification */}
                        <TimelineItem side="left" icon={Apple} step="07" title="La Fructification" subtitle="Notre Impact">
                            <p>
                                L'aboutissement de l'arbre n'est pas la beauté de la fleur, c'est l'utilité du fruit. La fructification incarne notre but ultime, à savoir <em className="text-amber-400/80">la régénération du vivant</em>.
                            </p>
                            <p>
                                Toutes les actions menées sur le terrain produisent des résultats concrets pour réparer notre tissu social. Ces fruits nourrissent le bien commun et protègent de nouvelles graines. Chaque citoyen éveillé par notre mouvement porte en lui la capacité de planter les initiatives de demain. Le cycle s'accomplit et laisse place à une forêt foisonnante d'acteurs engagés.
                            </p>
                        </TimelineItem>
                    </div>
                </div>
            </section>


            {/* --- Équipe --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Équipe ECHO</h2>
                    <p className="text-amber-500 text-lg mb-16">Une dizaine de membres actifs portés par la même sève.</p>

                    {/* Main Team */}
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16">
                        {[
                            { name: "Jérémy Lasne", role: "Cofondateur", photo: "/images/Photo équipe/jeremy-lasne.jpg" },
                            { name: "Eddyason Koffi", role: "Cofondateur", photo: "/images/Photo équipe/eddyason-koffi.jpg" },
                            { name: "Déborah Prévaud", role: "Responsable des partenariats", photo: "/images/Photo équipe/deborah-prevaud.jpg" },
                            { name: "Clément Grandmontagne", role: "Réalisateur", photo: "/images/Photo équipe/clement-grandmontagne.jpg" },
                            { name: "Thierry Korutos-Chatam", role: "Responsable des partenariats", photo: "/images/Photo équipe/thierry-korutos-chatam.jpg" },
                        ].map((member, i) => (
                            <div key={i} className="flex flex-col items-center group w-28 sm:w-32 md:w-36">
                                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-stone-800 group-hover:border-amber-500 transition-colors mb-3 sm:mb-4">
                                    <img
                                        src={member.photo}
                                        alt={member.name}
                                        className="w-full h-full object-cover object-top"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = 'none';
                                            target.parentElement!.classList.add('bg-stone-800', 'flex', 'items-center', 'justify-center');
                                            target.parentElement!.innerHTML = '<span class="text-stone-600 text-2xl font-bold">' + member.name.split(' ').map(n => n[0]).join('') + '</span>';
                                        }}
                                    />
                                </div>
                                <h3 className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight">{member.name}</h3>
                                <p className="text-stone-500 text-xs sm:text-sm leading-tight mt-1">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* --- CTA --- */}
            <section className="py-24 px-4 container mx-auto">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-amber-500/20 p-6 sm:p-8 md:p-12 lg:p-20 text-center">
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
                            Ne Soyez Pas Spectateur. <br />
                            <span className="text-amber-500">Écrivez l'Histoire avec Nous.</span>
                        </h2>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link to="/register">
                                <Button variant="primary" size="lg" className="rounded-full px-8 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-900/20">
                                    Rejoindre le Mouvement
                                </Button>
                            </Link>
                            <Link to="/serie">
                                <Button variant="outline" size="lg" className="rounded-full px-8 py-3 h-auto text-base border-stone-600 text-stone-300 hover:text-white hover:border-white hover:bg-white/5">
                                    <Play className="w-4 h-4 mr-2" /> Découvrir la Série
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}


// --- Subcomponents ---

interface TimelineItemProps {
    side: string;
    icon: React.ElementType;
    step: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

function TimelineItem({ side, icon: Icon, step, title, subtitle, children }: TimelineItemProps) {
    const isLeft = side === 'left';

    return (
        <div className={`flex flex-col md:flex-row items-start gap-6 sm:gap-8 md:gap-16 ${isLeft ? '' : 'md:flex-row-reverse'}`}>

            {/* Content */}
            <div className={`flex-1 pl-12 md:pl-0 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                <div className={`flex items-center gap-3 mb-3 md:mb-4 flex-wrap ${isLeft ? 'md:justify-end' : ''}`}>
                    <span className="text-xs font-mono text-amber-600/60 tracking-widest">{step}</span>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider">
                        {subtitle}
                    </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">{title}</h3>
                <div className="text-stone-400 space-y-4 leading-relaxed text-sm sm:text-base">
                    {children}
                </div>
            </div>

            {/* Icon/Node on the Line */}
            <div className="absolute left-[8px] md:relative md:left-auto shrink-0 w-[25px] h-[25px] md:w-16 md:h-16 rounded-full bg-stone-900 border-2 border-amber-500/50 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(245,158,11,0.15)] mt-1 md:mt-2">
                <Icon className="w-3 h-3 md:w-7 md:h-7 text-amber-500" />
            </div>

            {/* Empty space for the other side */}
            <div className="flex-1 hidden md:block" />
        </div>
    );
}
