import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Check } from 'lucide-react';

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
}

interface CityDisplay {
    city: string;
    detail: string;
    country: string;
    raw: NominatimResult;
}

interface CityAutocompleteProps {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    value?: string;
    onChange?: (city: string) => void;
}

function extractCity(addr: Record<string, string>): string {
    return addr.city || addr.town || addr.village || addr.municipality || '';
}

export function CityAutocomplete({ label, name, placeholder, required, value: controlledValue, onChange }: CityAutocompleteProps) {
    const [query, setQuery] = useState(controlledValue || '');
    const [suggestions, setSuggestions] = useState<CityDisplay[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const knownCitiesRef = useRef<Set<string>>(new Set());

    // Update custom validity — only block if suggestions were loaded but user didn't pick one.
    // If API failed (no suggestions ever loaded), allow manual entry (no blocking).
    const hasSuggestionsLoaded = useRef(false);
    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        if (!isValidated && query.trim().length > 0 && hasSuggestionsLoaded.current) {
            input.setCustomValidity('Veuillez sélectionner une ville dans la liste');
        } else {
            input.setCustomValidity('');
        }
    }, [isValidated, query]);

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

    const checkExactMatch = useCallback((value: string) => {
        const lower = value.trim().toLowerCase();
        if (knownCitiesRef.current.has(lower)) {
            setIsValidated(true);
            return true;
        }
        return false;
    }, []);

    const searchCities = async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=10`,
                { headers: { 'User-Agent': 'MouvementECHO/1.0' } },
            );
            if (res.ok) {
                const data: NominatimResult[] = await res.json();
                // Extract city from each result, deduplicate by city+country
                const seen = new Set<string>();
                const results: CityDisplay[] = [];
                for (const item of data.slice(0, 10)) {
                    const addr = item.address || {};
                    const city = extractCity(addr);
                    if (!city) continue;
                    const country = addr.country || '';
                    const key = `${city.toLowerCase()}|${country.toLowerCase()}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    // Remember this city for exact-match validation
                    knownCitiesRef.current.add(city.toLowerCase());
                    const region = addr.county || addr.state || '';
                    const parts = [city, region, country].filter(Boolean);
                    results.push({
                        city,
                        detail: parts.join(', '),
                        country,
                        raw: item,
                    });
                }
                setSuggestions(results.slice(0, 5));
                setIsOpen(results.length > 0);
                if (results.length > 0) hasSuggestionsLoaded.current = true;

                // Check if current query exactly matches a returned city
                checkExactMatch(q);
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

        // Invalidate until re-selected or exact match found
        setIsValidated(false);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchCities(val), 300);
    };

    const handleSelect = (item: CityDisplay) => {
        setQuery(item.city);
        onChange?.(item.city);
        setIsOpen(false);
        setSuggestions([]);
        setIsValidated(true);
    };

    // Determine border/ring style based on validation state
    const borderClass = !isValidated && query.trim().length > 0
        ? 'border-amber-500/60 focus:border-amber-500/80 focus:ring-amber-500/40'
        : isValidated
            ? 'border-emerald-500/50 focus:border-emerald-500/60 focus:ring-emerald-500/30'
            : 'border-white/10 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/30';

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
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
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-colors ${borderClass}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-neutral-500 border-t-[#D4AF37] rounded-full animate-spin" />
                    ) : isValidated ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : null}
                </div>
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
                                <span className="truncate">{s.detail}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
