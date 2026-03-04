import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { PartnersHero } from '../components/partners/PartnersHero';
import { PartnersStats } from '../components/partners/PartnersStats';
import { PartnersFilters, PartnersViewSwitch } from '../components/partners/PartnersFilters';
import { PartnersGrid } from '../components/partners/PartnersGrid';
import { PartnersMap } from '../components/partners/PartnersMap';
import { PartnerModal } from '../components/partners/PartnerModal';
import { PartnerFormModal } from '../components/partners/PartnerFormModal';
import type { Partner, PartnerCategory } from '../components/partners/PartnerCard';
import type { Thematic } from '../components/partners/ThematicTag';
import { PARTNERS_API } from '../config/api';

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [thematicsList, setThematicsList] = useState<Thematic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PartnerCategory | ''>('');
    const [selectedThematics, setSelectedThematics] = useState<string[]>([]);
    const [view, setView] = useState<'grid' | 'map'>('grid');

    // Modal State
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Fetch reference data on mount
    useEffect(() => {
        const fetchInitData = async () => {
            try {
                const [statsRes, thematicsRes] = await Promise.all([
                    fetch(`${PARTNERS_API}/stats`),
                    fetch(`${PARTNERS_API}/thematics`)
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (thematicsRes.ok) setThematicsList(await thematicsRes.json());
            } catch (err) {
                console.error("Failed to fetch initial partner data", err);
            }
        };

        fetchInitData();
    }, []);

    // Fetch partners when filters change
    useEffect(() => {
        const fetchPartners = async () => {
            setIsLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (selectedCategory) queryParams.append('category', selectedCategory);
                if (selectedThematics.length > 0) queryParams.append('thematic', selectedThematics.join(','));
                if (searchQuery) queryParams.append('search', searchQuery);

                const res = await fetch(`${PARTNERS_API}?${queryParams.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setPartners(data.partners);
                }
            } catch (err) {
                console.error("Failed to fetch partners", err);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce search
        const timer = setTimeout(() => {
            fetchPartners();
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedCategory, selectedThematics, searchQuery]);

    return (
        <Layout>
            <PartnersHero onApplyClick={() => setIsFormOpen(true)} />

            <PartnersStats stats={stats} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-32 z-10 relative">
                <PartnersFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedThematics={selectedThematics}
                    setSelectedThematics={setSelectedThematics}
                    thematicsList={thematicsList}
                />

                <PartnersViewSwitch view={view} setView={setView} />

                <div className="mt-6">
                    {view === 'grid' ? (
                        <PartnersGrid
                            partners={partners}
                            isLoading={isLoading}
                            onPartnerClick={setSelectedPartner}
                        />
                    ) : (
                        <PartnersMap
                            partners={partners}
                            onPartnerClick={setSelectedPartner}
                        />
                    )}
                </div>
            </div>

            <PartnerModal
                partner={selectedPartner}
                isOpen={!!selectedPartner}
                onClose={() => setSelectedPartner(null)}
            />

            <PartnerFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                thematicsList={thematicsList}
            />
        </Layout>
    );
}
