import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { databaseService } from '@/lib/database';
import { Product, ProductStats } from '@/types/product';
import { Package, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { normalizeLocation } from '@/lib/locationUtils';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    lowStockItems: 0,
    restaurantItems: 0,
    bakeryItems: 0,
    totalValue: 0,
    restaurantValue: 0,
    bakeryValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allProducts = await databaseService.getProducts();
      setProducts(allProducts);

      // Get location-specific products
      const [restaurantProducts, bakeryProducts] = await Promise.all([
        databaseService.getProductsByLocation('restaurant'),
        databaseService.getProductsByLocation('bakery')
      ]);

      // Calculate low stock items
      const lowStock = allProducts.filter(p => p.quantity <= p.minQuantity);

      // Calculate inventory values
      const calculateValue = (items: Product[]) =>
        items.reduce((sum, p) => sum + (p.price * p.quantity), 0);

      setStats({
        totalProducts: allProducts.length,
        lowStockItems: lowStock.length,
        restaurantItems: restaurantProducts.length,
        bakeryItems: bakeryProducts.length,
        totalValue: calculateValue(allProducts),
        restaurantValue: calculateValue(restaurantProducts),
        bakeryValue: calculateValue(bakeryProducts)
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems}
              {stats.lowStockItems > 0 && (
                <span className="text-xs ml-2 text-red-500">
                  ({Math.round((stats.lowStockItems / stats.totalProducts) * 100)}%)
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurant Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.restaurantItems}
              <span className="text-xs ml-2 text-muted-foreground">
                ({Math.round((stats.restaurantItems / stats.totalProducts) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bakery Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.bakeryItems}
              <span className="text-xs ml-2 text-muted-foreground">
                ({Math.round((stats.bakeryItems / stats.totalProducts) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurant Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.restaurantValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bakery Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${stats.bakeryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-100">
          <CardHeader className="bg-red-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({lowStockProducts.length})
            </CardTitle>
            <CardDescription className="text-red-500">
              Items below minimum quantity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-red-100">
              {lowStockProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-red-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {product.location}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Stock: {product.quantity} | Min: {product.minQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="px-3 py-1">
                      ${(product.price * product.quantity).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;