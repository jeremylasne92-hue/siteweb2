import { useState, useEffect, lazy, Suspense } from 'react';
import { PartnersHero } from '../components/partners/PartnersHero';
import { PartnersStats } from '../components/partners/PartnersStats';
import { PartnersFilters, PartnersViewSwitch } from '../components/partners/PartnersFilters';
import { PartnersGrid } from '../components/partners/PartnersGrid';
import { PartnerModal } from '../components/partners/PartnerModal';
import { MemberModal } from '../components/partners/MemberModal';
import { SEO } from '../components/seo/SEO';

// Lazy-load map component (Leaflet ~180 KB, only needed for map view)
const PartnersMap = lazy(() =>
    import('../components/partners/PartnersMap').then(m => ({ default: m.PartnersMap }))
);
import { PartnerFormModal } from '../components/partners/PartnerFormModal';
import { MembersSection } from '../components/partners/MembersSection';
import type { Partner, PartnerCategory } from '../components/partners/PartnerCard';
import type { Thematic } from '../components/partners/ThematicTag';
import type { MemberProfile } from '../types/member';
import { PARTNERS_API, MEMBERS_API } from '../config/api';

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [stats, setStats] = useState<{ total: number; by_category: Record<string, number> } | null>(null);
    const [thematicsList, setThematicsList] = useState<Thematic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [membersCount, setMembersCount] = useState(0);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PartnerCategory | ''>('');
    const [selectedThematics, setSelectedThematics] = useState<string[]>([]);
    const [view, setView] = useState<'grid' | 'map'>('grid');

    // Modal State
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleMemberClick = async (slug: string) => {
        if (!slug) return;
        try {
            const res = await fetch(`${MEMBERS_API}/${slug}`);
            if (res.ok) {
                setSelectedMember(await res.json());
            }
        } catch (err) {
            console.error("Failed to fetch member profile", err);
        }
    };

    // Fetch reference data on mount
    useEffect(() => {
        const fetchInitData = async () => {
            try {
                const [statsRes, thematicsRes, membersRes] = await Promise.all([
                    fetch(`${PARTNERS_API}/stats`),
                    fetch(`${PARTNERS_API}/thematics`),
                    fetch(`${MEMBERS_API}?limit=1`),
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (thematicsRes.ok) setThematicsList(await thematicsRes.json());
                if (membersRes.ok) {
                    const data = await membersRes.json();
                    setMembersCount(data.total || 0);
                }
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
        <>
            <SEO
                title="L'Écosystème"
                description="Découvrez l'ECHOSystem : un réseau de partenaires engagés qui tentent de changer positivement ce monde."
                url="https://mouvement-echo.fr/partenaires"
            />
            <PartnersHero onApplyClick={() => setIsFormOpen(true)} />

            <PartnersStats stats={stats} membersCount={membersCount} />

            <div id="cartographie" className="max-w-7xl mx-auto px-6 lg:px-8 pb-32 z-10 relative">
                <h2 className="text-2xl sm:text-3xl font-serif text-white mb-8 text-center">Cartographie des Partenaires</h2>
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
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-[500px]">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
                            </div>
                        }>
                            <PartnersMap
                                partners={partners}
                                onPartnerClick={setSelectedPartner}
                            />
                        </Suspense>
                    )}
                </div>
            </div>

            <MembersSection onMemberClick={handleMemberClick} />

            <PartnerModal
                partner={selectedPartner}
                isOpen={!!selectedPartner}
                onClose={() => setSelectedPartner(null)}
            />

            <MemberModal
                member={selectedMember}
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
            />

            <PartnerFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                thematicsList={thematicsList}
            />
        </>
    );
}
