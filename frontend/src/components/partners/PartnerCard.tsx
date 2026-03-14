import React from 'react';
import { Card } from '../ui/Card';
import { MapPin, ExternalLink, Mail, Phone } from 'lucide-react';
import { ThematicTag } from './ThematicTag';

export type PartnerCategory = 'expert' | 'financier' | 'audiovisuel' | 'education' | 'membre';
export type ContractStatus = 'accord_principe' | 'en_attente_contrat' | 'contractualise';

export interface Partner {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    description: string;
    description_long?: string;
    category: PartnerCategory;
    thematics: string[];
    city: string;
    country: string;
    is_featured?: boolean;
    contract_status?: ContractStatus | null;
    latitude?: number;
    longitude?: number;
    // Contact
    contact_name?: string;
    contact_role?: string;
    contact_email?: string;
    contact_phone?: string;
    // Location
    address?: string;
    postal_code?: string;
    // Social
    website_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
}

interface PartnerCardProps {
    partner: Partner;
    onClick: (partner: Partner) => void;
}

const categoryLabels: Record<PartnerCategory, { label: string, color: string, emoji: string }> = {
    expert: { label: 'Expert', color: '#D4AF37', emoji: '🎓' },
    financier: { label: 'Financier', color: '#10B981', emoji: '💰' },
    audiovisuel: { label: 'Audiovisuel', color: '#3B82F6', emoji: '🎬' },
    education: { label: 'Éducation', color: '#8B5CF6', emoji: '📚' },
    membre: { label: 'Membre', color: '#DC143C', emoji: '🤝' },
};

export const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onClick }) => {
    const catConfig = categoryLabels[partner.category] || categoryLabels.expert;

    // Only show first 3 thematics to save space
    const displayThematics = partner.thematics.slice(0, 3);
    const extraThematicsCount = Math.max(0, partner.thematics.length - 3);

    return (
        <Card
            variant="glass"
            className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] h-full flex flex-col"
            onClick={() => onClick(partner)}
        >
            {/* Category Left Border */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
                style={{ backgroundColor: catConfig.color, boxShadow: `0 0 10px ${catConfig.color}40` }}
            />

            <div className="p-5 flex-1 flex flex-col">
                {/* Header: Logo & Name */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                        {partner.logo_url ? (
                            <img src={partner.logo_url} alt={`Logo ${partner.name}`} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-serif text-echo-gold">
                                {partner.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-white line-clamp-2 group-hover:text-echo-gold transition-colors">
                            {partner.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            <div
                                className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                                style={{ color: catConfig.color }}
                            >
                                <span>{catConfig.emoji}</span>
                                <span className="font-medium">{catConfig.label}</span>
                            </div>
                            {partner.contract_status === 'accord_principe' && (
                                <div className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                                    Accord de principe
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 line-clamp-3 mb-5 flex-1 leading-relaxed">
                    {partner.description}
                </p>

                {/* Thematics Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-white/5">
                    {displayThematics.map(t => (
                        <ThematicTag key={t} thematic={t} />
                    ))}
                    {extraThematicsCount > 0 && (
                        <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400">
                            +{extraThematicsCount}
                        </div>
                    )}
                </div>

                {/* Location & Action */}
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{partner.city}{partner.country !== 'France' ? `, ${partner.country}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-1 text-echo-gold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Voir profil</span>
                        <ExternalLink className="w-3 h-3" />
                    </div>
                </div>

                {/* Contact direct */}
                {(partner.contact_email || partner.contact_phone) && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {partner.contact_email && (
                            <a href={`mailto:${partner.contact_email}`} className="flex items-center gap-1 hover:text-echo-gold transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Mail className="w-3.5 h-3.5" />
                                <span>Email</span>
                            </a>
                        )}
                        {partner.contact_phone && (
                            <a href={`tel:${partner.contact_phone}`} className="flex items-center gap-1 hover:text-echo-gold transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Phone className="w-3.5 h-3.5" />
                                <span>Appeler</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
