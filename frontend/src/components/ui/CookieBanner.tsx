import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

declare function gtag(...args: unknown[]): void;

const CONSENT_KEY = 'echo-cookie-consent';

export function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            setVisible(true);
        } else if (consent === 'accepted') {
            gtag('consent', 'update', { analytics_storage: 'granted' });
        }
    }, []);

    const accept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        gtag('consent', 'update', { analytics_storage: 'granted' });
        setVisible(false);
    };

    const refuse = () => {
        localStorage.setItem(CONSENT_KEY, 'refused');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-t border-white/10 p-4 sm:p-6">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-300 text-center sm:text-left">
                    Ce site utilise des cookies essentiels au fonctionnement et des cookies d’analyse optionnels.{' '}
                    <Link to="/politique-de-confidentialite" className="text-echo-gold hover:underline">
                        En savoir plus
                    </Link>
                </p>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={refuse}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                    >
                        Refuser
                    </button>
                    <button
                        onClick={accept}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-echo-gold text-black hover:bg-echo-gold/90 transition-colors"
                    >
                        Accepter
                    </button>
                </div>
            </div>
        </div>
    );
}
