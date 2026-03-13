import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

declare function gtag(...args: unknown[]): void;

const CONSENT_KEY = 'echo-cookie-consent';
const CONSENT_DURATION = 13 * 30 * 24 * 60 * 60 * 1000; // ~13 months

interface ConsentData {
    choice: 'accepted' | 'refused' | 'essential-only';
    timestamp: number;
}

function getConsent(): ConsentData | null {
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.timestamp && Date.now() - parsed.timestamp > CONSENT_DURATION) {
            localStorage.removeItem(CONSENT_KEY);
            return null;
        }
        return parsed;
    } catch {
        localStorage.removeItem(CONSENT_KEY);
        return null;
    }
}

function saveConsent(choice: ConsentData['choice']) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, timestamp: Date.now() }));
}

// eslint-disable-next-line react-refresh/only-export-components
export function resetCookieConsent() {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
}

export function CookieBanner() {
    const [visible, setVisible] = useState(() => !getConsent());
    const [showCustomize, setShowCustomize] = useState(false);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

    useEffect(() => {
        const consent = getConsent();
        if (consent?.choice === 'accepted') {
            try { gtag('consent', 'update', { analytics_storage: 'granted' }); } catch { /* gtag not loaded */ }
        }
    }, []);

    const acceptAll = () => {
        saveConsent('accepted');
        try { gtag('consent', 'update', { analytics_storage: 'granted' }); } catch { /* gtag not loaded */ }
        setVisible(false);
    };

    const refuseAll = () => {
        saveConsent('refused');
        setVisible(false);
    };

    const saveCustom = () => {
        if (analyticsEnabled) {
            saveConsent('accepted');
            try { gtag('consent', 'update', { analytics_storage: 'granted' }); } catch { /* gtag not loaded */ }
        } else {
            saveConsent('essential-only');
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-t border-white/10 p-3 sm:p-4 md:p-6">
            <div className="container mx-auto">
                {!showCustomize ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <p className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
                            Ce site utilise des cookies essentiels au fonctionnement et des cookies d'analyse optionnels.{' '}
                            <Link to="/politique-de-confidentialite" className="text-echo-gold hover:underline">
                                En savoir plus
                            </Link>
                        </p>
                        <div className="flex flex-row gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                            <button
                                onClick={refuseAll}
                                className="flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
                            >
                                Tout refuser
                            </button>
                            <button
                                onClick={() => setShowCustomize(true)}
                                className="flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
                            >
                                Personnaliser
                            </button>
                            <button
                                onClick={acceptAll}
                                className="flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-echo-gold text-echo-gold hover:bg-echo-gold hover:text-black transition-colors"
                            >
                                Tout accepter
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-300">
                            Choisissez les cookies que vous souhaitez autoriser :
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 flex-1">
                                <div className="w-10 h-5 bg-echo-gold/80 rounded-full relative cursor-not-allowed">
                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Cookies essentiels</p>
                                    <p className="text-xs text-gray-400">Toujours actifs — nécessaires au fonctionnement du site</p>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 flex-1 cursor-pointer hover:bg-white/10 transition-colors"
                                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                            >
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={analyticsEnabled}
                                    onClick={(e) => { e.stopPropagation(); setAnalyticsEnabled(!analyticsEnabled); }}
                                    className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${analyticsEnabled ? 'bg-echo-gold/80' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${analyticsEnabled ? 'right-0.5' : 'left-0.5'}`} />
                                </button>
                                <div>
                                    <p className="text-sm font-medium text-white">Cookies analytiques</p>
                                    <p className="text-xs text-gray-400">Google Analytics — statistiques de fréquentation anonymes</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => setShowCustomize(false)}
                                className="px-5 py-2 rounded-lg text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
                            >
                                Retour
                            </button>
                            <button
                                onClick={saveCustom}
                                className="px-5 py-2 rounded-lg text-sm font-medium border border-echo-gold text-echo-gold hover:bg-echo-gold hover:text-black transition-colors"
                            >
                                Valider mes choix
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
