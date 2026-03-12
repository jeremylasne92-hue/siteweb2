import React from 'react';
import { Modal } from '../ui/Modal';
import type { Partner, PartnerCategory } from './PartnerCard';
import { ThematicTag } from './ThematicTag';
import { MapPin, Globe, User, Mail, Phone, Linkedin, Instagram, Twitter, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useEffect } from 'react';

interface PartnerModalProps {
    partner: Partner | null;
    isOpen: boolean;
    onClose: () => void;
}

const categoryColors: Record<PartnerCategory, string> = {
    expert: '#D4AF37',
    financier: '#10B981',
    audiovisuel: '#3B82F6',
    education: '#8B5CF6',
    membre: '#DC143C',
};

// Reuse simple custom icon for the minimap
const createMiniIcon = (category: PartnerCategory) => {
    const color = categoryColors[category] || '#D4AF37';
    const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  `;
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: svgIcon,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
    });
};

export const PartnerModal: React.FC<PartnerModalProps> = ({ partner, isOpen, onClose }) => {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        if (isOpen && partner) {
            trackEvent('partner', 'partner_view', partner.id);
        }
    }, [isOpen, partner, trackEvent]);

    if (!partner) return null;

    const color = categoryColors[partner.category] || categoryColors.expert;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-4xl p-0 overflow-hidden"
        >
            {/* Top Graphic Border */}
            <div className="h-2 w-full" style={{ backgroundColor: color }} />

            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                {/* Left Column (Sticky Sidebar) */}
                <div className="w-full md:w-1/3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10 bg-white/5 overflow-y-auto custom-scrollbar">

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {partner.logo_url ? (
                                <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-serif text-white">
                                    {partner.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <div
                                className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                                style={{ backgroundColor: `${color}20`, color: color }}
                            >
                                {partner.category}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-white mb-4 leading-tight">
                        {partner.name}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {partner.thematics.map(t => (
                            <ThematicTag key={t} thematic={t} />
                        ))}
                    </div>

                    <div className="space-y-6">
                        {/* Contact Person */}
                        {partner.contact_name && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Référent</h4>
                                <div className="flex items-start gap-3 text-sm text-gray-300">
                                    <User className="w-4 h-4 text-gray-500 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-white">{partner.contact_name}</div>
                                        {partner.contact_role && <div className="text-gray-400">{partner.contact_role}</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Contact</h4>
                            <ul className="space-y-3">
                                {partner.contact_email && (
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <a href={`mailto:${partner.contact_email}`} className="hover:text-echo-gold transition-colors">
                                            {partner.contact_email}
                                        </a>
                                    </li>
                                )}
                                {partner.contact_phone && (
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <a href={`tel:${partner.contact_phone}`} className="hover:text-echo-gold transition-colors">
                                            {partner.contact_phone}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Web & Social */}
                        {(partner.website_url || partner.linkedin_url || partner.instagram_url || partner.twitter_url) && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Réseaux</h4>
                                <div className="flex flex-wrap gap-3">
                                    {partner.website_url && (
                                        <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                                            <Globe className="w-4 h-4" />
                                        </a>
                                    )}
                                    {partner.linkedin_url && (
                                        <a href={partner.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {partner.twitter_url && (
                                        <a href={partner.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    )}
                                    {partner.instagram_url && (
                                        <a href={partner.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center text-[#E1306C] hover:bg-gradient-to-tr hover:from-[#F56040] hover:to-[#833AB4] hover:text-white transition-all">
                                            <Instagram className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Scrollable Content) */}
                <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto custom-scrollbar">

                    <div className="mb-10">
                        <h3 className="text-lg font-serif text-white mb-4">À propos</h3>
                        <div className="prose prose-invert max-w-none">
                            {/* Fallback to short description if long doesn't exist yet */}
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                                {partner.description_long || partner.description}
                            </p>
                        </div>
                    </div>

                    {/* Visiter le site */}
                    {partner.website_url && (
                        <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('partner', 'partner_click_website', partner.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 mb-10 rounded-lg text-sm font-medium transition-all"
                            style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}30`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}20`; }}
                        >
                            <Globe className="w-4 h-4" />
                            Visiter le site
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}

                    <div>
                        <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-echo-gold" />
                            <span>Localisation</span>
                        </h3>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                            <p className="text-gray-300">
                                {partner.address}<br />
                                {partner.city}, {partner.postal_code}<br />
                                {partner.country}
                            </p>
                        </div>

                        {/* Mini Map */}
                        {partner.latitude && partner.longitude && (
                            <div className="h-48 w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
                                <MapContainer
                                    center={[partner.latitude, partner.longitude]}
                                    zoom={14}
                                    zoomControl={false}
                                    dragging={false}
                                    scrollWheelZoom={false}
                                    className="w-full h-full bg-[#121212]"
                                >
                                    <TileLayer
                                        attribution='&copy; OpenStreetMap'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <Marker
                                        position={[partner.latitude, partner.longitude]}
                                        icon={createMiniIcon(partner.category)}
                                    />
                                </MapContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
