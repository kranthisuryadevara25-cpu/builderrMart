import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  MessageCircle,
  Scale,
  Zap,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { useLocation } from "wouter";

const salesData = [
  { month: "Jan", sales: 12000, orders: 45 },
  { month: "Feb", sales: 15000, orders: 52 },
  { month: "Mar", sales: 18000, orders: 61 },
  { month: "Apr", sales: 16000, orders: 58 },
  { month: "May", sales: 22000, orders: 72 },
  { month: "Jun", sales: 25000, orders: 85 },
];

const productData = [
  { category: "Cement", sales: 45000 },
  { category: "Steel", sales: 38000 },
  { category: "Plumbing", sales: 22000 },
  { category: "Electrical", sales: 18000 },
];

export default function Dashboard() {
  const { user, isAdmin, isVendor } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;

  // Top 5 Features for customers and vendors
  const topFeatures = [
    {
      id: 'vendor-chat',
      name: 'Vendor Chat',
      description: 'Chat with vendors in real-time, negotiate prices, and get instant support',
      icon: MessageCircle,
      route: '/analytics',
      analyticsTab: 'vendor-chat',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-white'
    },
    {
      id: 'material-comparison',
      name: 'Material Comparison',
      description: 'Compare materials side-by-side with AI-powered insights and recommendations',
      icon: Scale,
      route: '/analytics',
      analyticsTab: 'comparison',
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-white'
    },
    {
      id: 'price-negotiation',
      name: 'Real-time Price Negotiation',
      description: 'Dynamic price negotiation with live market data and instant offers',
      icon: DollarSign,
      route: '/analytics',
      analyticsTab: 'price-negotiation',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-white'
    },
    {
      id: 'budget-calculator',
      name: 'Smart Budget Calculator',
      description: 'AI-powered project budget planning with cost optimization suggestions',
      icon: Calculator,
      route: '/analytics',
      analyticsTab: 'budget-calculator',
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-white'
    },
    {
      id: 'project-optimizer',
      name: 'One-Click Project Optimizer',
      description: 'Instantly optimize your project costs and material selection with AI',
      icon: Zap,
      route: '/analytics',
      analyticsTab: 'project-optimizer',
      color: 'from-orange-500 to-red-500',
      textColor: 'text-white'
    }
  ];

  const navigateToFeature = (feature: typeof topFeatures[0]) => {
    // Navigate to analytics page and set the specific tab
    setLocation('/analytics');
    // Store the selected tab in sessionStorage so AnalyticsDashboard can pick it up
    sessionStorage.setItem('selectedAnalyticsTab', feature.analyticsTab);
  };

  const stats = [
    {
      title: "Total Revenue",
      value: "₹2,45,000",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: isAdmin ? "Total Products" : "My Products",
      value: isAdmin ? "1,247" : "87",
      change: "+8.2%",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Orders",
      value: "156",
      change: "+23.1%",
      icon: ShoppingCart,
      color: "text-purple-600",
    },
    {
      title: isAdmin ? "Active Vendors" : "Stock Items",
      value: isAdmin ? "43" : "67",
      change: isAdmin ? "+5.4%" : "-2.1%",
      icon: Users,
      color: isAdmin ? "text-indigo-600" : "text-orange-600",
    },
  ];

  const alerts = [
    {
      id: 1,
      type: "Low Stock",
      message: "Premium Portland Cement is running low (5 bags remaining)",
      severity: "warning",
    },
    {
      id: 2,
      type: "New Order",
      message: "Order #1234 received for Steel Rebar (50 kg)",
      severity: "info",
    },
    {
      id: 3,
      type: "Payment Due",
      message: "Invoice #INV-567 payment overdue by 3 days",
      severity: "error",
    },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Dashboard" 
          subtitle={`Welcome back, ${user.username}!`} 
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-8">
            {/* Top 5 Features Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🚀 Top Features for {isAdmin ? 'Admins' : isVendor ? 'Vendors' : 'Customers'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Access our most popular tools with a single click
                  </p>
                </div>
                <Badge variant="secondary" className="px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  5 Power Tools
                </Badge>
              </div>
              
              {/* Top 5 Features in a horizontal scroll layout */}
              <div className="flex flex-col space-y-4">
                {/* Main 5 features in a single row */}
                <div className="flex overflow-x-auto space-x-4 pb-4">
                  {topFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card 
                        key={feature.id} 
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden flex-shrink-0 w-80"
                        onClick={() => navigateToFeature(feature)}
                        data-testid={`feature-${feature.id}`}
                      >
                        <div className={`bg-gradient-to-br ${feature.color} p-1`}>
                          <CardContent className="p-6 bg-white dark:bg-gray-900 m-1 rounded-lg">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                                <Icon className={`h-7 w-7 ${feature.textColor}`} />
                              </div>
                              <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                              {feature.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                              {feature.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                Analytics Tool
                              </Badge>
                              <div className="flex items-center text-xs text-gray-500">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Top Feature
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                
                {/* View All Analytics Button - standalone */}
                <div className="flex justify-center">
                  <Card 
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-blue-400 w-full max-w-md"
                    onClick={() => setLocation('/analytics')}
                    data-testid="view-all-analytics"
                  >
                    <CardContent className="p-6 flex items-center justify-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Package className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                          View All 17 Analytics Tools
                        </h3>
                        <p className="text-sm text-gray-500">
                          Explore complete analytics dashboard with advanced features
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </p>
                          <p className={`text-sm ${stat.color} flex items-center mt-1`}>
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {stat.change}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            alert.severity === "error"
                              ? "bg-red-500"
                              : alert.severity === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                alert.severity === "error"
                                  ? "destructive"
                                  : alert.severity === "warning"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <Package className="h-8 w-8 text-blue-600 mb-2" />
                      <p className="font-medium text-blue-900">Add Product</p>
                      <p className="text-sm text-blue-600">Create new product listing</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                      <ShoppingCart className="h-8 w-8 text-green-600 mb-2" />
                      <p className="font-medium text-green-900">View Orders</p>
                      <p className="text-sm text-green-600">Manage recent orders</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                      <BarChart className="h-8 w-8 text-purple-600 mb-2" />
                      <p className="font-medium text-purple-900">Analytics</p>
                      <p className="text-sm text-purple-600">View detailed reports</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                      <Users className="h-8 w-8 text-orange-600 mb-2" />
                      <p className="font-medium text-orange-900">
                        {isAdmin ? "Vendors" : "Inventory"}
                      </p>
                      <p className="text-sm text-orange-600">
                        {isAdmin ? "Manage vendors" : "Check stock levels"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
