import React from 'react';
import { Leaf, Users, TrendingUp, GraduationCap, Cpu, Heart, Palette, Globe, Sparkles, Wheat, Tag } from 'lucide-react';
import { cn } from '../ui/Button';

// Ref matching backend ThematicRef
export interface Thematic {
    code: string;
    label: string;
    color: string;
    icon: string;
}

interface ThematicTagProps {
    thematic: string | Thematic;
    size?: 'sm' | 'md';
    className?: string;
}

const iconMap: Record<string, React.FC<any>> = {
    Leaf, Users, TrendingUp, GraduationCap, Cpu, Heart, Palette, Globe, Sparkles, Wheat, Tag
};

// Fallback if we only have the code and no full thematic object
const fallbackThematics: Record<string, Partial<Thematic>> = {
    ENV: { label: 'Environnement', color: '#10B981', icon: 'Leaf' },
    SOC: { label: 'Social', color: '#EF4444', icon: 'Users' },
    ECO: { label: 'Économie', color: '#F59E0B', icon: 'TrendingUp' },
    EDU: { label: 'Éducation', color: '#8B5CF6', icon: 'GraduationCap' },
    TEC: { label: 'Tech & IA', color: '#3B82F6', icon: 'Cpu' },
    SAN: { label: 'Santé', color: '#EC4899', icon: 'Heart' },
    ART: { label: 'Art', color: '#D4AF37', icon: 'Palette' },
    GEO: { label: 'Géopolitique', color: '#6366F1', icon: 'Globe' },
    SPI: { label: 'Spiritualité', color: '#A855F7', icon: 'Sparkles' },
    AGR: { label: 'Agriculture', color: '#84CC16', icon: 'Wheat' },
};

export const ThematicTag: React.FC<ThematicTagProps> = ({
    thematic,
    size = 'sm',
    className
}) => {
    // Determine if we got a string code or a full thematic object
    const code = typeof thematic === 'string' ? thematic : thematic.code;

    // Try to use the full object, or fallback to known data, or generic
    const data = typeof thematic === 'object'
        ? thematic
        : (fallbackThematics[code] || { label: code, color: '#9CA3AF', icon: 'Tag' });

    // Load the icon from explicit map
    const IconComponent = iconMap[data.icon || 'Tag'] || Tag;

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5",
                "transition-colors hover:bg-white/10",
                size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
                className
            )}
            title={data.label}
        >
            <IconComponent
                className={size === 'sm' ? "w-3 h-3" : "w-4 h-4"}
                style={{ color: data.color }}
            />
            <span className="text-gray-300">{data.label}</span>
        </div>
    );
};
