import { useState } from 'react';
import { Heart, ChevronDown, ExternalLink, Film, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CAMPAIGNS } from '../config/donation';
import { HelloAssoCounter } from '../components/ui/HelloAssoCounter';
import { useAnalytics } from '../hooks/useAnalytics';
import { SEO } from '../components/seo/SEO';

function getDaysRemaining(deadline: string): number {
    const now = new Date();
    const end = new Date(deadline + 'T23:59:59');
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getBadgeStyle(days: number): { bg: string; text: string } {
    if (days <= 14) return { bg: 'bg-red-500/20', text: 'text-red-400' };
    if (days <= 30) return { bg: 'bg-amber-500/20', text: 'text-amber-400' };
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
}

export function Support() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const { trackEvent } = useAnalytics();

    const faqs = [
        {
            q: "À quoi sert l'argent ?",
            a: "100% des dons financent la production des courts métrages (matériel, déplacements, défraiements artistes) et la logistique des tournages. L'équipe est pour l'instant bénévole."
        },
        {
            q: "Les dons sont-ils défiscalisés ?",
            a: "Oui, ECHO est une association loi 1901 reconnue d'intérêt général. Vous pouvez déduire 66% de votre don de vos impôts (un don de 33 € ne vous coûte que 11,22 €)."
        },
        {
            q: "Puis-je annuler mon don ?",
            a: "Absolument, à tout moment et sans frais depuis votre espace HelloAsso."
        }
    ];

    return (
        <>
            <SEO
                title="Soutenir ECHO — 3 courts métrages à financer"
                description="Soutenez les 3 premiers courts métrages ECHO tournés à Bordeaux, Lille et Lyon avec des étudiants. Dès 1 €. Association loi 1901, déduction fiscale 66%."
                url="https://mouvementecho.fr/soutenir"
                breadcrumbs={[
                    { name: "Accueil", url: "https://mouvementecho.fr/" },
                    { name: "Soutenir", url: "https://mouvementecho.fr/soutenir" }
                ]}
            />

            {/* Hero Section */}
            <section className="relative py-16 sm:py-20 bg-echo-darker overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-15" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-echo-gold/20 via-black/80 to-black" />
                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-block p-4 rounded-full bg-echo-gold/10 mb-6">
                        <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-echo-gold" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-4">
                        Soutenez les 3 premiers films ECHO
                    </h1>
                    <p className="text-base sm:text-lg text-neutral-300 mb-3 max-w-2xl mx-auto">
                        3 villes &middot; 3 visions &middot; 3 courts métrages tournés avec des étudiants
                    </p>
                    <p className="text-sm text-neutral-400 mb-2">
                        Soutenus par <span className="text-echo-gold">Cyril Dion</span> &amp; <span className="text-echo-gold">Flore Vasseur</span>
                    </p>
                    <p className="text-sm text-neutral-500">
                        Dès 1 € &middot; Déduction fiscale 66% &middot; Paiement sécurisé HelloAsso
                    </p>
                </div>
            </section>

            {/* 3 Campaign Cards */}
            <section className="py-12 sm:py-20 px-4 bg-black/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-2xl sm:text-3xl font-serif text-white mb-4 text-center">
                        Choisissez votre campagne
                    </h2>
                    <p className="text-neutral-400 text-center mb-10 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
                        Chaque court métrage explore un volet de la série ECHO, inspirée de la Divine Comédie de Dante.
                        Art, interaction, éducation : trois regards complémentaires sur le monde de demain.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {CAMPAIGNS.map((campaign) => {
                            const days = getDaysRemaining(campaign.deadline);
                            const badge = getBadgeStyle(days);

                            return (
                                <div
                                    key={campaign.id}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                                >
                                    {/* Header : city + badge */}
                                    <div className="flex items-center justify-between w-full mb-4">
                                        <div className="flex items-center gap-2">
                                            <Film size={18} style={{ color: campaign.color }} />
                                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: campaign.color }}>
                                                ECHO x {campaign.city}
                                            </span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                            <Clock size={10} />
                                            J-{days}
                                        </span>
                                    </div>

                                    {/* Volet title */}
                                    <h3 className="text-lg font-serif text-white mb-2 text-center">{campaign.volet}</h3>

                                    {/* Accroche */}
                                    <p className="text-sm text-neutral-400 text-center mb-6 min-h-[48px]">
                                        {campaign.accroche}
                                    </p>

                                    {/* HelloAsso Counter Widget */}
                                    <div className="mb-6 w-full">
                                        <HelloAssoCounter
                                            src={campaign.counterWidgetUrl}
                                            title={`Compteur de dons ECHO x ${campaign.city}`}
                                            objective={campaign.objective}
                                        />
                                    </div>

                                    {/* CTA */}
                                    <a
                                        href={campaign.donationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                        onClick={() => trackEvent('cta_click', `soutenir_helloasso_${campaign.id}`)}
                                    >
                                        <Button variant="primary" className="w-full">
                                            Contribuer <ExternalLink className="w-4 h-4 ml-2 inline" />
                                        </Button>
                                    </a>

                                    <span className="text-xs text-neutral-500 mt-3">
                                        Objectif : {campaign.objective.toLocaleString('fr-FR')} € &middot; Dès 1 €
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <p className="mt-8 text-neutral-500 text-sm text-center">
                        En cliquant sur ces liens, vous serez redirigé vers{' '}
                        <a href="https://www.helloasso.com" target="_blank" rel="noopener noreferrer" className="text-echo-gold hover:underline">HelloAsso</a>,
                        plateforme de paiement sécurisée. Consultez leur{' '}
                        <a href="https://www.helloasso.com/confidentialite" target="_blank" rel="noopener noreferrer" className="text-echo-gold hover:underline">politique de confidentialité</a>.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 sm:py-20 px-4 bg-echo-darker border-t border-white/5">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-2xl sm:text-3xl font-serif text-white mb-10 sm:mb-12 text-center">Questions Fréquentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-medium text-white">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-200 shrink-0 ml-2 ${openFaq === i ? 'rotate-180' : ''}`} />
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
