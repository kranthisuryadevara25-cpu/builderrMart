import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type Product, type Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Activity
} from "lucide-react";

export default function Analytics() {
  const { user, isAdmin } = useAuth();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products", user?.role === "vendor" ? user.id : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.role === "vendor") params.append('vendorId', user.id);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (!user) return null;

  // Calculate analytics
  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum, product) => sum + (parseFloat(product.basePrice) * product.stockQuantity), 0) || 0;
  const lowStockItems = products?.filter(p => p.stockQuantity < 50 && p.stockQuantity > 0).length || 0;
  const outOfStockItems = products?.filter(p => p.stockQuantity === 0).length || 0;

  // Category breakdown
  const categoryStats = categories?.map(category => {
    const categoryProducts = products?.filter(p => p.categoryId === category.id) || [];
    const categoryValue = categoryProducts.reduce((sum, product) => sum + (parseFloat(product.basePrice) * product.stockQuantity), 0);
    
    return {
      name: category.name,
      productCount: categoryProducts.length,
      totalValue: categoryValue,
      lowStock: categoryProducts.filter(p => p.stockQuantity < 50 && p.stockQuantity > 0).length,
      outOfStock: categoryProducts.filter(p => p.stockQuantity === 0).length,
    };
  }) || [];

  // Mock data for additional metrics (in a real app, this would come from APIs)
  const monthlyRevenue = [
    { month: 'Jan', revenue: 245000 },
    { month: 'Feb', revenue: 292000 },
    { month: 'Mar', revenue: 310000 },
    { month: 'Apr', revenue: 285000 },
    { month: 'May', revenue: 345000 },
    { month: 'Jun', revenue: 378000 },
  ];

  const topProducts = products?.slice(0, 5).map(product => ({
    name: product.name,
    revenue: parseFloat(product.basePrice) * product.stockQuantity,
    orders: Math.floor(Math.random() * 100) + 20,
  })) || [];

  const performanceMetrics = [
    {
      title: "Total Revenue",
      value: `₹${totalValue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: "+8.2%",
      trend: "up",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Active Orders",
      value: "156",
      change: "+23.1%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-purple-600",
    },
    {
      title: isAdmin ? "Active Vendors" : "Stock Alerts",
      value: isAdmin ? "43" : (lowStockItems + outOfStockItems).toString(),
      change: isAdmin ? "+5.4%" : "-2.1%",
      trend: isAdmin ? "up" : "down",
      icon: isAdmin ? Users : Activity,
      color: isAdmin ? "text-indigo-600" : "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Analytics Dashboard"
          subtitle="Insights and performance metrics"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => {
                const Icon = metric.icon;
                const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
                
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {metric.title}
                          </p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {metric.value}
                          </p>
                          <p className={`text-sm ${metric.color} flex items-center mt-1`}>
                            <TrendIcon className="h-3 w-3 mr-1" />
                            {metric.change}
                          </p>
                        </div>
                        <Icon className={`h-8 w-8 ${metric.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          {category.productCount} products • ₹{category.totalValue.toLocaleString()} value
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {category.lowStock > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {category.lowStock} Low Stock
                          </span>
                        )}
                        {category.outOfStock > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {category.outOfStock} Out of Stock
                          </span>
                        )}
                        <div className="text-right">
                          <p className="font-medium">₹{category.totalValue.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{category.productCount} items</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trends and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(month.revenue / 400000) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-20 text-right">
                            ₹{(month.revenue / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stock Alerts */}
            {(lowStockItems > 0 || outOfStockItems > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems > 0 && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <TrendingDown className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-orange-900">Low Stock Warning</p>
                            <p className="text-sm text-orange-700">{lowStockItems} products are running low</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {outOfStockItems > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">Out of Stock Alert</p>
                            <p className="text-sm text-red-700">{outOfStockItems} products are out of stock</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}