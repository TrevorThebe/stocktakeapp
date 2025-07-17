import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { databaseService } from '@/lib/database';
import { Package, AlertTriangle, Utensils, Croissant } from 'lucide-react';
import { normalizeProduct } from '@/lib/productUtils';

const Dashboard = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    restaurant: 0,
    bakery: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawProducts = await databaseService.getProducts();
        const normalizedProducts = rawProducts.map(normalizeProduct);

        setProducts(normalizedProducts);

        // Debug: See what categories we have
        console.log('Product categories:',
          [...new Set(normalizedProducts.map(p => p.category))]);

        setStats({
          total: normalizedProducts.length,
          lowStock: normalizedProducts.filter(p => p.quantity <= p.minQuantity).length,
          restaurant: normalizedProducts.filter(p => p.category === 'restaurant').length,
          bakery: normalizedProducts.filter(p => p.category === 'bakery').length
        });

      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Inventory Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.total}
          icon={<Package />}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={<AlertTriangle className="text-orange-500" />}
          variant={stats.lowStock > 0 ? 'destructive' : 'default'}
        />
        <StatCard
          title="Restaurant"
          value={stats.restaurant}
          icon={<Utensils className="text-blue-500" />}
        />
        <StatCard
          title="Bakery"
          value={stats.bakery}
          icon={<Croissant className="text-amber-500" />}
        />
      </div>

      {/* Debug view - remove in production */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data Sample</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs">
            {JSON.stringify(products.slice(0, 3), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon, variant = 'default' }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between p-4">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="p-2 rounded-lg bg-secondary">
        {React.cloneElement(icon, { className: 'h-4 w-4' })}
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className={`text-2xl font-bold ${variant === 'destructive' ? 'text-destructive' : ''
        }`}>
        {value}
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;