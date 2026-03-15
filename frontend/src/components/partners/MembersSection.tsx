import { useState, useEffect } from 'react';
import { Users, Code, Pen, Heart } from 'lucide-react';
import { PROJECT_LABELS, EXPERIENCE_LABELS } from '../../config/candidatures';
import { MEMBERS_API } from '../../config/api';
import type { MemberProfile } from '../../types/member';

export interface Member {
    name: string;
    slug?: string;
    project: string;
    skills: string;
    experience_level?: string;
    type: 'candidature' | 'volunteer';
}

interface MembersSectionProps {
    onMemberClick?: (slug: string) => void;
}

const PROJECT_ICONS: Record<string, typeof Code> = {
    cognisphere: Code,
    echolink: Code,
    scenariste: Pen,
    benevole: Heart,
};

export function MembersSection({ onMemberClick }: MembersSectionProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${MEMBERS_API}?limit=100`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped = (data.members || []).map((m: MemberProfile) => ({
                        name: m.display_name,
                        slug: m.slug,
                        project: m.project,
                        skills: m.skills.join(', '),
                        experience_level: m.experience_level,
                        type: 'candidature' as const,
                    }));
                    setMembers(mapped);
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
        <div id="membres" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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
                        const project = PROJECT_LABELS[member.project] || PROJECT_LABELS.benevole;
                        const Icon = PROJECT_ICONS[member.project] || Heart;
                        const isClickable = !!member.slug && !!onMemberClick;
                        const skillsList = member.skills.split(', ');
                        return (
                            <div
                                key={`${member.name}-${i}`}
                                className={`p-4 rounded-xl bg-[#1A1A1A] border border-white/5 hover:border-white/15 transition-colors${isClickable ? ' cursor-pointer' : ''}`}
                                onClick={isClickable ? () => onMemberClick(member.slug!) : undefined}
                                onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMemberClick(member.slug!); } } : undefined}
                                role={isClickable ? 'button' : undefined}
                                tabIndex={isClickable ? 0 : undefined}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                                        style={{ backgroundColor: `${project.color}20`, color: project.color }}
                                    >
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-medium text-sm truncate">{member.name}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Icon size={12} style={{ color: project.color }} />
                                            <span className="text-xs" style={{ color: project.color }}>{project.label}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {skillsList.slice(0, 3).map(skill => (
                                        <span
                                            key={skill}
                                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-neutral-400 border border-white/10"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {skillsList.length > 3 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-neutral-500">
                                            +{skillsList.length - 3}
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
