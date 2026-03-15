import { useState } from 'react';
import { Heart, Check, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DONATION_URL } from '../config/donation';
import { useAnalytics } from '../hooks/useAnalytics';
import { SEO } from '../components/seo/SEO';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';

export function Support() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const { trackEvent } = useAnalytics();

    const donationTiers = [
        {
            amount: "10€",
            title: "Graine",
            desc: "Participez aux frais techniques et plantez la première graine.",
            features: ["Accès anticipé aux épisodes", "Newsletter exclusive"]
        },
        {
            amount: "50€",
            title: "Racine",
            desc: "Soutenez la production et ancrez le projet dans la durée.",
            features: ["Accès anticipé", "Newsletter exclusive", "Votre nom au générique", "Invitation aux projections"]
        },
        {
            amount: "100€+",
            title: "Canopée",
            desc: "Devenez un pilier majeur du mouvement ECHO.",
            features: ["Tous les avantages précédents", "Rencontre avec l'équipe", "Accès au Discord privé", "Goodies exclusifs"]
        }
    ];

    const faqs = [
        {
            q: "À quoi sert l'argent ?",
            a: "100% des dons financent la production des épisodes (matériel, déplacements) et l'hébergement de la plateforme. L'équipe est pour l'instant bénévole."
        },
        {
            q: "Les dons sont-ils défiscalisés ?",
            a: "Oui, ECHO est une association loi 1901 reconnue d'intérêt général. Vous pouvez déduire 66% de votre don de vos impôts."
        },
        {
            q: "Puis-je annuler mon don mensuel ?",
            a: "Absolument, à tout moment et sans frais depuis votre espace personnel."
        }
    ];

    return (
        <>
            <SEO
                title="Soutenir ECHO"
                description="Soutenez Mouvement ECHO : dons à partir de 10 euros. Association loi 1901, série documentaire, plateformes citoyennes."
                url="https://mouvementecho.fr/soutenir"
            />
            <Breadcrumbs items={[{ label: 'Soutenir' }]} />
            {/* Hero Section */}
            <section className="relative py-20 bg-echo-darker">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-echo-gold/20 via-black to-black" />

                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-block p-4 rounded-full bg-echo-gold/10 mb-6 animate-pulse">
                        <Heart className="w-12 h-12 text-echo-gold" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-white mb-4 sm:mb-6">Soutenir ECHO</h1>
                    <p className="text-base sm:text-xl text-neutral-300 mb-6 sm:mb-8">
                        ECHO est un projet indépendant, libre et sans publicité. <br />
                        Votre soutien est notre seule énergie.
                    </p>

                    {/* Progress Bar Placeholder */}
                    <div className="max-w-2xl mx-auto bg-white/5 rounded-2xl p-6 backdrop-blur-md border border-white/10 mb-12">
                        <div className="flex justify-between text-sm mb-2 text-neutral-400">
                            <span>Objectif Saison 2</span>
                            <span>65%</span>
                        </div>
                        <div className="h-4 bg-black/50 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-gradient-to-r from-echo-gold to-yellow-300 w-[65%] shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-2xl font-bold text-white">13 000 €</span>
                                <span className="text-sm text-neutral-500 ml-2">récoltés</span>
                            </div>
                            <span className="text-sm text-neutral-500">sur 20 000 €</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Donation Tiers */}
            <section className="py-20 px-4 bg-black/50">
                <div className="container mx-auto max-w-6xl text-center">
                    <h2 className="text-3xl font-serif text-white mb-12">Choisissez votre impact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {donationTiers.map((tier, i) => (
                            <Card key={i} className={`p-6 sm:p-8 flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${i === 1 ? 'border-echo-gold shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'border-white/10'}`}>
                                {i === 1 && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-echo-gold shadow-[0_0_10px_#ffd700]" />
                                )}
                                <span className="text-4xl font-bold text-white mb-2">{tier.amount}</span>
                                <h3 className="text-xl font-serif text-echo-gold mb-4">{tier.title}</h3>
                                <p className="text-neutral-400 text-sm mb-6 min-h-[50px]">{tier.desc}</p>

                                <ul className="text-left w-full space-y-3 mb-8 flex-1">
                                    {tier.features.map((feat, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-neutral-300">
                                            <Check className="w-4 h-4 text-echo-green mr-2 mt-0.5 shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <a href={DONATION_URL} target="_blank" rel="noopener noreferrer" className="w-full" onClick={() => trackEvent('cta_click', `soutenir_helloasso_${tier.title.toLowerCase()}`)}>
                                    <Button variant={i === 1 ? 'primary' : 'outline'} className="w-full">
                                        Je soutiens <ExternalLink className="w-4 h-4 ml-2 inline" />
                                    </Button>
                                </a>
                            </Card>
                        ))}
                    </div>
                    <p className="mt-8 text-neutral-500 text-sm">
                        En cliquant sur ces liens, vous serez redirigé vers{' '}
                        <a href={DONATION_URL} target="_blank" rel="noopener noreferrer" className="text-echo-gold hover:underline" onClick={() => trackEvent('cta_click', 'soutenir_helloasso_footer')}>HelloAsso</a>,
                        un service tiers. Consultez leur{' '}
                        <a href="https://www.helloasso.com/confidentialite" target="_blank" rel="noopener noreferrer" className="text-echo-gold hover:underline">politique de confidentialité</a>.
                        Paiement sécurisé — plateforme certifiée.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 bg-echo-darker border-t border-white/5">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-serif text-white mb-12 text-center">Questions Fréquentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-medium text-white">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 text-neutral-400 text-sm leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
