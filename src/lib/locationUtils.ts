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

export const normalizeProduct = (product: any) => {
    // Ensure location is standardized
    const location = product.location?.toString().toLowerCase().trim() || 'other';

    // Determine category based on location
    let category = 'other';
    if (location.includes('rest') || location.includes('dining')) category = 'restaurant';
    if (location.includes('bakery') || location.includes('bake')) category = 'bakery';

    return {
        ...product,
        quantity: Number(product.quantity) || 0,
        minQuantity: Number(product.minQuantity) || 0,
        price: Number(product.price) || 0,
        category, // This will be either 'restaurant', 'bakery', or 'other'
        originalLocation: location // Keep original for reference
    };
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