import { normalizeLocation } from './locationUtils';

// ... (keep your existing database service code)

async getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(product => ({
      ...product,
      // Ensure numeric fields are numbers
      quantity: Number(product.quantity) || 0,
      minQuantity: Number(product.minQuantity) || 0,
      price: Number(product.price) || 0,
      // Normalize location
      location: normalizeLocation(product.location)
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    const localProducts = storage.getProducts() || [];
    return localProducts.map(p => ({
      ...p,
      quantity: Number(p.quantity) || 0,
      minQuantity: Number(p.minQuantity) || 0,
      price: Number(p.price) || 0,
      location: normalizeLocation(p.location)
    }));
  }
}

async getProductsByLocation(location: 'restaurant' | 'bakery'): Promise<Product[]> {
  try {
    const allProducts = await this.getProducts();
    return allProducts.filter(p => p.location === location);
  } catch (error) {
    console.error(`Error getting ${location} products:`, error);
    return [];
  }
}