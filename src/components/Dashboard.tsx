import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { databaseService } from '@/lib/database';
import { normalizeProduct, getCategoryCounts } from '@/lib/productUtils';
import {
    Package,
    AlertTriangle,
    Utensils,
    Croissant,
    DollarSign
} from 'lucide-react';

interface DashboardStats {
    total: number;
    lowStock: number;
    restaurant: number;
    bakery: number;
    totalValue: number;
    restaurantValue: number;
    bakeryValue: number;
}

export const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        lowStock: 0,
        restaurant: 0,
        bakery: 0,
        totalValue: 0,
        restaurantValue: 0,
        bakeryValue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const rawProducts = await databaseService.getProducts();
                const products = rawProducts.map(normalizeProduct);

                // Debug: Log sample data
                console.log('Sample products:', products.slice(0, 3));
                console.log('Location mapping:',
                    [...new Set(products.map(p => `${p.location} → ${p.category}`))]);

                // Get category counts
                const { restaurant, bakery } = getCategoryCounts(products);

                // Calculate low stock items
                const lowStock = products.filter(p => p.quantity <= p.minQuantity).length;

                // Calculate inventory values
                const calculateValue = (items: Product[]) =>
                    items.reduce((sum, p) => sum + (p.price * p.quantity), 0);

                const restaurantProducts = products.filter(p => p.category === 'restaurant');
                const bakeryProducts = products.filter(p => p.category === 'bakery');

                setStats({
                    total: products.length,
                    lowStock,
                    restaurant,
                    bakery,
                    totalValue: calculateValue(products),
                    restaurantValue: calculateValue(restaurantProducts),
                    bakeryValue: calculateValue(bakeryProducts)
                });

            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-bold">Inventory Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Products"
                    value={stats.total}
                    icon={<Package className="h-5 w-5" />}
                />
                <StatCard
                    title="Low Stock"
                    value={stats.lowStock}
                    icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
                    variant={stats.lowStock > 0 ? 'destructive' : 'default'}
                />
                <StatCard
                    title="Restaurant"
                    value={stats.restaurant}
                    icon={<Utensils className="h-5 w-5 text-blue-500" />}
                />
                <StatCard
                    title="Bakery"
                    value={stats.bakery}
                    icon={<Croissant className="h-5 w-5 text-amber-500" />}
                />
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ValueCard
                    title="Total Value"
                    value={stats.totalValue}
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <ValueCard
                    title="Restaurant Value"
                    value={stats.restaurantValue}
                    icon={<DollarSign className="h-5 w-5 text-blue-500" />}
                />
                <ValueCard
                    title="Bakery Value"
                    value={stats.bakeryValue}
                    icon={<DollarSign className="h-5 w-5 text-amber-500" />}
                />
            </div>

            {/* Debug Card - Remove in production */}
            <Card className="bg-gray-50">
                <CardHeader>
                    <CardTitle className="text-sm">Debug Info</CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                    <pre>{JSON.stringify(stats, null, 2)}</pre>
                </CardContent>
            </Card>
        </div>
    );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, variant = 'default' }: any) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${variant === 'destructive' ? 'text-destructive' : ''
                }`}>
                {value}
            </div>
        </CardContent>
    </Card>
);

// Reusable Value Card Component
const ValueCard = ({ title, value, icon }: any) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
                ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
        </CardContent>
    </Card>
);

export default Dashboard;