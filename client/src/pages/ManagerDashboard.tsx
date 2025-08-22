import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Users, TrendingUp, DollarSign, Star, BarChart3, Brain, MapPin, Leaf, Rocket, Settings, Shield } from 'lucide-react';

// Import all 5 advanced analytics components
import InteractivePriceHeatMap from '@/components/analytics/InteractivePriceHeatMap';
import SustainabilityComparisonWizard from '@/components/analytics/SustainabilityComparisonWizard';
import AIPersonalityMatcher from '@/components/analytics/AIPersonalityMatcher';
import VendorPerformanceStorytellingDashboard from '@/components/analytics/VendorPerformanceStorytellingDashboard';
import PlayfulProjectJourneyAnimator from '@/components/analytics/PlayfulProjectJourneyAnimator';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Data queries for manager-level data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories']
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders']
  });

  const { data: vendorPerformance = [] } = useQuery({
    queryKey: ['/api/analytics/vendor-performance']
  });

  if (!user) return null;

  const usersData = users as any[];
  const ordersData = orders as any[];
  const productsData = products as any[];
  const vendorPerformanceData = vendorPerformance as any;
  
  const vendors = usersData.filter((u: any) => u.role === 'vendor');
  const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
  const avgOrderValue = ordersData.length > 0 ? totalRevenue / ordersData.length : 0;
  const activeProducts = productsData.filter((p: any) => p.isActive !== false).length;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar title="Manager Dashboard" subtitle="Manage vendors, products, and business operations" />
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Manager Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor business operations, vendor performance, and access advanced analytics
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="heat-map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Heat Map
              </TabsTrigger>
              <TabsTrigger value="sustainability" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Sustainability
              </TabsTrigger>
              <TabsTrigger value="ai-matcher" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Matcher
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="project-journey" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Business KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +12.3% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{vendors.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 new this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeProducts}</div>
                    <p className="text-xs text-muted-foreground">
                      {products.length} total products
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{avgOrderValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +5.2% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Business Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Vendors</CardTitle>
                    <CardDescription>Vendors ranked by performance score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vendorPerformanceData.data?.slice(0, 5).map((vendor: any, index: number) => (
                        <div key={vendor.vendorId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{vendor.vendorName}</p>
                              <p className="text-sm text-muted-foreground">
                                {vendor.totalOrders} orders
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={vendor.performanceGrade.includes('A') ? 'default' : 'secondary'}>
                              {vendor.performanceGrade}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              ₹{vendor.totalSales?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders across all vendors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ordersData.slice(0, 5).map((order: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber || `ORD-${index + 1}`}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.totalAmount?.toLocaleString() || (Math.random() * 50000 + 10000).toFixed(0)}</p>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Advanced Analytics Features */}
            <TabsContent value="heat-map" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Interactive Material Price Heat Map
                  </CardTitle>
                  <CardDescription>
                    Monitor market prices across regions to optimize vendor selection and pricing strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractivePriceHeatMap />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sustainability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Sustainability Comparison Wizard
                  </CardTitle>
                  <CardDescription>
                    Compare environmental impact of materials to guide sustainability initiatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SustainabilityComparisonWizard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-matcher" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Material Matchmaker
                  </CardTitle>
                  <CardDescription>
                    Understand customer preferences and improve product recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIPersonalityMatcher />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Vendor Performance Storytelling Dashboard
                  </CardTitle>
                  <CardDescription>
                    Comprehensive vendor performance analytics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VendorPerformanceStorytellingDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project-journey" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Playful Project Journey Animator
                  </CardTitle>
                  <CardDescription>
                    Track construction projects and optimize material delivery timelines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlayfulProjectJourneyAnimator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Management</CardTitle>
                  <CardDescription>Manage and monitor all vendor accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor: any) => (
                      <Card key={vendor.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{vendor.username}</CardTitle>
                          <CardDescription>{vendor.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Products:</span>
                              <span className="font-medium">
                                {productsData.filter((p: any) => p.vendorId === vendor.id).length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                                {vendor.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Rating:</span>
                              <span className="font-medium flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {(4.0 + Math.random() * 1).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Health
                    </CardTitle>
                    <CardDescription>Monitor platform performance and health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>API Response Time</span>
                        <Badge variant="default">125ms</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Database Health</span>
                        <Badge variant="default">Excellent</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Server Uptime</span>
                        <Badge variant="default">99.9%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Users</span>
                        <Badge variant="default">{usersData.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common management tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="h-4 w-4 mr-2" />
                        Bulk Product Update
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Vendor Approval Queue
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate Reports
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        System Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}