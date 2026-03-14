import React from 'react';
import { Modal } from '../ui/Modal';
import { PROJECT_LABELS, EXPERIENCE_LABELS } from '../../config/candidatures';
import type { MemberProfile, SocialPlatform } from '../../types/member';
import {
    MapPin, Mail, Globe, Linkedin, Instagram, Twitter,
    Youtube, Github, Facebook, ExternalLink, Calendar, Briefcase, Clock,
} from 'lucide-react';

const SOCIAL_ICONS: Record<SocialPlatform, typeof Globe> = {
    website: Globe, linkedin: Linkedin, instagram: Instagram, twitter: Twitter,
    youtube: Youtube, github: Github, facebook: Facebook,
    tiktok: ExternalLink, behance: ExternalLink, vimeo: ExternalLink, other: ExternalLink,
};

const SOCIAL_COLORS: Partial<Record<SocialPlatform, string>> = {
    linkedin: '#0A66C2', instagram: '#E1306C', twitter: '#1DA1F2',
    youtube: '#FF0000', github: '#FFFFFF', facebook: '#1877F2', tiktok: '#00F2EA',
};

const AVAILABILITY_LABELS: Record<string, string> = {
    punctual: 'Ponctuel',
    regular: 'Régulier',
    active: 'Très actif',
};

interface MemberModalProps {
    member: MemberProfile | null;
    isOpen: boolean;
    onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ member, isOpen, onClose }) => {
    if (!member) return null;

    const project = PROJECT_LABELS[member.project] || PROJECT_LABELS.benevole;
    const color = project.color;

    const joinedDate = new Date(member.joined_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-2xl p-0 overflow-hidden"
        >
            {/* Top color border */}
            <div className="h-2 w-full" style={{ backgroundColor: color }} />

            <div className="p-6 md:p-8">
                {/* Header: Avatar + Name + Project Badge */}
                <div className="flex items-start gap-4 mb-6">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-xl font-bold overflow-hidden"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        {member.avatar_url ? (
                            <img
                                src={member.avatar_url}
                                alt={member.display_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            member.display_name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-serif font-bold text-white leading-tight">
                            {member.display_name}
                        </h2>
                        {member.role_title && (
                            <p className="text-sm text-neutral-400 mt-0.5">{member.role_title}</p>
                        )}
                        <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mt-2"
                            style={{ backgroundColor: `${color}20`, color }}
                        >
                            {project.label}
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {member.bio && (
                    <div className="mb-6">
                        <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {member.bio}
                        </p>
                    </div>
                )}

                {/* Skills */}
                {member.skills.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Compétences
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {member.skills.map(skill => (
                                <span
                                    key={skill}
                                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-neutral-300 border border-white/10"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Grid */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                    {member.city && (
                        <div className="flex items-center gap-2.5 text-sm text-neutral-400 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
                            <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                            <span>{member.city}{member.region ? `, ${member.region}` : ''}</span>
                        </div>
                    )}
                    {member.experience_level && (
                        <div className="flex items-center gap-2.5 text-sm text-neutral-400 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
                            <Briefcase className="w-4 h-4 text-neutral-500 shrink-0" />
                            <span>{EXPERIENCE_LABELS[member.experience_level] || member.experience_level}</span>
                        </div>
                    )}
                    {member.availability && (
                        <div className="flex items-center gap-2.5 text-sm text-neutral-400 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
                            <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                            <span>{AVAILABILITY_LABELS[member.availability] || member.availability}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2.5 text-sm text-neutral-400 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
                        <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span>Membre depuis {joinedDate}</span>
                    </div>
                </div>

                {/* Contact Email */}
                {member.contact_email && (
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Contact
                        </h4>
                        <a
                            href={`mailto:${member.contact_email}`}
                            className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
                        >
                            <Mail className="w-4 h-4 text-neutral-500" />
                            {member.contact_email}
                        </a>
                    </div>
                )}

                {/* Social Links */}
                {member.social_links.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Réseaux
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {member.social_links.map((link) => {
                                const Icon = SOCIAL_ICONS[link.platform] || ExternalLink;
                                const platformColor = SOCIAL_COLORS[link.platform];
                                return (
                                    <a
                                        key={`${link.platform}-${link.url}`}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={link.label || link.platform}
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                        style={{
                                            backgroundColor: platformColor ? `${platformColor}15` : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${platformColor ? `${platformColor}30` : 'rgba(255,255,255,0.1)'}`,
                                            color: platformColor || '#9CA3AF',
                                        }}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
