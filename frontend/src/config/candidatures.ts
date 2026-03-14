// Shared constants for candidature/member display across admin, public, and profile pages

export const PROJECT_LABELS: Record<string, { label: string; color: string }> = {
    cognisphere: { label: 'CogniSphère', color: '#8B5CF6' },
    echolink: { label: 'ECHOLink', color: '#3B82F6' },
    scenariste: { label: 'Scénariste', color: '#D4AF37' },
    benevole: { label: 'Bénévole', color: '#10B981' },
};

export const EXPERIENCE_LABELS: Record<string, string> = {
    professional: 'Professionnel',
    student: 'Étudiant',
    self_taught: 'Autodidacte',
    motivated: 'Motivé',
};
