/**
 * Utilities for handling product location data normalization and validation
 */

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
export const normalizeLocation = (location: string | null | undefined): LocationType => {
    if (!location) return 'other';

    const loc = location.toLowerCase().trim();

    // Handle common variations
    if (/rest|resto|dining/.test(loc)) return 'restaurant';
    if (/bakery|bake|bread|pastry/.test(loc)) return 'bakery';
    if (/store|shop|retail/.test(loc)) return 'store';
    if (/warehouse|storage|inventory/.test(loc)) return 'warehouse';

    // Return as-is if it matches a known type
    if (LOCATION_TYPES.includes(loc as LocationType)) {
        return loc as LocationType;
    }

    return 'other';
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