import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
}

interface AddressSuggestion {
    display: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    latitude: number;
    longitude: number;
}

export interface AddressData {
    address: string;
    city: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
}

interface AddressAutocompleteProps {
    value?: string;
    onChange?: (value: string) => void;
    onSelect?: (data: AddressData) => void;
    placeholder?: string;
    className?: string;
}

function extractCity(addr: Record<string, string>): string {
    return addr.city || addr.town || addr.village || addr.municipality || '';
}

function extractStreet(addr: Record<string, string>, displayName: string): string {
    const parts: string[] = [];
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);
    if (parts.length > 0) return parts.join(' ');
    // Fallback: use the first part of display_name before the city
    const city = extractCity(addr);
    if (city && displayName.includes(city)) {
        const beforeCity = displayName.split(city)[0].trim().replace(/,\s*$/, '');
        if (beforeCity) return beforeCity;
    }
    return '';
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, className }: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync with external value
    useEffect(() => {
        if (value !== undefined && value !== query) {
            setQuery(value);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

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

    const searchAddresses = async (q: string) => {
        if (q.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&countrycodes=fr&limit=6`,
                { headers: { 'User-Agent': 'MouvementECHO/1.0' } },
            );
            if (res.ok) {
                const data: NominatimResult[] = await res.json();
                const results: AddressSuggestion[] = [];
                for (const item of data) {
                    const addr = item.address || {};
                    const city = extractCity(addr);
                    if (!city) continue;

                    const street = extractStreet(addr, item.display_name);
                    const postalCode = addr.postcode || '';
                    const country = addr.country || 'France';

                    // Build a readable display name
                    const displayParts = [street, city, postalCode].filter(Boolean);
                    const display = displayParts.join(', ');

                    results.push({
                        display,
                        address: street || city,
                        city,
                        postalCode,
                        country,
                        latitude: parseFloat(item.lat),
                        longitude: parseFloat(item.lon),
                    });
                }
                setSuggestions(results.slice(0, 5));
                setIsOpen(results.length > 0);
            }
        } catch {
            // Silently fail
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onChange?.(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchAddresses(val), 350);
    };

    const handleSelect = (item: AddressSuggestion) => {
        setQuery(item.address);
        onChange?.(item.address);
        onSelect?.({
            address: item.address,
            city: item.city,
            postal_code: item.postalCode,
            country: item.country,
            latitude: item.latitude,
            longitude: item.longitude,
        });
        setIsOpen(false);
        setSuggestions([]);
    };

    const inputClass = className ||
        'w-full text-sm text-white bg-white/5 border border-white/10 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-echo-gold/50';

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={inputClass}
                />
                {isLoading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-neutral-500 border-t-[#D4AF37] rounded-full animate-spin" />
                    </div>
                )}
            </div>
            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-[9999] w-full mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[280px]">
                    {suggestions.map((s, i) => (
                        <li key={i}>
                            <button
                                type="button"
                                onClick={() => handleSelect(s)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                            >
                                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                <span className="truncate">{s.display}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
