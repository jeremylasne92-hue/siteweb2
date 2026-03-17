// Campagnes de crowdfunding HelloAsso — Mouvement ECHO
export interface Campaign {
    id: string;
    city: string;
    volet: string;
    accroche: string;
    objective: number;
    deadline: string; // ISO date
    color: string;
    donationUrl: string;
    counterWidgetUrl: string;
}

export const CAMPAIGNS: Campaign[] = [
    {
        id: 'lille',
        city: 'Lille',
        volet: 'Volet Interactif',
        accroche: 'Un thriller urbain mêlant gamification et engagement citoyen avec des étudiants lillois.',
        objective: 1200,
        deadline: '2026-04-30',
        color: '#60A5FA',
        donationUrl: 'https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lille-court-metrage-volet-interactif',
        counterWidgetUrl: 'https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lille-court-metrage-volet-interactif/widget-compteur',
    },
    {
        id: 'lyon',
        city: 'Lyon',
        volet: 'Volet Éducatif',
        accroche: 'Des étudiants lyonnais construisent la CogniSphère, encyclopédie vivante au service du bien commun.',
        objective: 1200,
        deadline: '2026-05-31',
        color: '#10B981',
        donationUrl: 'https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lyon-court-metrage-volet-educatif',
        counterWidgetUrl: 'https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-lyon-court-metrage-volet-educatif/widget-compteur',
    },
    {
        id: 'bordeaux',
        city: 'Bordeaux',
        volet: 'Volet Artistique',
        accroche: '9 Muses convoquées par des étudiants bordelais pour répondre : qu\'est-ce que la série ECHO ?',
        objective: 1200,
        deadline: '2026-06-30',
        color: '#F59E0B',
        donationUrl: 'https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-bordeaux-court-metrage-volet-artistique',
        counterWidgetUrl: 'https://www.helloasso.com/associations/mouvement-echo/collectes/echo-x-bordeaux-court-metrage-volet-artistique/widget-compteur',
    },
];

// Legacy — still used by Mouvement.tsx and footer CTAs
export const DONATION_URL = CAMPAIGNS[0].donationUrl;
