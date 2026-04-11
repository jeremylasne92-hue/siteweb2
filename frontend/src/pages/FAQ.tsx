import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQCategory {
    title: string;
    items: FAQItem[];
}

const faqData: FAQCategory[] = [
    {
        title: "Général",
        items: [
            {
                q: "Qu'est-ce que le Mouvement ECHO ?",
                a: "ECHO est un mouvement citoyen articulé autour d'une websérie fiction inspirée des cercles de l'enfer de La Divine Comédie de Dante. Le projet combine narration immersive, éducation populaire et engagement communautaire pour décrypter les grands défis contemporains : écologie, justice sociale, numérique responsable."
            },
            {
                q: "Faut-il créer un compte pour accéder au contenu ?",
                a: "Non, la majorité du contenu est accessible librement et gratuitement. Créer un compte vous permet cependant de participer aux discussions, sauvegarder vos ressources favorites, rejoindre des événements et accéder aux fonctionnalités communautaires comme CogniSphère et ECHOLink."
            },
            {
                q: "Comment contacter l'équipe ECHO ?",
                a: "Vous pouvez nous écrire via le formulaire de contact sur la page dédiée, ou directement par email à contact@mouvementecho.fr. Nous répondons généralement sous 48h."
            }
        ]
    },
    {
        title: "La Série",
        items: [
            {
                q: "De quoi parle la série ECHO ?",
                a: "ECHO est une websérie fiction qui suit le parcours de personnages confrontés aux grands enjeux de notre époque, en s'inspirant des cercles de l'enfer de La Divine Comédie de Dante. Chaque épisode explore un thème différent — surconsommation, désinformation, précarité énergétique — à travers des récits humains et engagés."
            },
            {
                q: "Combien de saisons sont prévues ?",
                a: "La première saison comprendra plusieurs épisodes centrés sur les cercles de La Divine Comédie adaptés aux enjeux modernes. D'autres saisons sont envisagées selon l'accueil du public et les soutiens obtenus."
            },
            {
                q: "Où pourrai-je regarder la série ?",
                a: "Les épisodes seront disponibles gratuitement sur notre plateforme mouvementecho.fr ainsi que sur notre chaîne YouTube. Aucun abonnement payant n'est requis."
            },
            {
                q: "Quand sort la première saison ?",
                a: "La plateforme ECHO sera lancée le 20 mars 2026. La date de sortie des premiers épisodes sera annoncée sur le site et nos réseaux sociaux. Inscrivez-vous à la newsletter pour être informé(e) en priorité."
            },
            {
                q: "Comment être notifié(e) des nouveaux épisodes ?",
                a: "Inscrivez-vous à notre newsletter depuis la page d'accueil ou créez un compte sur la plateforme. Vous recevrez une notification par email à chaque nouvelle publication."
            }
        ]
    },
    {
        title: "Le Mouvement",
        items: [
            {
                q: "Quelle est la mission du Mouvement ECHO ?",
                a: "Le Mouvement ECHO vise à fédérer une communauté citoyenne engagée autour de la transition écologique et sociale. À travers la série, les ressources éducatives et les événements, nous créons des espaces de réflexion et d'action collective."
            },
            {
                q: "Comment rejoindre le mouvement ?",
                a: "Plusieurs façons de s'engager : créez un compte sur la plateforme, participez aux événements listés dans l'agenda, rejoignez les discussions communautaires, ou soutenez le projet financièrement. Chaque contribution compte, quelle que soit sa forme."
            },
            {
                q: "Y a-t-il des événements physiques ?",
                a: "Oui ! Nous organisons régulièrement des projections, ateliers et rencontres dans différentes villes. Consultez notre page Agenda pour découvrir les prochains événements près de chez vous."
            }
        ]
    },
    {
        title: "CogniSphère",
        items: [
            {
                q: "Qu'est-ce que la CogniSphère ?",
                a: "La CogniSphère est notre espace de ressources éducatives et de réflexion collective. Elle rassemble des articles, fiches pédagogiques, vidéos et contenus interactifs en lien avec les thématiques abordées dans la série."
            },
            {
                q: "Comment fonctionne la CogniSphère ?",
                a: "Les contenus sont organisés par thématique et niveau d'approfondissement. Vous pouvez explorer librement le catalogue, sauvegarder vos ressources favorites (avec un compte), et contribuer aux discussions associées à chaque contenu."
            },
            {
                q: "Puis-je participer au programme bêta ?",
                a: "Oui ! Nous recherchons des bêta-testeurs pour améliorer la plateforme avant le lancement. Rendez-vous sur la page CogniSphère pour soumettre votre candidature via le formulaire dédié."
            },
            {
                q: "Quels types de contenus y trouve-t-on ?",
                a: "Articles de fond, fiches synthétiques, infographies, vidéos explicatives, podcasts et ressources interactives. Tous les contenus sont créés ou sélectionnés par notre équipe éditoriale pour leur qualité et leur pertinence."
            }
        ]
    },
    {
        title: "ECHOLink",
        items: [
            {
                q: "Qu'est-ce qu'ECHOLink ?",
                a: "ECHOLink est notre plateforme de mise en réseau qui connecte les acteurs du changement : associations, collectifs, entrepreneurs sociaux et citoyens engagés. L'objectif est de faciliter les collaborations et de rendre visible l'écosystème des initiatives positives."
            },
            {
                q: "Que sont les hubs de projets ?",
                a: "Les hubs sont des espaces collaboratifs thématiques où les membres peuvent proposer des projets, trouver des collaborateurs et mutualiser des ressources. Chaque hub est centré sur une problématique spécifique (énergie, alimentation, mobilité, etc.)."
            },
            {
                q: "Qu'est-ce que l'économie alternative dans ECHOLink ?",
                a: "ECHOLink intègre un système d'échange de compétences et de services entre membres, basé sur la réciprocité plutôt que sur la transaction monétaire. Ce système encourage l'entraide et valorise les savoir-faire de chacun."
            },
            {
                q: "Quand ECHOLink sera-t-il disponible ?",
                a: "ECHOLink est en cours de développement et sera déployé progressivement après le lancement de la plateforme le 20 mars 2026. Les premières fonctionnalités (carte interactive, profils partenaires) seront disponibles dès le lancement."
            }
        ]
    },
    {
        title: "ECHOSystem — Partenaires",
        items: [
            {
                q: "Comment devenir partenaire ECHO ?",
                a: "Rendez-vous sur la page ECHOSystem et remplissez le formulaire de candidature. Nous étudions chaque demande et revenons vers vous sous une semaine. Nous recherchons des partenaires alignés avec nos valeurs : impact social, transparence et engagement citoyen."
            },
            {
                q: "Quels sont les avantages pour les partenaires ?",
                a: "Les partenaires bénéficient d'une visibilité sur notre carte interactive et notre annuaire, d'un accès aux événements du réseau, de la possibilité de co-créer des contenus éducatifs, et d'un badge partenaire vérifié sur leur profil."
            },
            {
                q: "La carte interactive des partenaires est-elle publique ?",
                a: "Oui, la carte interactive est accessible à tous les visiteurs du site. Elle permet de découvrir les partenaires ECHO près de chez vous et de filtrer par catégorie d'activité."
            }
        ]
    }
];

export function FAQ() {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const filteredData = searchQuery.trim()
        ? faqData.map(category => ({
            ...category,
            items: category.items.filter(
                item =>
                    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.a.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(category => category.items.length > 0)
        : faqData;

    const totalResults = filteredData.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
        <>
            <SEO
                title="FAQ — Questions Fréquentes"
                description="Questions fréquentes sur Mouvement ECHO : association, série fiction, CogniSphère, ECHOLink, financement, équipe."
                url="https://mouvementecho.fr/faq"
                breadcrumbs={[
                    { name: "Accueil", url: "https://mouvementecho.fr/" },
                    { name: "FAQ", url: "https://mouvementecho.fr/faq" }
                ]}
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "@id": "https://mouvementecho.fr/faq",
                        "name": "Questions fréquentes — Mouvement ECHO",
                        "mainEntity": faqData.flatMap(category =>
                            category.items.map(item => ({
                                "@type": "Question",
                                "name": item.q,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": item.a
                                }
                            }))
                        )
                    })}
                </script>
            </Helmet>

            {/* Hero */}
            <section className="relative py-20 bg-echo-darker">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-echo-gold/20 via-black to-black" />
                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-block p-4 rounded-full bg-echo-gold/10 mb-6">
                        <HelpCircle className="w-12 h-12 text-echo-gold" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-white mb-4 sm:mb-6">
                        Questions Fréquentes
                    </h1>
                    <p className="text-xl text-neutral-300 mb-10">
                        Tout ce que vous devez savoir sur ECHO, la série et le mouvement.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Rechercher une question…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-echo-gold/50 focus:ring-1 focus:ring-echo-gold/30 transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-20 px-4 bg-black/50">
                <div className="container mx-auto max-w-4xl">
                    {searchQuery.trim() && (
                        <p className="text-neutral-400 text-sm mb-8">
                            {totalResults} résultat{totalResults !== 1 ? 's' : ''} pour « {searchQuery} »
                        </p>
                    )}

                    {filteredData.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-neutral-400 text-lg mb-2">Aucun résultat trouvé.</p>
                            <p className="text-neutral-500 text-sm">
                                Essayez avec d'autres termes ou{' '}
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-echo-gold hover:underline"
                                >
                                    réinitialisez la recherche
                                </button>.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {filteredData.map((category, catIdx) => (
                                <div key={catIdx}>
                                    <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                                        <span className="w-8 h-0.5 bg-echo-gold" />
                                        {category.title}
                                    </h2>
                                    <div className="space-y-3">
                                        {category.items.map((item, itemIdx) => {
                                            const key = `${catIdx}-${itemIdx}`;
                                            const isOpen = openItems[key];
                                            return (
                                                <div
                                                    key={itemIdx}
                                                    className="bg-white/5 rounded-lg border border-white/5 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => toggleItem(catIdx, itemIdx)}
                                                        aria-expanded={!!isOpen}
                                                        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/5 transition-colors"
                                                    >
                                                        <span className="font-medium text-white pr-4">{item.q}</span>
                                                        <ChevronDown
                                                            className={`w-5 h-5 text-neutral-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                    {isOpen && (
                                                        <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-neutral-400 text-sm leading-relaxed">
                                                            {item.a}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 px-4 bg-echo-darker border-t border-white/5">
                <div className="container mx-auto max-w-2xl text-center">
                    <p className="text-neutral-300 mb-4">
                        Vous n'avez pas trouvé la réponse à votre question ?
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-echo-gold text-black font-medium rounded-lg hover:bg-echo-gold/90 transition-colors"
                    >
                        Contactez-nous
                    </a>
                </div>
            </section>
        </>
    );
}
