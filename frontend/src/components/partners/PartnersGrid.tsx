import React from 'react';
import type { Partner } from './PartnerCard';
import { PartnerCard } from './PartnerCard';

interface PartnersGridProps {
    partners: Partner[];
    onPartnerClick: (partner: Partner) => void;
    isLoading?: boolean;
}

export const PartnersGrid: React.FC<PartnersGridProps> = ({
    partners,
    onPartnerClick,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-80 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
            </div>
        );
    }

    if (partners.length === 0) {
        return (
            <div className="py-20 text-center">
                <h3 className="text-xl font-serif text-white mb-2">Aucun partenaire trouvé</h3>
                <p className="text-gray-400">
                    Essayez de modifier vos filtres pour voir plus de résultats.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partners.map((partner) => (
                <PartnerCard
                    key={partner.id}
                    partner={partner}
                    onClick={onPartnerClick}
                />
            ))}
        </div>
    );
};
