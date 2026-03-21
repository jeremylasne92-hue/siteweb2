import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, User, Share2, ArrowRight, Check, Mountain } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../features/auth/store';

export const Welcome = () => {
    const user = useAuthStore((s) => s.user);
    const [copied, setCopied] = useState(false);
    const [visibleSections, setVisibleSections] = useState<number[]>([]);

    useEffect(() => {
        const timers = [0, 1, 2, 3, 4].map((i) =>
            setTimeout(() => setVisibleSections((prev) => [...prev, i]), 200 + i * 250)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText('https://mouvementecho.fr');
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = 'https://mouvementecho.fr';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const sectionClass = (index: number) =>
        `transition-all duration-700 ease-out ${
            visibleSections.includes(index)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
        }`;

    return (
        <>
            <Helmet>
                <title>Bienvenue | Mouvement ECHO</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="min-h-[80vh] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-echo-gold/8 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Welcome header */}
                    <div className={sectionClass(0)}>
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-echo-gold/10 border border-echo-gold/20 text-echo-gold text-sm font-medium">
                                <Check className="w-4 h-4" />
                                Inscription confirmée
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                                {user?.username
                                    ? `Bienvenue ${user.username}`
                                    : 'Bienvenue dans le Mouvement ECHO'}
                            </h1>
                            <p className="text-lg text-echo-textMuted max-w-xl mx-auto">
                                Vous faites maintenant partie du mouvement. Voici un aperçu exclusif pour commencer.
                            </p>
                        </div>
                    </div>

                    {/* Exclusive content block */}
                    <div className={sectionClass(1)}>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-echo-gold/10">
                                    <Mountain className="w-5 h-5 text-echo-gold" />
                                </div>
                                <h2 className="text-xl font-bold text-white">En avant-première</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-echo-textMuted leading-relaxed">
                                    {"Pendant 4 semaines, l'équipe d'ECHO s'est isolée à Formiguères, dans les Pyrénées, pour écrire les scénarios des 33 épisodes. Des sessions d'écriture intenses, des débats passionnés, et une vision commune qui s'est forgée au fil des jours."}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-echo-gold/80">
                                    <span className="w-8 h-px bg-echo-gold/30" />
                                    {"Coulisses de la résidence d'écriture"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next steps cards */}
                    <div className={sectionClass(2)}>
                        <h2 className="text-lg font-semibold text-white mb-5">Vos prochaines étapes</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {/* Card 1 - Prologue */}
                            <Link
                                to="/serie#prologue"
                                className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-echo-gold/30 transition-all duration-300"
                            >
                                <div className="p-2.5 rounded-lg bg-echo-gold/10 w-fit mb-4 group-hover:bg-echo-gold/20 transition-colors">
                                    <Play className="w-5 h-5 text-echo-gold" />
                                </div>
                                <h3 className="font-semibold text-white mb-1.5">Regarder le prologue</h3>
                                <p className="text-sm text-echo-textMuted">
                                    Découvrez les premières minutes de la série.
                                </p>
                            </Link>

                            {/* Card 2 - Profile interests */}
                            <Link
                                to="/profil"
                                className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-echo-gold/30 transition-all duration-300"
                            >
                                <div className="p-2.5 rounded-lg bg-purple-500/10 w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
                                    <User className="w-5 h-5 text-purple-400" />
                                </div>
                                <h3 className="font-semibold text-white mb-1.5">
                                    {"Choisir vos centres d'intérêt"}
                                </h3>
                                <p className="text-sm text-echo-textMuted">
                                    Personnalisez votre expérience ECHO.
                                </p>
                            </Link>

                            {/* Card 3 - Share */}
                            <button
                                onClick={handleCopyLink}
                                className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-echo-gold/30 transition-all duration-300 text-left w-full"
                            >
                                <div className="p-2.5 rounded-lg bg-green-500/10 w-fit mb-4 group-hover:bg-green-500/20 transition-colors">
                                    <Share2 className="w-5 h-5 text-green-400" />
                                </div>
                                <h3 className="font-semibold text-white mb-1.5">Partager ECHO</h3>
                                <p className="text-sm text-echo-textMuted">
                                    {copied ? 'Lien copié !' : 'Copiez le lien mouvementecho.fr'}
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className={sectionClass(3)}>
                        <div className="text-center pt-4">
                            <Link
                                to="/serie"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-echo-gold text-echo-dark font-semibold rounded-md hover:bg-echo-goldLight shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all duration-300 uppercase tracking-wide text-sm"
                            >
                                Explorer le site
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Welcome;
