/**
 * Utility to offset overlapping markers at the same coordinates.
 * When multiple markers share the same city/location, they get spread
 * in a circle around the original point so all are visible and clickable.
 */

interface HasCoordinates {
    latitude: number;
    longitude: number;
}

/**
 * Groups items by their approximate location and applies a small circular offset
 * to items that would overlap. Returns a Map of index → offset [lat, lng].
 *
 * @param items Array of items with latitude/longitude
 * @param precision Decimal places to group by (4 = ~11m precision)
 * @param offsetRadius Offset in degrees (~0.005 ≈ 500m at France's latitude)
 */
export function computeMarkerOffsets<T extends HasCoordinates>(
    items: T[],
    precision = 2,
    offsetRadius = 0.012
): Map<number, [number, number]> {
    const offsets = new Map<number, [number, number]>();
    const groups = new Map<string, number[]>();

    // Group items by rounded coordinates
    items.forEach((item, index) => {
        const key = `${item.latitude.toFixed(precision)},${item.longitude.toFixed(precision)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(index);
    });

    // Apply circular offset to groups with 2+ items
    groups.forEach((indices) => {
        if (indices.length < 2) return;

        const angleStep = (2 * Math.PI) / indices.length;
        indices.forEach((idx, i) => {
            const angle = angleStep * i - Math.PI / 2; // Start from top
            const latOffset = offsetRadius * Math.cos(angle);
            const lngOffset = offsetRadius * Math.sin(angle);
            offsets.set(idx, [latOffset, lngOffset]);
        });
    });

    return offsets;
}
