import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Users, TrendingUp, DollarSign, Star, BarChart3, Brain, MapPin, Leaf, Rocket } from 'lucide-react';

// Import all 5 advanced analytics components
import InteractivePriceHeatMap from '@/components/analytics/InteractivePriceHeatMap';
import SustainabilityComparisonWizard from '@/components/analytics/SustainabilityComparisonWizard';
import AIPersonalityMatcher from '@/components/analytics/AIPersonalityMatcher';
import VendorPerformanceStorytellingDashboard from '@/components/analytics/VendorPerformanceStorytellingDashboard';
import PlayfulProjectJourneyAnimator from '@/components/analytics/PlayfulProjectJourneyAnimator';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Data queries for vendor-specific data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    select: (data: any[]) => data.filter((product: any) => product.vendorId === user?.id)
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
    select: (data: any[]) => data.filter((order: any) => 
      order.items?.some((item: any) => 
        products.find((p: any) => p.id === item.productId)
      )
    )
  });

  const { data: vendorPerformance } = useQuery({
    queryKey: [`/api/analytics/vendor-performance/${user?.id}`],
    enabled: !!user?.id
  });

  if (!user) return null;

  const performanceData = vendorPerformance as any;
  const totalSales = performanceData?.data?.totalSales || 0;
  const totalOrders = performanceData?.data?.totalOrders || 0;
  const averageRating = performanceData?.data?.averageRating || 0;
  const onTimeDeliveryRate = performanceData?.data?.onTimeDeliveryRate || 0;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar title="Vendor Dashboard" subtitle="Track your business performance and analytics" />
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Vendor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your sales, track performance, and access advanced analytics tools
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
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
              <TabsTrigger value="products">My Products</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +15.2% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      +8.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      +0.3 from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{onTimeDeliveryRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      +2.5% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders for your products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order: any, index: number) => (
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

                <Card>
                  <CardHeader>
                    <CardTitle>Product Performance</CardTitle>
                    <CardDescription>Your top-selling products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {product.stockQuantity || 0}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{product.basePrice}</p>
                            {product.isFeatured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
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
                    Visualize real-time material prices across different regions and make informed pricing decisions
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
                    Compare environmental impact and sustainability scores of different materials
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
                    Get personalized material recommendations based on your personality and project needs
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
                    Track your performance metrics and business growth with detailed analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VendorPerformanceStorytellingDashboard vendorId={user?.id} />
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
                    Visualize and track construction projects with fun animations and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlayfulProjectJourneyAnimator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Products</CardTitle>
                  <CardDescription>Manage and track your product inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: any) => (
                      <Card key={product.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription>{product.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="font-medium">₹{product.basePrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stock:</span>
                              <span className="font-medium">{product.stockQuantity || 0}</span>
                            </div>
                            <div className="flex gap-2">
                              {product.isFeatured && (
                                <Badge variant="default">Featured</Badge>
                              )}
                              {product.isTrending && (
                                <Badge variant="secondary">Trending</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}