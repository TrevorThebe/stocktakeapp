export const normalizeProduct = (product: any) => {
    // Standardize location handling
    const location = product.location?.toString().trim().toLowerCase() || 'other';

    let category = 'other';
    if (location.includes('restaurant') || location.includes('rest') || location.includes('dining')) {
        category = 'restaurant';
    } else if (location.includes('bakery') || location.includes('bake') || location.includes('bread')) {
        category = 'bakery';
    }

    return {
        ...product,
        quantity: Number(product.quantity) || 0,
        minQuantity: Number(product.minQuantity) || 5, // Default minimum
        price: Number(product.price) || 0,
        category,
        originalLocation: location
    };
};