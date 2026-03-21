import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <SEO title="Page introuvable" description="La page que vous recherchez n'existe pas ou a été déplacée." />
            <p className="text-8xl font-bold text-echo-gold mb-4">404</p>
            <h1 className="text-2xl font-bold text-white mb-2">
                Page introuvable
            </h1>
            <p className="text-echo-textMuted mb-8 max-w-md">
                La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-echo-gold text-echo-darkBg font-semibold rounded-lg hover:bg-echo-gold/90 transition-colors"
            >
                <Home size={18} />
                Retour à l'accueil
            </Link>
        </div>
    );
}
