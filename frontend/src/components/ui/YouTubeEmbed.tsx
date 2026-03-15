import { useCookieConsent, openCookiePanel } from './CookieBanner';

interface YouTubeEmbedProps {
    videoId: string;
    title: string;
    className?: string;
}

/**
 * RGPD-compliant YouTube embed (RGPD art. 82 — Directive ePrivacy).
 *
 * Shows a facade placeholder until the user accepts analytics cookies via the CMP.
 * This prevents YouTube from setting third-party cookies before consent is given.
 */
export function YouTubeEmbed({ videoId, title, className = '' }: YouTubeEmbedProps) {
    const consent = useCookieConsent();
    const hasConsent = consent === 'accepted';

    if (!hasConsent) {
        return (
            <div
                className={`flex flex-col items-center justify-center bg-black/80 border border-white/10 rounded-xl ${className}`}
                role="region"
                aria-label="Vidéo YouTube bloquée — consentement requis"
            >
                <div className="text-center px-6 py-8 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-300 mb-2 font-medium">
                        Contenu vidéo YouTube
                    </p>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        Cette vidéo est hébergée par YouTube. En l'affichant, vous acceptez les{' '}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-echo-gold hover:underline"
                        >
                            conditions d'utilisation
                        </a>{' '}
                        de YouTube et autorisez le dépôt de cookies tiers.
                    </p>
                    <button
                        onClick={() => openCookiePanel()}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium border border-echo-gold text-echo-gold hover:bg-echo-gold hover:text-black transition-colors"
                    >
                        Accepter et afficher la vidéo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={className}
        />
    );
}
