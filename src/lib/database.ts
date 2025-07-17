import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, AlertTriangle, Utensils, Croissant, Bell } from 'lucide-react';
import { authService } from '@/lib/auth';
import { databaseService } from '@/lib/database';
import { normalizeProduct } from '@/lib/productUtils';

interface DashboardStats {
  total: number;
  lowStock: number;
  restaurant: number;
  bakery: number;
  totalValue: number;
  restaurantValue: number;
  bakeryValue: number;
}

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    lowStock: 0,
    restaurant: 0,
    bakery: 0,
    totalValue: 0,
    restaurantValue: 0,
    bakeryValue: 0
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user data
        const user = authService.getCurrentUser();
        if (user) {
          const profile = await databaseService.getUserProfile(user.id);
          setCurrentUser({ ...user, ...profile });
        }

        // Load and normalize products
        const rawProducts = await databaseService.getProducts();
        const normalizedProducts = rawProducts.map(normalizeProduct);
        setProducts(normalizedProducts);

        // Calculate statistics
        const lowStock = normalizedProducts.filter(p => p.quantity <= p.minQuantity);
        const restaurant = normalizedProducts.filter(p => p.category === 'restaurant');
        const bakery = normalizedProducts.filter(p => p.category === 'bakery');

        const calculateValue = (items: any[]) =>
          items.reduce((sum, p) => sum + (p.price * p.quantity), 0);

        setStats({
          total: normalizedProducts.length,
          lowStock: lowStock.length,
          restaurant: restaurant.length,
          bakery: bakery.length,
          totalValue: calculateValue(normalizedProducts),
          restaurantValue: calculateValue(restaurant),
          bakeryValue: calculateValue(bakery)
        });

        // Debug output
        console.log('Normalized products sample:', normalizedProducts.slice(0, 3));
        console.log('Location mapping:',
          [...new Set(normalizedProducts.map(p => `${p.originalLocation} → ${p.category}`))]);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className= "p-4 lg:p-6 flex items-center justify-center min-h-[400px]" >
      <div className="text-center" >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" > </div>
          < p > Loading dashboard...</p>
            </div>
            </div>
    );
  }

return (
  <div className= "p-4 lg:p-6 space-y-4 lg:space-y-6" >
  {/* Header with user info */ }
  < div className = "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" >
    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" >
      CD Stock Dashboard
        </h1>
{
  currentUser && (
    <div className="flex items-center gap-3" >
      <Avatar className="h-8 w-8 lg:h-10 lg:w-10" >
        <AvatarImage src={ currentUser.avatar_url } />
          < AvatarFallback className = "text-xs lg:text-sm" >
            { currentUser.name?.split(' ').map((n: string) => n[0]).join('') || 'U' }
            </AvatarFallback>
            </Avatar>
            < div className = "text-right hidden sm:block" >
              <p className="text-sm font-medium truncate max-w-32" > { currentUser.name } </p>
                < Badge variant = "outline" className = "text-xs" >
                  { currentUser.role }
                  </Badge>
                  </div>
                  </div>
        )
}
</div>

{/* Stats Cards */ }
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6" >
  <StatCard 
          title="Total Products"
value = { stats.total }
icon = {< Package />}
gradient = "from-blue-500 to-blue-600"
  />
  <StatCard 
          title="Restaurant Items"
value = { stats.restaurant }
icon = {< Utensils />}
gradient = "from-green-500 to-green-600"
  />
  <StatCard 
          title="Bakery Items"
value = { stats.bakery }
icon = {< Croissant />}
gradient = "from-amber-500 to-amber-600"
  />
  <StatCard 
          title="Low Stock"
value = { stats.lowStock }
icon = {< AlertTriangle />}
gradient = "from-red-500 to-red-600"
isWarning = { stats.lowStock > 0 }
  />
  </div>

{/* Value Summary */ }
<div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
  <ValueCard 
          title="Total Inventory Value"
value = { stats.totalValue }
  />
  <ValueCard 
          title="Restaurant Value"
value = { stats.restaurantValue }
accent = "blue"
  />
  <ValueCard 
          title="Bakery Value"
value = { stats.bakeryValue }
accent = "amber"
  />
  </div>

{/* Debug view (remove in production) */ }
<Card className="border-dashed" >
  <CardHeader>
  <CardTitle className="text-sm" > Debug Information </CardTitle>
    </CardHeader>
    < CardContent className = "text-xs space-y-2" >
      <div>Total Products: { stats.total } </div>
        < div > Unique Categories: { [...new Set(products.map(p => p.category))].join(', ') } </div>
          < div > Sample Locations: { [...new Set(products.slice(0, 5).map(p => p.originalLocation))].join(', ') } </div>
            </CardContent>
            </Card>
            </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, gradient, isWarning = false }: any) => (
  <Card className= {`bg-gradient-to-br ${gradient} text-white`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4" >
      <CardTitle className="text-xs lg:text-sm font-medium" > { title } </CardTitle>
        < div className = {`p-2 rounded-lg ${isWarning ? 'bg-red-600' : 'bg-black bg-opacity-20'}`}>
          { React.cloneElement(icon, { className: 'h-3 w-3 lg:h-4 lg:w-4' }) }
          </div>
          </CardHeader>
          < CardContent className = "p-4 pt-0" >
            <div className="text-xl lg:text-2xl font-bold" > { value } </div>
              </CardContent>
              </Card>
);

// Reusable Value Card Component
const ValueCard = ({ title, value, accent = 'primary' }: any) => {
  const accentColors = {
    primary: 'text-green-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600'
  };

  return (
    <Card>
    <CardHeader className= "pb-2 p-4" >
    <CardTitle className="text-sm font-medium" > { title } </CardTitle>
      </CardHeader>
      < CardContent className = "p-4 pt-0" >
        <div className={ `text-xl lg:text-2xl font-bold ${accentColors[accent as keyof typeof accentColors]}` }>
          ${ value.toLocaleString('en-US', { minimumFractionDigits: 2 }) }
  </div>
    </CardContent>
    </Card>
  );
};

export default Dashboard;