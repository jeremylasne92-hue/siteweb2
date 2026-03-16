import { useState } from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/seo/SEO';
import { VolunteerApplicationForm } from '../components/forms/VolunteerApplicationForm';
import { useAnalytics } from '../hooks/useAnalytics';

// Images locales — croissance de l'arbre (7 étapes)
const TREE_STAGES = {
    graine: '/images/Image arbre en croissance/Graine.jpeg',
    germination: '/images/Image arbre en croissance/Germination.jpeg',
    enracinement: '/images/Image arbre en croissance/Enracimennt.jpeg',
    emergence: "/images/Image arbre en croissance/L'émergence ECHO.jpeg",
    tronc: '/images/Image arbre en croissance/Tronc.png',
    branches: '/images/Image arbre en croissance/Branches.png',
    floraison: '/images/Image arbre en croissance/Floraison.jpeg',
    fructification: '/images/Image arbre en croissance/Pommes.jpeg',
};


// --- Subcomponents (defined before Mouvement for HMR compatibility) ---

interface TimelineItemProps {
    side: string;
    image: string;
    imageAlt: string;
    step: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

function TimelineItem({ side, image, imageAlt, step, title, subtitle, children }: TimelineItemProps) {
    const isLeft = side === 'left';

    return (
        <div className={`flex flex-col md:flex-row items-stretch gap-6 sm:gap-8 md:gap-12 pl-12 md:pl-0 ${isLeft ? '' : 'md:flex-row-reverse'}`}>

            {/* Content */}
            <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
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

            {/* Timeline dot (mobile: absolute left, desktop: hidden — line still visible) */}
            <div className="absolute left-[14px] md:hidden w-3 h-3 rounded-full bg-amber-500 border-2 border-stone-950 z-10 mt-2" />

            {/* Image panel */}
            <div className="w-full md:w-[380px] lg:w-[440px] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-amber-900/10">
                <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-48 sm:h-56 md:h-full object-cover"
                    loading="lazy"
                />
            </div>
        </div>
    );
}


// --- Émergence custom section ---

function EmergenceSection() {
    return (
        <div className="flex flex-col items-center text-center pl-12 md:pl-0">
            {/* Timeline dot (mobile) */}
            <div className="absolute left-[14px] md:hidden w-3 h-3 rounded-full bg-amber-500 border-2 border-stone-950 z-10 mt-2" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-3 md:mb-4 flex-wrap justify-center">
                <span className="text-xs font-mono text-amber-600/60 tracking-widest">04</span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider">
                    Notre Ambition
                </span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10">L'Émergence</h3>

            {/* Image 1: Jeune Pousse */}
            <div className="w-full max-w-lg rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-amber-900/10">
                <img
                    src={TREE_STAGES.emergence}
                    alt="Jeune pousse perçant le sol"
                    className="w-full h-56 sm:h-64 md:h-72 object-cover"
                    loading="lazy"
                />
            </div>

            {/* Caption under pousse */}
            <p className="mt-5 sm:mt-6 text-amber-400/90 italic text-base sm:text-lg md:text-xl max-w-xl leading-relaxed font-light">
                "Portée par ses racines, la jeune pousse perce le sol pour former un axe central capable de soutenir tout un écosystème."
            </p>

            {/* Spacer */}
            <div className="py-6 sm:py-8" />

            {/* Central text — ambition (encadré avec accroche) */}
            <div className="max-w-2xl px-4 w-full">
                <div className="relative border-l-4 border-amber-500 bg-white/[0.03] rounded-r-xl pl-6 sm:pl-8 pr-6 py-6 sm:py-8 text-left">
                    {/* Accroche forte */}
                    <p className="text-white font-serif text-xl sm:text-2xl md:text-[1.7rem] leading-snug mb-5 font-semibold tracking-tight">
                        Prouver qu'une société basée sur la <span className="text-amber-500">coopération</span> et le <span className="text-amber-500">respect du vivant</span> est non seulement possible, mais <em className="not-italic text-amber-400">absolument nécessaire</em>.
                    </p>
                    {/* Développement */}
                    <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
                        Notre ambition suit une logique de <span className="text-stone-300 font-medium">croissance pérenne</span> : élargir nos anneaux mois après mois, bâtir une <span className="text-stone-300 font-medium">alliance robuste</span>. Devenir le pilier d'un <span className="text-stone-300 font-medium">nouveau récit sociétal</span> et d'un <span className="text-stone-300 font-medium">nouveau contrat social</span>. Proposer une voie inédite entre spectateurs et acteurs engagés.
                    </p>
                </div>
            </div>

            {/* Spacer */}
            <div className="py-6 sm:py-8" />

            {/* Image 2: Le Tronc */}
            <div className="w-full max-w-lg rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-emerald-900/10">
                <img
                    src={TREE_STAGES.tronc}
                    alt="Tronc massif d'arbre enraciné"
                    className="w-full h-56 sm:h-64 md:h-72 object-cover"
                    loading="lazy"
                />
            </div>

            {/* Caption under tronc */}
            <p className="mt-5 sm:mt-6 text-white font-bold text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
                Ce tronc inébranlable, c'est l'association{' '}
                <span className="text-amber-500">Mouvement ECHO</span>.
            </p>
        </div>
    );
}


// --- Main Component ---

export function Mouvement() {
    const [showVolunteerForm, setShowVolunteerForm] = useState(false);
    const { trackEvent } = useAnalytics();

    return (
        <div className="bg-stone-950 text-stone-200 font-sans selection:bg-amber-500/30">
            <SEO
                title="Le Mouvement"
                description="Le Mouvement ECHO : 7 étapes pour passer de la conscience à l'action. Rejoignez une communauté citoyenne engagée."
                url="https://mouvementecho.fr/mouvement"
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
            <section id="etapes" className="relative py-20 sm:py-28 overflow-hidden">
                {/* Vertical Connecting Line (The Trunk) */}
                <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2">
                    <div className="w-full h-full bg-gradient-to-b from-amber-900/40 via-amber-500/30 to-emerald-600/20" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="space-y-24 sm:space-y-32">
                        {/* 1. La Graine */}
                        <TimelineItem side="left" image={TREE_STAGES.graine} imageAlt="Graine de pommier dans la terre" step="01" title="La Graine" subtitle="Notre Origine">
                            <p>
                                Tout commence par une graine, une question : <em className="text-amber-400/80">Quel monde je souhaite laisser aux futures générations ?</em> À l'intérieur de cette graine réside l'essence de notre potentiel, de toute notre volonté : celle d'agir pour défendre et préserver le vivant.
                            </p>
                            <p>
                                Le Mouvement ECHO est né de ce désir de partager des constats, une réflexion et des solutions face aux crises de notre époque et de faire de la fiction un levier de transformation sociale et sociétale. C'est l'étincelle originelle, celle qui porte déjà en elle le germe d'une belle aventure humaine.
                            </p>
                        </TimelineItem>

                        {/* 2. La Germination */}
                        <TimelineItem side="right" image={TREE_STAGES.germination} imageAlt="Jeune pousse perçant le sol" step="02" title="La Germination" subtitle="Notre Raison d'Être">
                            <p>
                                Sous la surface, l'invisible se met en mouvement. La graine craque, l'énergie de vie latente jaillit et traverse l'obscurité pour retrouver la lumière. C'est le passage de l'idée à l'action, porté par <em className="text-amber-400/80">l'amour qui meut le ciel et les étoiles</em>.
                            </p>
                            <p>
                                Face à une époque paralysée par l'anxiété, notre raison d'être est d'incarner cette poussée vitale. Nous voulons raviver la flamme, tisser des liens entre acteurs du changement, faire reconnaître notre interdépendance et prouver qu'ensemble, nous avons le pouvoir de faire grandir un nouvel arbre sous lequel se reposer.
                            </p>
                        </TimelineItem>

                        {/* 3. L'Enracinement */}
                        <TimelineItem side="left" image={TREE_STAGES.enracinement} imageAlt="Jeunes plants enracinés dans le sol" step="03" title="L'Enracinement" subtitle="Notre Mission">
                            <p>
                                Dans la forêt, aucun arbre ne grandit seul. Ses racines communiquent, échangent et s'entraident grâce à un vaste réseau souterrain symbiotique. Notre mission s'inspire directement de cette intelligence collective.
                            </p>
                            <p>
                                Nous œuvrons pour relier les forces vives de la société. En ouvrant les esprits par la culture et en connectant les pionniers du changement avec les citoyens en quête de sens, nous créons un véritable écosystème solidaire. C'est de cette interconnexion profonde que naîtra notre capacité d'agir à grande échelle.
                            </p>
                        </TimelineItem>

                        {/* 4. L'Émergence — Layout unique vertical */}
                        <EmergenceSection />

                        {/* 5. Les Branches */}
                        <TimelineItem side="left" image={TREE_STAGES.branches} imageAlt="Canopée d'arbre et branches vers la lumière" step="05" title="Les Branches" subtitle="L'Écosystème en Action">
                            <p>
                                L'arbre ne conserve pas sa sève pour lui-même : il la distribue jusqu'à l'extrémité de son feuillage. Ces ramifications sont les projets qui découlent de notre Mouvement et prennent vie grâce à ECHOLink.
                            </p>
                            <p>
                                De la plateforme numérique à la réalité du terrain, chaque nouvelle pousse représente une action utile au bien commun propulsée par nos partenaires de l'ECHOSystem. En rejoignant ou en créant une initiative locale, vous devenez cette extension vitale. Déployé dans toutes les directions, ce réseau solidaire offre un espace d'engagement et des solutions tangibles.
                            </p>
                        </TimelineItem>

                        {/* 6. La Floraison */}
                        <TimelineItem side="right" image={TREE_STAGES.floraison} imageAlt="Fleurs de pommier en pleine floraison" step="06" title="La Floraison" subtitle="L'Attraction du Vivant">
                            <p>
                                Un arbre en fleurs déploie ses couleurs pour attirer la vie. Avec cette même intention, notre websérie met en lumière la diversité de notre écosystème. Le Mouvement ECHO utilise la puissance de la fiction pour sublimer le travail des acteurs de terrain.
                            </p>
                            <p>
                                Face à l'attrait de ces solutions concrètes, l'audience se métamorphose. Le spectateur, touché par une thématique spécifique, est invité à s'engager dans l'initiative correspondante. Cette pollinisation vitale entre l'œuvre et le public permet à tous nos projets de s'épanouir pleinement.
                            </p>
                        </TimelineItem>

                        {/* 7. La Fructification */}
                        <TimelineItem side="left" image={TREE_STAGES.fructification} imageAlt="Pommes rouges mûres sur la branche" step="07" title="La Fructification" subtitle="Notre Impact">
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


            {/* --- Le Plan en 3 Phases --- */}
            <section id="plan" className="py-24 sm:py-32 relative overflow-hidden">
                {/* Transition intro */}
                <div className="container mx-auto px-4 text-center mb-16 sm:mb-20">
                    <span className="text-sm font-mono text-amber-600/60 tracking-widest block mb-4">LE PLAN</span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
                        Trois Phases, <span className="text-amber-500">Une Vision</span>
                    </h2>
                    <p className="text-stone-400 max-w-3xl mx-auto leading-relaxed text-base sm:text-lg">
                        Notre vision suit une progression en trois phases, chacune portée par une saison de la série ECHO.
                    </p>
                </div>

                {/* 3 Phase Cards */}
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                        {/* Phase 1 — L'Éveil */}
                        <div className="group rounded-2xl border border-red-900/30 bg-gradient-to-b from-red-950/20 to-stone-950 p-6 sm:p-8 hover:border-red-800/50 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-10 h-10 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center font-bold text-sm">1</span>
                                <div>
                                    <span className="text-xs text-red-400/70 font-mono tracking-wider block">PHASE 1</span>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white">L'Éveil</h3>
                                </div>
                            </div>

                            <p className="text-xs text-red-400/60 font-mono mb-4 leading-relaxed">
                                <span className="text-red-400 font-bold">E</span>levating <span className="text-red-400 font-bold">C</span>onsciousness, <span className="text-red-400 font-bold">H</span>ope, and <span className="text-red-400 font-bold">O</span>neness
                            </p>

                            <p className="text-stone-400 text-sm leading-relaxed mb-4">
                                <strong className="text-stone-300">Objectif :</strong> Redonner confiance aux individus en affirmant notre capacité collective à réfléchir au-delà des normes imposées par le système.
                            </p>

                            <details className="group/details">
                                <summary className="cursor-pointer text-amber-500 text-sm font-medium hover:text-amber-400 transition-colors flex items-center gap-1.5 select-none">
                                    <span className="group-open/details:rotate-90 transition-transform text-xs">▶</span>
                                    Saison 1 — L'Enfer
                                </summary>
                                <div className="mt-4 pt-4 border-t border-red-900/20 space-y-4 text-sm text-stone-400 leading-relaxed">
                                    <p>
                                        Cette première saison décrypte les vices individuels et les vicissitudes institutionnelles qui minent notre société. Elle interroge la morale et l'éthique de nos institutions, notre rapport à la nature et à autrui, tout en abordant des questions existentielles sous différents prismes : philosophie, psychologie, cosmogonies…
                                    </p>
                                    <div>
                                        <p className="text-stone-300 font-medium mb-2">Actions du Mouvement ECHO :</p>
                                        <ul className="space-y-2">
                                            <li className="flex gap-2"><span className="text-red-400/60 shrink-0">•</span> Constituer l'ECHOSystem, un réseau de partenaires éthiques et solidaires engagé dans cette transformation.</li>
                                            <li className="flex gap-2"><span className="text-red-400/60 shrink-0">•</span> Sensibiliser et éduquer par des ateliers, des énigmes et les ressources référencées sur le site web.</li>
                                            <li className="flex gap-2"><span className="text-red-400/60 shrink-0">•</span> Créer et proposer les plateformes numériques CogniSphère et ECHOLink pour mettre en lien les spectateurs et l'ECHOSystem.</li>
                                        </ul>
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Phase 2 — Le Changement */}
                        <div className="group rounded-2xl border border-amber-900/30 bg-gradient-to-b from-amber-950/20 to-stone-950 p-6 sm:p-8 hover:border-amber-800/50 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-10 h-10 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center font-bold text-sm">2</span>
                                <div>
                                    <span className="text-xs text-amber-400/70 font-mono tracking-wider block">PHASE 2</span>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white">Le Changement</h3>
                                </div>
                            </div>

                            <p className="text-xs text-amber-400/60 font-mono mb-4 leading-relaxed">
                                <span className="text-amber-400 font-bold">E</span>mpowering <span className="text-amber-400 font-bold">C</span>hange and <span className="text-amber-400 font-bold">H</span>armony for <span className="text-amber-400 font-bold">O</span>ur Planet
                            </p>

                            <p className="text-stone-400 text-sm leading-relaxed mb-4">
                                <strong className="text-stone-300">Objectifs :</strong> Proposer des pistes d'action aux individus. Réconcilier, mobiliser et unir les communautés afin d'agir concrètement pour un changement positif.
                            </p>

                            <details className="group/details">
                                <summary className="cursor-pointer text-amber-500 text-sm font-medium hover:text-amber-400 transition-colors flex items-center gap-1.5 select-none">
                                    <span className="group-open/details:rotate-90 transition-transform text-xs">▶</span>
                                    Saison 2 — Le Purgatoire
                                </summary>
                                <div className="mt-4 pt-4 border-t border-amber-900/20 space-y-4 text-sm text-stone-400 leading-relaxed">
                                    <p>
                                        Durant cette saison, nous partagerons des solutions tangibles aux dysfonctionnements exposés à la saison 1, en analysant et en respectant les besoins de l'ensemble des classes sociales et des métiers indispensables à l'édification d'une société socialement juste et économiquement viable.
                                    </p>
                                    <div>
                                        <p className="text-stone-300 font-medium mb-2">Actions du Mouvement ECHO :</p>
                                        <ul className="space-y-2">
                                            <li className="flex gap-2"><span className="text-amber-400/60 shrink-0">•</span> Développer les services de la plateforme ECHOLink, invitant chaque spectateur à devenir acteur du changement.</li>
                                            <li className="flex gap-2"><span className="text-amber-400/60 shrink-0">•</span> Simplifier la mise en relation entre les individus et l'ECHOSystem afin de les accompagner et les aider à financer leurs initiatives.</li>
                                        </ul>
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Phase 3 — La Régénération */}
                        <div className="group rounded-2xl border border-emerald-900/30 bg-gradient-to-b from-emerald-950/20 to-stone-950 p-6 sm:p-8 hover:border-emerald-800/50 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center font-bold text-sm">3</span>
                                <div>
                                    <span className="text-xs text-emerald-400/70 font-mono tracking-wider block">PHASE 3</span>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white">La Régénération</h3>
                                </div>
                            </div>

                            <p className="text-xs text-emerald-400/60 font-mono mb-4 leading-relaxed">
                                <span className="text-emerald-400 font-bold">E</span>arth's <span className="text-emerald-400 font-bold">C</span>onservation and <span className="text-emerald-400 font-bold">H</span>ealing <span className="text-emerald-400 font-bold">O</span>rganization
                            </p>

                            <p className="text-stone-400 text-sm leading-relaxed mb-4">
                                <strong className="text-stone-300">Objectif :</strong> Préserver les ressources naturelles, restaurer les écosystèmes afin de réparer les dommages engendrés par l'activité humaine.
                            </p>

                            <details className="group/details">
                                <summary className="cursor-pointer text-amber-500 text-sm font-medium hover:text-amber-400 transition-colors flex items-center gap-1.5 select-none">
                                    <span className="group-open/details:rotate-90 transition-transform text-xs">▶</span>
                                    Saison 3 — Le Paradis
                                </summary>
                                <div className="mt-4 pt-4 border-t border-emerald-900/20 space-y-4 text-sm text-stone-400 leading-relaxed">
                                    <p>
                                        Dans cette ultime saison, nous offrons une vision idéale d'une société réformée où l'unité entre les individus, la nature et les institutions est pleinement retrouvée. Solidarité et harmonie constituent les fondements de cette nouvelle réalité.
                                    </p>
                                    <div>
                                        <p className="text-stone-300 font-medium mb-2">Actions du Mouvement ECHO :</p>
                                        <ul className="space-y-2">
                                            <li className="flex gap-2"><span className="text-emerald-400/60 shrink-0">•</span> Mettre en œuvre des projets de préservation et de restauration des milieux naturels.</li>
                                            <li className="flex gap-2"><span className="text-emerald-400/60 shrink-0">•</span> Encourager et organiser des actions participatives, en invitant des spectateurs sélectionnés à co-créer les scénarios des épisodes.</li>
                                        </ul>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>

                    {/* Conclusion */}
                    <div className="mt-12 sm:mt-16 text-center max-w-3xl mx-auto">
                        <p className="text-stone-300 text-base sm:text-lg leading-relaxed italic">
                            ECHO ne se limite pas à une série : c'est un écosystème collaboratif où chacun peut s'informer, s'engager et proposer des solutions pour bâtir un avenir meilleur. Nous croyons profondément qu'il est possible de repenser et de reconstruire nos structures économiques et sociales, en misant sur la <span className="text-amber-400 font-medium not-italic">créativité</span> et l'<span className="text-amber-400 font-medium not-italic">intelligence collective</span>.
                        </p>
                    </div>
                </div>
            </section>


            {/* --- Équipe --- */}
            <section id="equipe" className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Équipe ECHO</h2>
                    <p className="text-amber-500 text-lg mb-16">Une dizaine de membres actifs portés par la même sève.</p>

                    {/* Main Team */}
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16">
                        {[
                            { name: "Jérémy Lasne", role: "Cofondateur", photo: "/images/Photo équipe/jeremy-lasne 2.png", pos: "50% 20%" },
                            { name: "Eddyason Koffi", role: "Cofondateur", photo: "/images/Photo équipe/eddyason-koffi.jpg", pos: "50% 20%" },
                            { name: "Déborah Prévaud", role: "Responsable des partenariats", photo: "/images/Photo équipe/deborah-prevaud.jpg", pos: "50% 20%" },
                            { name: "Clément Grandmontagne", role: "Réalisateur", photo: "/images/Photo équipe/clement-grandmontagne.jpg", pos: "50% 20%" },
                            { name: "Thierry Korutos-Chatam", role: "Responsable des partenariats", photo: "/images/Photo équipe/thierry-korutos-chatam 2.png", pos: "50% 20%" },
                        ].map((member, i) => (
                            <div key={i} className="flex flex-col items-center group w-28 sm:w-32 md:w-36">
                                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-stone-800 group-hover:border-amber-500 transition-colors mb-3 sm:mb-4">
                                    <img
                                        src={member.photo}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: member.pos }}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = 'none';
                                            const parent = target.parentElement!;
                                            parent.classList.add('bg-stone-800', 'flex', 'items-center', 'justify-center');
                                            const span = document.createElement('span');
                                            span.className = 'text-stone-600 text-2xl font-bold';
                                            span.textContent = member.name.split(' ').map(n => n[0]).join('');
                                            parent.appendChild(span);
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
            <section id="rejoindre" className="py-24 px-4 container mx-auto">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-amber-500/20 p-6 sm:p-8 md:p-12 lg:p-20 text-center">
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
                            Ne Soyez Pas Spectateur. <br />
                            <span className="text-amber-500">Écrivez l'Histoire avec Nous.</span>
                        </h2>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Button
                                variant="primary"
                                size="lg"
                                className="rounded-full px-8 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-900/20"
                                onClick={() => { trackEvent('cta_click', 'mouvement_rejoindre'); setShowVolunteerForm(true); }}
                            >
                                Rejoindre le Mouvement
                            </Button>
                            <Link to="/serie">
                                <Button variant="outline" size="lg" className="rounded-full px-8 py-3 h-auto text-base border-stone-600 text-stone-300 hover:text-white hover:border-white hover:bg-white/5">
                                    <Play className="w-4 h-4 mr-2" /> Découvrir la Série
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {showVolunteerForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                     onClick={(e) => e.target === e.currentTarget && setShowVolunteerForm(false)}>
                    <div className="relative bg-stone-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowVolunteerForm(false)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-white text-xl z-10"
                        >
                            ✕
                        </button>
                        <VolunteerApplicationForm />
                    </div>
                </div>
            )}
        </div>
    );
}
