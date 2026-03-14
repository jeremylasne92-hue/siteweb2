import type { ProjectType, ExperienceLevel } from '../types/member';

export const PROJECT_LABELS: Record<ProjectType, { label: string; color: string }> = {
    cognisphere: { label: 'CogniSphère', color: '#8B5CF6' },
    echolink: { label: 'ECHOLink', color: '#3B82F6' },
    scenariste: { label: 'Scénariste', color: '#D4AF37' },
    benevole: { label: 'Bénévole', color: '#10B981' },
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
    professional: 'Professionnel',
    student: 'Étudiant',
    self_taught: 'Autodidacte',
    motivated: 'Motivé',
};
