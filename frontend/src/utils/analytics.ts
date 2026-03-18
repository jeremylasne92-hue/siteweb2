/**
 * Service utilitaire global pour tracer l'engagement des utilisateurs (Analytics).
 * Éthique & RGPD By Design : HTTP 202 "Fire & Forget", zéro tracker d'adresse IP en bdd, 
 * ni de stockage cookie. L'utilisation du `navigator.sendBeacon` assure que la trace 
 * ne bloque pas le thread du navigateur et fonctionne même si l'onglet se ferme net 
 * (par ex, en cliquant un bouton externe comme HelloAsso).
 */

import { ANALYTICS_API } from '../config/api';

interface AnalyticsEvent {
    category: string;
    action: string;
    path: string;
}

const ANALYTICS_ENDPOINT = `${ANALYTICS_API}/events`;


export const trackEvent = (category: string, action: string, path?: string) => {
    try {
        const payload: AnalyticsEvent = {
            category,
            action,
            path: path || window.location.pathname
        };

        const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json"
        });

        // 1. sendBeacon est ultra véloce pour l'analytique et outrepasse la mort de page
        if (navigator.sendBeacon) {
            navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
        } else {
            // 2. Fetch en Keepalive (polyfill)
            fetch(ANALYTICS_ENDPOINT, {
                method: "POST",
                body: blob,
                keepalive: true, // Très utile pour les Call-To-Action (redirection imminente)
                headers: {
                    "Content-Type": "application/json"
                }
            }).catch(e => console.debug("Analytics Fetch issue", e));
        }

    } catch (error) {
        // Mode Furtif : Les erreurs d'analytics ne remontent JAMAIS à la surface UI.
        console.debug("Analytics exception", error);
    }
}
