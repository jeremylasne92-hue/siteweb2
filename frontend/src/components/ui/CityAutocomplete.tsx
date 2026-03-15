import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface CitySuggestion {
    display_name: string;
    name: string;
    lat: string;
    lon: string;
}

interface CityAutocompleteProps {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    value?: string;
    onChange?: (city: string) => void;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export function CityAutocomplete({ label, name, placeholder, required, value: controlledValue, onChange }: CityAutocompleteProps) {
    const [query, setQuery] = useState(controlledValue || '');
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const searchCities = async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                q,
                country: 'France',
                format: 'json',
                limit: '5',
                addressdetails: '1',
                featuretype: 'city',
            });
            const res = await fetch(`${NOMINATIM_URL}?${params}`, {
                headers: { 'User-Agent': 'MouvementECHO/1.0' },
            });
            if (res.ok) {
                const data: CitySuggestion[] = await res.json();
                // Filter to only show relevant results and deduplicate by name
                const seen = new Set<string>();
                const filtered = data.filter(item => {
                    const cityName = item.name || item.display_name.split(',')[0].trim();
                    if (seen.has(cityName.toLowerCase())) return false;
                    seen.add(cityName.toLowerCase());
                    return true;
                });
                setSuggestions(filtered);
                setIsOpen(filtered.length > 0);
            }
        } catch {
            // Silently fail — user can still type manually
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onChange?.(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchCities(val), 300);
    };

    const handleSelect = (suggestion: CitySuggestion) => {
        const cityName = suggestion.name || suggestion.display_name.split(',')[0].trim();
        setQuery(cityName);
        onChange?.(cityName);
        setIsOpen(false);
        setSuggestions([]);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    required={required}
                    minLength={2}
                    maxLength={100}
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-colors"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-neutral-500 border-t-[#D4AF37] rounded-full animate-spin" />
                    </div>
                )}
            </div>
            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    {suggestions.map((s, i) => (
                        <li key={i}>
                            <button
                                type="button"
                                onClick={() => handleSelect(s)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                            >
                                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                <span className="truncate">{s.display_name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
