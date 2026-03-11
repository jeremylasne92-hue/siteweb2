import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Partner, PartnerCategory } from './PartnerCard';
import { ExternalLink, MapPin, Mail, Phone } from 'lucide-react';

interface PartnersMapProps {
    partners: Partner[];
    onPartnerClick: (partner: Partner) => void;
}

// Marker colors
const categoryColors: Record<PartnerCategory, string> = {
    expert: '#D4AF37',       // Gold
    financier: '#10B981',    // Green
    audiovisuel: '#3B82F6',  // Blue
    education: '#8B5CF6',    // Purple
    membre: '#DC143C',       // Red
};

// Create custom SVG markers
const createCustomIcon = (category: PartnerCategory) => {
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
        popupAnchor: [0, -40],
    });
};

export const PartnersMap: React.FC<PartnersMapProps> = ({ partners, onPartnerClick }) => {
    // Center map on France roughly
    const defaultCenter: [number, number] = [46.603354, 1.888334];
    const defaultZoom = 6;

    // Memoize icons to prevent recreation on every render
    const icons = useMemo(() => {
        const iconCache = {} as Record<string, L.DivIcon>;
        return (category: PartnerCategory) => {
            if (!iconCache[category]) {
                iconCache[category] = createCustomIcon(category);
            }
            return iconCache[category];
        };
    }, []);

    return (
        <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-lg relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                scrollWheelZoom={true}
                className="w-full h-full bg-[#121212]" // Dark background for the map loading state
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme tile layer
                />

                {partners.filter(p => p.latitude && p.longitude).map((partner) => (
                    <Marker
                        key={partner.id}
                        position={[partner.latitude!, partner.longitude!]}
                        icon={icons(partner.category)}
                    >
                        <Popup className="dark-popup">
                            <div className="min-w-[200px] p-2 bg-echo-darker text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    {partner.logo_url && (
                                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                            <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <h3 className="font-serif font-bold text-base leading-tight">
                                        {partner.name}
                                    </h3>
                                </div>

                                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                    {partner.description}
                                </p>

                                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{partner.city}</span>
                                </div>

                                {partner.contact_email && (
                                    <a href={`mailto:${partner.contact_email}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-echo-gold transition-colors mb-1" onClick={(e) => e.stopPropagation()}>
                                        <Mail className="w-3 h-3" />
                                        <span>{partner.contact_email}</span>
                                    </a>
                                )}
                                {partner.contact_phone && (
                                    <a href={`tel:${partner.contact_phone}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-echo-gold transition-colors mb-3" onClick={(e) => e.stopPropagation()}>
                                        <Phone className="w-3 h-3" />
                                        <span>{partner.contact_phone}</span>
                                    </a>
                                )}
                                {!partner.contact_email && !partner.contact_phone && (
                                    <div className="mb-3" />
                                )}

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onPartnerClick(partner);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-echo-gold/20 text-echo-gold border border-echo-gold/30 rounded-lg text-sm transition-colors"
                                >
                                    <span>Voir la fiche détaillée</span>
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Add custom styles for the Leaflet dark popup */}
            <style>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background-color: #121212;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .leaflet-popup-close-button {
          color: #9CA3AF !important;
        }
        .custom-leaflet-marker {
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
          transition: all 0.2s;
        }
        .custom-leaflet-marker:hover {
          transform: scale(1.1) translateY(-5px);
          z-index: 1000 !important;
        }
      `}</style>
        </div>
    );
};
