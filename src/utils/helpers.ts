
/**
 * Haversine formula to calculate the distance between two points on Earth in km.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Formats a string to match the Brazilian license plate mask (AAA-1234 or AAA-1A23).
 */
export const formatPlate = (value: string): string => {
    const raw = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (raw.length > 3) {
        return `${raw.slice(0, 3)}-${raw.slice(3, 7)}`;
    }
    return raw.slice(0, 3);
};
