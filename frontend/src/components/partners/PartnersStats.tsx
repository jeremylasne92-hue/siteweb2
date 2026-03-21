import React from 'react';
import { Card } from '../ui/Card';

interface PartnersStatsProps {
    stats: {
        total: number;
        by_category: Record<string, number>;
    } | null;
    membersCount?: number;
}

const statCategories = [
    { id: 'expert', label: 'Experts', emoji: '🎓', color: '#D4AF37' },
    { id: 'financier', label: 'Financiers', emoji: '💰', color: '#10B981' },
    { id: 'audiovisuel', label: 'Audiovisuels', emoji: '🎬', color: '#3B82F6' },
    { id: 'education', label: 'Éducation & Culture', emoji: '📚', color: '#8B5CF6' },
    { id: 'membre', label: 'Membres', emoji: '🤝', color: '#DC143C' },
];

// Minimum total (partners + members) to display numeric counters
const COMMUNITY_VISIBILITY_THRESHOLD = 20;

export const PartnersStats: React.FC<PartnersStatsProps> = ({ stats, membersCount = 0 }) => {
    if (!stats) return null;

    const communityTotal = stats.total + membersCount;
    const showNumericStats = communityTotal >= COMMUNITY_VISIBILITY_THRESHOLD;

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-6 relative z-20 mb-16">
            <Card variant="glass" className="p-1 min-h-[100px] flex items-center justify-center">
                {showNumericStats ? (
                    <div className="flex flex-wrap items-center justify-center md:divide-x divide-white/10 w-full">

                        {/* Total Badge */}
                        <div className="w-full md:w-auto px-6 py-4 flex flex-col items-center justify-center group cursor-default">
                            <div className="text-3xl font-serif font-bold text-white group-hover:text-echo-gold transition-colors">
                                {stats.total}
                            </div>
                            <div className="text-xs uppercase tracking-widest text-gray-400 mt-1 font-medium group-hover:text-gray-300">
                                Partenaires
                            </div>
                        </div>

                        {/* Categories */}
                        {statCategories.map((cat) => (
                            <div key={cat.id} className="flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center justify-center group cursor-default relative overflow-hidden">
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                                    style={{ backgroundColor: cat.color }}
                                />

                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl" aria-hidden="true">{cat.emoji}</span>
                                    <span className="text-2xl font-serif font-bold text-white relative z-10 transition-transform group-hover:scale-110 duration-300" style={{ color: cat.color }}>
                                        {(stats.by_category[cat.id] || 0) + (cat.id === 'membre' ? membersCount : 0)}
                                    </span>
                                </div>

                                <div className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-medium text-center relative z-10 group-hover:text-gray-300 transition-colors">
                                    {cat.label}
                                </div>
                            </div>
                        ))}

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <p className="text-lg font-serif text-[#D4AF37] mb-1">
                            Un écosystème en construction
                        </p>
                        <p className="text-sm text-gray-400 max-w-lg">
                            Experts, associations, créateurs et citoyens engagés rejoignent le mouvement.
                            Faites partie des pionniers de l'ECHOSystem.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
};
