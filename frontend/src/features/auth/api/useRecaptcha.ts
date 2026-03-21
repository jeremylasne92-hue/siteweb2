const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
    if (scriptLoaded) return Promise.resolve();
    if (scriptLoading) return scriptLoading;
    if (!SITE_KEY) return Promise.resolve();

    scriptLoading = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
        script.async = true;
        script.onload = () => {
            scriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
        document.head.appendChild(script);
    });

    return scriptLoading;
}

/**
 * Execute reCAPTCHA v3 and return a token.
 * Returns empty string if VITE_RECAPTCHA_SITE_KEY is not configured (dev mode).
 */
export async function getRecaptchaToken(action: string): Promise<string> {
    if (!SITE_KEY) return '';

    await loadRecaptchaScript();

    return new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
            window.grecaptcha
                .execute(SITE_KEY, { action })
                .then(resolve)
                .catch(reject);
        });
    });
}
