/**
 * Utilities for handling product location data normalization and validation
 */

type LocationType = 'restaurant' | 'bakery' | 'other';

export type LocationType = 'restaurant' | 'bakery' | 'store' | 'warehouse' | 'other';

export const LOCATION_TYPES: readonly LocationType[] = [
    'restaurant',
    'bakery',
    'store',
    'warehouse',
    'other'
] as const;

/**
 * Normalizes location strings to standard types
 * @param location Raw location string from database
 * @returns Normalized location type
 */

export const normalizeLocation = (location: string | undefined | null): LocationType => {
    if (!location) return 'other';

    const loc = location.toLowerCase().trim();

    if (loc.includes('restaurant') || loc.includes('rest') || loc.includes('dining')) {
        return 'restaurant';
    }

    if (loc.includes('bakery') || loc.includes('bake') || loc.includes('bread')) {
        return 'bakery';
    }

    return 'other';
};

export const filterByLocation = (products: Product[], location: LocationType): Product[] => {
    return products.filter(product => {
        const productLocation = normalizeLocation(product.location);
        return productLocation === location;
    });
};

/**
 * Validates if a string is a known location type
 */
export const isValidLocation = (location: string): location is LocationType => {
    return LOCATION_TYPES.includes(location as LocationType);
};

/**
 * Gets all possible location values from an array of products
 */
export const getAllLocations = (products: Product[]): LocationType[] => {
    const locations = new Set<LocationType>();
    products.forEach(product => {
        locations.add(normalizeLocation(product.location));
    });
    return Array.from(locations);
};