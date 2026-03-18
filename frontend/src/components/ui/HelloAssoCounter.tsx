import { Heart } from 'lucide-react';

interface HelloAssoCounterProps {
    src: string;
    title: string;
    objective?: number;
    className?: string;
}

// HelloAsso bloque l'iframe via X-Frame-Options depuis localhost
const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');

export function HelloAssoCounter({ src, title, objective = 1200, className = '' }: HelloAssoCounterProps) {
    // En dev/localhost : afficher un compteur custom (HelloAsso bloque les iframes)
    if (!isProduction) {
        return (
            <div
                className={`w-full max-w-[350px] mx-auto rounded-xl overflow-hidden border border-echo-gold/30 bg-white/5 p-5 ${className}`}
                aria-label={title}
            >
                <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-5 h-5 text-echo-gold" />
                    <span className="text-sm font-medium text-white">Collecte en cours</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                    <div className="bg-echo-gold h-3 rounded-full transition-all" style={{ width: '0%' }} />
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                    <span>0 € collecté</span>
                    <span>Objectif : {objective.toLocaleString('fr-FR')} €</span>
                </div>
            </div>
        );
    }

    // En production : iframe HelloAsso widget compteur
    return (
        <div
            className={`w-full max-w-[350px] mx-auto rounded-xl overflow-hidden border border-echo-gold/30 bg-white ${className}`}
            aria-label={title}
        >
            <iframe
                src={src}
                title={title}
                className="w-full border-none"
                style={{ height: '120px' }}
                loading="lazy"
            />
        </div>
    );
}
