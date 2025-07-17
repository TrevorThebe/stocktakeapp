import { supabase } from './supabase';
import { storage } from './storage';

interface Product {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price: number;
  location: string;
  created_at?: string;
  updated_at?: string;
}

export const databaseService = {
  // ... (keep your other methods)

  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Validate and normalize product data
      return (data || []).map(product => ({
        ...product,
        location: product.location?.toLowerCase().trim() || 'unknown',
        quantity: Number(product.quantity) || 0,
        minQuantity: Number(product.minQuantity) || 0,
        price: Number(product.price) || 0
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to local storage with normalization
      const localProducts = storage.getProducts() || [];
      return localProducts.map(product => ({
        ...product,
        location: product.location?.toLowerCase().trim() || 'unknown',
        quantity: Number(product.quantity) || 0,
        minQuantity: Number(product.minQuantity) || 0,
        price: Number(product.price) || 0
      }));
    }
  },

  // ... (keep your other methods)
};