import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Sync filter state with URL query params.
 * Pass a memoized defaults object (useMemo or module-level const) to avoid re-render loops.
 *
 * Usage:
 *   const FILTER_DEFAULTS = useMemo(() => ({ status: 'all', project: 'all' }), []);
 *   const [filters, setFilter] = useUrlFilters(FILTER_DEFAULTS);
 */
export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => {
        const result = { ...defaults } as T;
        for (const key of Object.keys(defaults)) {
            const value = searchParams.get(key);
            if (value !== null) {
                (result as Record<string, string>)[key] = value;
            }
        }
        return result;
    }, [searchParams, defaults]);

    const setFilter = useCallback((key: keyof T & string, value: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === '' || value === defaults[key]) {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            return next;
        }, { replace: true });
    }, [setSearchParams, defaults]);

    return [filters, setFilter] as const;
}
