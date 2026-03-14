import { useState, useEffect } from 'react';
import { Users, Code, Pen, Heart } from 'lucide-react';
import { CANDIDATURES_API } from '../../config/api';

interface Member {
    name: string;
    project: string;
    skills: string;
    experience_level?: string;
    type: 'candidature' | 'volunteer';
}

const PROJECT_CONFIG: Record<string, { label: string; color: string; icon: typeof Code }> = {
    cognisphere: { label: 'CogniSphère', color: '#8B5CF6', icon: Code },
    echolink: { label: 'ECHOLink', color: '#3B82F6', icon: Code },
    scenariste: { label: 'Scénariste', color: '#D4AF37', icon: Pen },
    benevole: { label: 'Bénévole', color: '#10B981', icon: Heart },
};

const EXPERIENCE_LABELS: Record<string, string> = {
    professional: 'Professionnel',
    student: 'Étudiant',
    self_taught: 'Autodidacte',
    motivated: 'Motivé',
};

export function MembersSection() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${CANDIDATURES_API}/members`);
                if (res.ok) {
                    setMembers(await res.json());
                }
            } catch {
                // Silently fail — section simply won't show
            } finally {
                setIsLoading(false);
            }
        };
        fetchMembers();
    }, []);

    if (isLoading || members.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="border-t border-white/10 pt-16">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-4">
                        <Users size={16} className="text-[#D4AF37]" />
                        {members.length} membre{members.length > 1 ? 's' : ''} actif{members.length > 1 ? 's' : ''}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif text-white mb-3">
                        Les Membres du Mouvement
                    </h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto text-sm">
                        Ils ont rejoint l'aventure ECHO et contribuent activement au projet.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {members.map((member, i) => {
                        const config = PROJECT_CONFIG[member.project] || PROJECT_CONFIG.benevole;
                        const Icon = config.icon;
                        return (
                            <div
                                key={`${member.name}-${i}`}
                                className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5 hover:border-white/15 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                                    >
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-medium text-sm truncate">{member.name}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Icon size={12} style={{ color: config.color }} />
                                            <span className="text-xs" style={{ color: config.color }}>{config.label}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {member.skills.split(', ').slice(0, 3).map(skill => (
                                        <span
                                            key={skill}
                                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-neutral-400 border border-white/10"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {member.skills.split(', ').length > 3 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-neutral-500">
                                            +{member.skills.split(', ').length - 3}
                                        </span>
                                    )}
                                </div>
                                {member.experience_level && (
                                    <p className="text-[10px] text-neutral-500 mt-2">
                                        {EXPERIENCE_LABELS[member.experience_level] || member.experience_level}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
