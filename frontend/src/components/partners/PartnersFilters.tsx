import React from 'react';
import { Search, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { Input } from '../ui/Input';
import type { PartnerCategory } from './PartnerCard';
import type { Thematic } from './ThematicTag';

interface PartnersFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: PartnerCategory | '';
    setSelectedCategory: (category: PartnerCategory | '') => void;
    selectedThematics: string[];
    setSelectedThematics: (thematics: string[]) => void;
    thematicsList: Thematic[];
}

const CATEGORIES: { value: PartnerCategory | '', label: string }[] = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'expert', label: 'Experts (Académique, ONG...)' },
    { value: 'financier', label: 'Financiers (Mécènes, Investisseurs)' },
    { value: 'audiovisuel', label: 'Audiovisuel (Studios, Matériel)' },
    { value: 'education', label: 'Éducation (Écoles, Musées)' },
    { value: 'membre', label: 'Membres ECHO' },
];

export const PartnersFilters: React.FC<PartnersFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedThematics,
    setSelectedThematics,
    thematicsList,
}) => {
    const toggleThematic = (code: string) => {
        if (selectedThematics.includes(code)) {
            setSelectedThematics(selectedThematics.filter(c => c !== code));
        } else {
            setSelectedThematics([...selectedThematics, code]);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

                {/* Search */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Partenaire, membre, ville..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pb-0 pt-0 h-10 w-full bg-white/5 border-white/10"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                    <select
                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-echo-gold/50 appearance-none"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as PartnerCategory | '')}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value} className="bg-echo-darker">
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Thematics */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Filtrer par thématiques</label>
                <div className="flex flex-wrap gap-2">
                    {thematicsList.map(t => {
                        const isSelected = selectedThematics.includes(t.code);
                        return (
                            <button
                                key={t.code}
                                onClick={() => toggleThematic(t.code)}
                                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all
                  ${isSelected
                                        ? 'bg-echo-gold/20 text-echo-gold border border-echo-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                                    }
                `}
                            >
                                <div
                                    className={`w-2 h-2 rounded-full ${isSelected ? 'animate-pulse' : ''}`}
                                    style={{ backgroundColor: t.color }}
                                />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export const PartnersViewSwitch: React.FC<{
    view: 'grid' | 'map';
    setView: (view: 'grid' | 'map') => void;
}> = ({ view, setView }) => {
    return (
        <div className="flex items-center justify-end mb-6">
            <div className="inline-flex bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-md">
                <button
                    onClick={() => setView('grid')}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${view === 'grid'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
          `}
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Liste</span>
                </button>
                <button
                    onClick={() => setView('map')}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${view === 'map'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
          `}
                >
                    <MapIcon className="w-4 h-4" />
                    <span>Carte</span>
                </button>
            </div>
        </div>
    );
};
