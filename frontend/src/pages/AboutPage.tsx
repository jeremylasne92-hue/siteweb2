import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '../components/seo/SEO';
import { Info, Film, BookOpen, Users, Shield, Mail } from 'lucide-react';

export function AboutPage() {
    return (
        <>
            <SEO
                title="À propos"
                description="Mouvement ECHO est une association loi 1901 fondée en 2024 par Jérémy Lasne. Mission, équipe, manifeste et vision du projet."
                url="https://mouvementecho.fr/a-propos"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "AboutPage",
                        "@id": "https://mouvementecho.fr/a-propos",
                        "name": "À propos de Mouvement ECHO",
                        "description": "Présentation, mission, équipe et manifeste du Mouvement ECHO.",
                        "mainEntity": {
                            "@id": "https://mouvementecho.fr/#organization"
                        },
                        "isPartOf": {
                            "@id": "https://mouvementecho.fr/#website"
                        },
                        "inLanguage": "fr-FR"
                    })}
                </script>
            </Helmet>

            {/* Hero */}
            <section className="relative py-20 bg-echo-darker">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-echo-gold/20 via-black to-black" />
                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-block p-4 rounded-full bg-echo-gold/10 mb-6">
                        <Info className="w-12 h-12 text-echo-gold" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-white mb-4 sm:mb-6">
                        À propos de Mouvement ECHO
                    </h1>
                </div>
            </section>

            {/* Résumé exécutif */}
            <section className="py-16 px-4 bg-black/50">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-neutral-300 text-lg leading-relaxed space-y-4">
                        <p>
                            Mouvement ECHO est une association citoyenne française (loi 1901) qui produit une série documentaire de 33 épisodes sur la transition écologique et sociale, et développe des plateformes numériques d'apprentissage et de mise en réseau des acteurs du changement. Fondée en 2024 par Jérémy Lasne, l'association fédère les citoyens autour d'un récit collectif structuré en 3 saisons inspirées de la Divine Comédie de Dante. Le projet combine création audiovisuelle, innovation technologique et engagement citoyen.
                        </p>
                    </div>
                </div>
            </section>

            {/* Fiche entité */}
            <section className="py-12 px-4 bg-echo-darker">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                        <h2 className="text-xl font-serif text-echo-gold mb-6">Fiche entité</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow label="Nom" value="Mouvement ECHO" />
                            <InfoRow label="Type" value="Association loi 1901" />
                            <InfoRow label="Fondation" value="2024" />
                            <InfoRow label="Siège" value="Bougival, France (78)" />
                            <InfoRow label="Fondateur" value="Jérémy Lasne" />
                            <InfoRow label="Site" value="mouvementecho.fr" href="https://mouvementecho.fr" />
                            <InfoRow label="RNA" value="W784010993" />
                            <InfoRow label="SIRET" value="933 682 510 00013" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Sections */}
            <section className="py-20 px-4 bg-black/50">
                <div className="container mx-auto max-w-4xl space-y-20">

                    {/* 1. Pourquoi ECHO existe */}
                    <div>
                        <SectionHeading icon={<Info className="w-6 h-6" />} title="Pourquoi ECHO existe" />
                        <p className="text-neutral-300 leading-relaxed">
                            Face aux défis systémiques de notre époque — crise climatique, fractures sociales, perte de sens — l'information ne manque pas, mais sa transformation en action collective reste un défi majeur. ECHO naît du constat que le documentaire, quand il est structuré comme un récit initiatique et accompagné d'outils concrets, peut devenir un catalyseur de changement. L'association propose un parcours qui va du diagnostic des crises à la projection de futurs souhaitables.
                        </p>
                    </div>

                    {/* 2. Ce que fait ECHO concrètement */}
                    <div>
                        <SectionHeading icon={<Film className="w-6 h-6" />} title="Ce que fait ECHO concrètement" />
                        <div className="space-y-6">
                            <SubItem
                                title="La Série documentaire"
                                description="33 épisodes en 3 saisons (Saison 1 : diagnostic des crises, Saison 2 : solutions du terrain, Saison 3 : futurs souhaitables). Structure narrative inspirée de la Divine Comédie de Dante. En production."
                            />
                            <SubItem
                                title="CogniSphère"
                                description="Plateforme d'apprentissage par répétition espacée (algorithme FSRS-5) qui transforme les contenus de la série en connaissances durables. En développement."
                            />
                            <SubItem
                                title="ECHOLink"
                                description="Réseau de mise en relation des acteurs du changement — spectateurs, porteurs de projets, associations, entrepreneurs sociaux. En développement."
                            />
                        </div>
                    </div>

                    {/* 3. La méthode */}
                    <div>
                        <SectionHeading icon={<BookOpen className="w-6 h-6" />} title="La méthode : une structure narrative en 3 actes" />
                        <p className="text-neutral-300 leading-relaxed mb-6">
                            La série ECHO est structurée en 3 saisons de 11 épisodes, inspirées des trois cantiques de la Divine Comédie de Dante Alighieri :
                        </p>
                        <div className="space-y-4">
                            <SeasonCard
                                season="Saison 1"
                                subtitle="Diagnostic des crises"
                                description="Décryptage des dysfonctionnements systémiques. Crises écologiques, sociales et économiques documentées sans complaisance."
                            />
                            <SeasonCard
                                season="Saison 2"
                                subtitle="Solutions du terrain"
                                description="Documentation des acteurs innovants, des alternatives viables et des solutions concrètes qui fonctionnent."
                            />
                            <SeasonCard
                                season="Saison 3"
                                subtitle="Futurs souhaitables"
                                description="Prospective et imaginaires alternatifs. Projection vers les mondes possibles."
                            />
                        </div>
                    </div>

                    {/* 4. L'équipe */}
                    <div>
                        <SectionHeading icon={<Users className="w-6 h-6" />} title="L'équipe" />
                        <p className="text-neutral-300 leading-relaxed mb-6">
                            Mouvement ECHO est porté par une équipe pluridisciplinaire réunissant des compétences en réalisation documentaire, développement logiciel, design, communication et gestion de projet.
                        </p>
                        <Link
                            to="/mouvement"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-echo-gold text-black font-medium rounded-lg hover:bg-echo-gold/90 transition-colors"
                        >
                            Découvrir l'équipe complète
                        </Link>
                    </div>

                    {/* 5. Preuves et références */}
                    <div>
                        <SectionHeading icon={<Shield className="w-6 h-6" />} title="Preuves et références" />
                        <ul className="space-y-3 text-neutral-300">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-echo-gold mt-2.5 shrink-0" />
                                <span>Association déclarée en préfecture des Yvelines (RNA : W784010993)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-echo-gold mt-2.5 shrink-0" />
                                <span>SIRET : 933 682 510 00013</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-echo-gold mt-2.5 shrink-0" />
                                <span>Siège social : 59 quai Boissy d'Anglas, 78380 Bougival</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-echo-gold mt-2.5 shrink-0" />
                                <span>Partenaire EICAR (école de cinéma)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-echo-gold mt-2.5 shrink-0" />
                                <span>Candidat ChangeNOW 2026</span>
                            </li>
                        </ul>
                    </div>

                    {/* 6. Contact */}
                    <div>
                        <SectionHeading icon={<Mail className="w-6 h-6" />} title="Contact" />
                        <p className="text-neutral-300 leading-relaxed mb-6">
                            Pour toute question, proposition de partenariat ou demande presse, contactez-nous.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-echo-gold text-black font-medium rounded-lg hover:bg-echo-gold/90 transition-colors"
                            >
                                Page de contact
                            </Link>
                            <a
                                href="mailto:contact@mouvementecho.fr"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-echo-gold/50 text-echo-gold font-medium rounded-lg hover:bg-echo-gold/10 transition-colors"
                            >
                                contact@mouvementecho.fr
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-neutral-500 text-sm font-medium min-w-[100px]">{label}</span>
            {href ? (
                <a href={href} className="text-echo-gold hover:underline text-sm" target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            ) : (
                <span className="text-white text-sm">{value}</span>
            )}
        </div>
    );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
            <span className="text-echo-gold">{icon}</span>
            {title}
        </h2>
    );
}

function SubItem({ title, description }: { title: string; description: string }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-lg p-5">
            <h3 className="text-white font-medium mb-2">{title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function SeasonCard({ season, subtitle, description }: { season: string; subtitle: string; description: string }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-lg p-5">
            <h3 className="text-white font-medium mb-1">
                {season} — <span className="text-echo-gold">{subtitle}</span>
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
