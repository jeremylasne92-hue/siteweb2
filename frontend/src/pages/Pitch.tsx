import { Link } from 'react-router-dom';
import { YouTubeEmbed } from '../components/ui/YouTubeEmbed';
import { SEO } from '../components/seo/SEO';

const stats = [
    { value: '33', label: 'Épisodes' },
    { value: '3', label: 'Saisons' },
    { value: '16', label: 'Comédiens voix' },
    { value: '4 sem.', label: "D'écriture à Formiguères" },
    { value: '♪', label: 'Bande originale composée' },
    { value: 'IA', label: 'Storyboard assisté par IA' },
];

const timeline = [
    { period: '2026 — S1', label: 'Écriture terminée', done: true },
    { period: '2026 — S2', label: 'Pré-production', done: false },
    { period: '2026 — S2/S3', label: 'Tournage saison 1', done: false },
    { period: '2027', label: 'Diffusion', done: false },
];

const team = [
    { name: 'Jérémy Lasne', role: 'Cofondateur' },
    { name: 'Eddyason Koffi', role: 'Cofondateur' },
    { name: 'Déborah Prévaud', role: 'Responsable des partenariats' },
    { name: 'Clément Grandmontagne', role: 'Réalisateur' },
    { name: 'Thierry Korutos-Chatam', role: 'Responsable des partenariats' },
];

export function Pitch() {
    return (
        <>
            <SEO
                title="Dossier de présentation — ECHO"
                description="ECHO : série fiction de 33 épisodes en 3 saisons sur la transition écologique et la justice sociale. Découvrez le projet et devenez partenaire."
                url="https://mouvementecho.fr/pitch"
            />

            <div className="min-h-screen bg-[#0a0a0a] text-white">
                {/* Header */}
                <header className="border-b border-white/10">
                    <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src="/logo-echo.jpg"
                                alt="ECHO"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <span className="text-lg font-serif tracking-wide text-white">ECHO</span>
                        </Link>
                        <span className="text-xs uppercase tracking-widest text-neutral-500">
                            Dossier de présentation
                        </span>
                    </div>
                </header>

                {/* Concept */}
                <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-6 leading-tight">
                        ECHO — <span className="text-echo-gold">33 épisodes</span> pour comprendre le monde
                    </h1>
                    <p className="text-base sm:text-lg text-neutral-300 max-w-3xl leading-relaxed">
                        ECHO est une série fiction de 33 épisodes répartis en 3 saisons, inspirée
                        des cercles de <em>La Divine Comédie</em> de Dante. À travers des récits
                        humains et engagés, elle explore les grands défis de notre époque :
                        transition écologique, justice sociale, désinformation, surconsommation.
                    </p>
                    <p className="mt-4 text-sm text-neutral-500">
                        Un projet porté par l'association Mouvement ECHO — loi 1901
                    </p>
                </section>

                {/* Prologue video */}
                <section className="max-w-5xl mx-auto px-6 pb-16 sm:pb-24">
                    <h2 className="text-sm uppercase tracking-widest text-echo-gold mb-6">
                        Prologue
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                        <YouTubeEmbed
                            videoId="R34yKJuPDWA"
                            title="ECHO — Prologue"
                            className="w-full h-full rounded-xl"
                        />
                    </div>
                </section>

                {/* Chiffres clés */}
                <section className="border-y border-white/10 bg-white/[0.02]">
                    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
                        <h2 className="text-sm uppercase tracking-widest text-echo-gold mb-10">
                            Chiffres clés
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <div className="text-3xl sm:text-4xl font-serif text-echo-gold mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-neutral-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* L'équipe */}
                <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
                    <h2 className="text-sm uppercase tracking-widest text-echo-gold mb-10">
                        L'équipe
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {team.map((member) => (
                            <div
                                key={member.name}
                                className="border border-white/10 rounded-lg px-6 py-5 bg-white/[0.02]"
                            >
                                <div className="text-white font-medium">{member.name}</div>
                                <div className="text-sm text-neutral-500 mt-1">{member.role}</div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-neutral-500">
                        + 16 comédiens voix professionnels + Studio Mithra Production (enregistrement)
                    </p>
                </section>

                {/* Calendrier */}
                <section className="border-y border-white/10 bg-white/[0.02]">
                    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
                        <h2 className="text-sm uppercase tracking-widest text-echo-gold mb-10">
                            Calendrier
                        </h2>
                        <div className="space-y-0">
                            {timeline.map((item, i) => (
                                <div key={item.period} className="flex gap-6 items-start">
                                    {/* Vertical line + dot */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-3 h-3 rounded-full border-2 mt-1 ${
                                                item.done
                                                    ? 'bg-echo-gold border-echo-gold'
                                                    : 'bg-transparent border-neutral-600'
                                            }`}
                                        />
                                        {i < timeline.length - 1 && (
                                            <div className="w-px h-12 bg-neutral-700" />
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="pb-8">
                                        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">
                                            {item.period}
                                        </div>
                                        <div className={`text-sm ${item.done ? 'text-white' : 'text-neutral-400'}`}>
                                            {item.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
                    <h2 className="text-2xl sm:text-3xl font-serif mb-4">
                        Envie de soutenir le projet ?
                    </h2>
                    <p className="text-neutral-400 mb-8 max-w-lg mx-auto text-sm sm:text-base">
                        Rejoignez l'aventure ECHO en tant que partenaire.
                        Visibilité, impact, engagement citoyen.
                    </p>
                    <Link
                        to="/partenaires"
                        className="inline-block px-8 py-3 rounded-lg font-medium border-2 border-echo-gold text-echo-gold hover:bg-echo-gold hover:text-black transition-colors"
                    >
                        Devenir partenaire
                    </Link>
                </section>

                {/* Footer minimal */}
                <footer className="border-t border-white/10">
                    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
                        <a
                            href="https://mouvementecho.fr"
                            className="hover:text-white transition-colors"
                        >
                            mouvementecho.fr
                        </a>
                        <a
                            href="mailto:contact@mouvementecho.fr"
                            className="hover:text-white transition-colors"
                        >
                            contact@mouvementecho.fr
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default Pitch;
