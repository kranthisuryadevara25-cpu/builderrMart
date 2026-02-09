import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Eye, 
  TrendingUp, 
  Calendar, 
  Package, 
  DollarSign,
  Target,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Settings,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Bookmark,
  CreditCard,
  Truck
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { apiRequest } from "@/lib/queryClient";

interface DashboardProps {
  onClose?: () => void;
}

export default function PersonalizedDashboard({ onClose }: DashboardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const dashboardData = {
    stats: {
      totalOrders: 24,
      totalSpent: 145650,
      savedAmount: 12450,
      favoriteProducts: 18,
      recentViews: 45
    },
    recentOrders: [
      { id: 'ORD-001', date: '2025-01-15', amount: 25650, status: 'Delivered', items: 3 },
      { id: 'ORD-002', date: '2025-01-12', amount: 8950, status: 'In Transit', items: 2 },
      { id: 'ORD-003', date: '2025-01-08', amount: 15250, status: 'Processing', items: 5 },
      { id: 'ORD-004', date: '2025-01-05', amount: 32100, status: 'Delivered', items: 4 },
    ],
    monthlySpending: [
      { month: 'Oct', amount: 15000 },
      { month: 'Nov', amount: 22000 },
      { month: 'Dec', amount: 18500 },
      { month: 'Jan', amount: 25650 },
    ],
    categorySpending: [
      { category: 'Cement & Concrete', amount: 45000, percentage: 35 },
      { category: 'Steel & Iron', amount: 38500, percentage: 30 },
      { category: 'Bricks & Blocks', amount: 25200, percentage: 20 },
      { category: 'Plumbing Materials', amount: 12950, percentage: 10 },
      { category: 'Others', amount: 6450, percentage: 5 },
    ],
    recommendations: [
      { id: '1', name: 'UltraTech Super Cement', reason: 'Based on your recent purchases', discount: 12 },
      { id: '2', name: 'TATA TMT Bars', reason: 'Frequently bought together', discount: 8 },
      { id: '3', name: 'Premium Red Bricks', reason: 'Trending in your area', discount: 15 },
    ],
    achievments: [
      { title: 'Bulk Buyer', description: 'Purchased over ₹100K', icon: Award, earned: true },
      { title: 'Loyal Customer', description: '1 year with BuildMart', icon: Heart, earned: true },
      { title: 'Early Adopter', description: 'Used AI estimation feature', icon: TrendingUp, earned: true },
      { title: 'Eco Warrior', description: 'Bought eco-friendly products', icon: Target, earned: false },
    ]
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.stats.totalOrders}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">₹{dashboardData.stats.totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount Saved</p>
                <p className="text-2xl font-bold text-orange-600">₹{dashboardData.stats.savedAmount.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-pink-600">{dashboardData.stats.favoriteProducts}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.monthlySpending.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{month.month}</span>
                    <span className="text-sm text-gray-600">₹{month.amount.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={(month.amount / 30000) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.categorySpending.map((category, index) => (
                <div key={category.category} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                    index === 0 ? 'from-blue-400 to-blue-600' :
                    index === 1 ? 'from-green-400 to-green-600' :
                    index === 2 ? 'from-yellow-400 to-yellow-600' :
                    index === 3 ? 'from-purple-400 to-purple-600' :
                    'from-gray-400 to-gray-600'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-gray-600">{category.percentage}%</span>
                    </div>
                    <div className="text-xs text-gray-500">₹{category.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.recommendations.map((rec) => (
              <Card key={rec.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{rec.name}</h4>
                    <Badge className="bg-green-100 text-green-700">{rec.discount}% OFF</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{rec.reason}</p>
                  <Button size="sm" className="w-full" onClick={() => { setLocation("/"); toast({ title: "Store", description: `Search for "${rec.name}" on the store.` }); }}>
                    View Product
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Order History</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const csv = ["Order ID,Date,Amount,Status,Items", ...dashboardData.recentOrders.map((o) => `${o.id},${o.date},${o.amount},${o.status},${o.items}`)].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my-orders.csv";
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Exported", description: "Order history downloaded." });
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </div>

      <div className="space-y-4">
        {dashboardData.recentOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.id}</span>
                      <Badge variant={
                        order.status === 'Delivered' ? 'default' :
                        order.status === 'In Transit' ? 'secondary' :
                        'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {order.date}
                      </span>
                      <span>{order.items} items</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold">₹{order.amount.toLocaleString()}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => toast({ title: order.id, description: `₹${order.amount.toLocaleString()} – ${order.status}` })}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Track order", description: `Tracking for ${order.id} will be sent to your email.` })}>
                      <Truck className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user?.username}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <Badge className="mt-1">
                {user?.role === 'vendor' ? 'Vendor' : user?.role === 'owner_admin' ? 'Admin' : 'Customer'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">+91 9876543210</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </h4>
              <div className="space-y-2">
                {dashboardData.achievments.map((achievement, index) => (
                  <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${
                    achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <achievement.icon className={`h-5 w-5 ${
                      achievement.earned ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className={`text-sm font-medium ${
                        achievement.earned ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-500">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start" onClick={() => setLocation("/profile")}>
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast({ title: "Addresses", description: "Manage addresses in Profile or at checkout." })}>
              <MapPin className="h-4 w-4 mr-2" />
              Manage Addresses
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast({ title: "Payment methods", description: "Add or edit payment methods at checkout." })}>
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Methods
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast({ title: "Preferences", description: "Notification and display preferences coming soon." })}>
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Purchase Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">₹{dashboardData.stats.totalSpent.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
              <div className="text-xs text-green-600 mt-1">+15% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">₹{dashboardData.stats.savedAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Amount Saved</div>
              <div className="text-xs text-green-600 mt-1">8.5% savings rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{dashboardData.stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Orders Placed</div>
              <div className="text-xs text-blue-600 mt-1">Avg ₹6,069 per order</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shopping Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Bulk Purchases</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Brand Loyalty</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Seasonal Buying</span>
                  <span>52%</span>
                </div>
                <Progress value={52} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Price Sensitivity</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Order delivered successfully</span>
                <span className="text-gray-400 ml-auto">2h ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Price alert for UltraTech Cement</span>
                <span className="text-gray-400 ml-auto">1d ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>New recommendations available</span>
                <span className="text-gray-400 ml-auto">2d ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>AI estimation report generated</span>
                <span className="text-gray-400 ml-auto">3d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Personal Dashboard</h2>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="orders">{renderOrders()}</TabsContent>
        <TabsContent value="profile">{renderProfile()}</TabsContent>
        <TabsContent value="analytics">{renderAnalytics()}</TabsContent>
      </Tabs>
    </div>
  );
}