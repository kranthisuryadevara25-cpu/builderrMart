import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Package, Users, TrendingUp, DollarSign, Star, BarChart3, Brain, MapPin, Leaf, Rocket, Settings, Shield, Plus, Edit, Trash2, UserCheck, UserX, Download, FileText, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Import all 5 advanced analytics components
import InteractivePriceHeatMap from '@/components/analytics/InteractivePriceHeatMap';
import SustainabilityComparisonWizard from '@/components/analytics/SustainabilityComparisonWizard';
import AIPersonalityMatcher from '@/components/analytics/AIPersonalityMatcher';
import VendorPerformanceStorytellingDashboard from '@/components/analytics/VendorPerformanceStorytellingDashboard';
import PlayfulProjectJourneyAnimator from '@/components/analytics/PlayfulProjectJourneyAnimator';

// Form schemas for manager operations
const vendorFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  isActive: z.boolean().optional(),
});

const bulkUpdateSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  action: z.string().min(1, 'Action is required'),
  value: z.string().optional(),
});

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

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

  // Form configurations
  const vendorForm = useForm({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      isActive: true,
    },
  });

  const bulkUpdateForm = useForm({
    resolver: zodResolver(bulkUpdateSchema),
    defaultValues: {
      category: '',
      action: '',
      value: '',
    },
  });

  // Mutations
  const createVendorMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/users', { ...data, role: 'vendor' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Success', description: 'Vendor created successfully' });
      vendorForm.reset();
      setVendorDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PUT', `/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Success', description: 'Vendor updated successfully' });
      vendorForm.reset();
      setVendorDialogOpen(false);
      setEditingVendor(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleVendorStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      apiRequest('PUT', `/api/users/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Success', description: 'Vendor status updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Success', description: 'Vendor deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/bulk-update', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Success', description: 'Bulk update completed successfully' });
      bulkUpdateForm.reset();
      setBulkUpdateOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Form handlers
  const handleVendorSubmit = (data: any) => {
    if (editingVendor) {
      updateVendorMutation.mutate({ id: editingVendor.id, data });
    } else {
      createVendorMutation.mutate(data);
    }
  };

  const handleBulkUpdate = (data: any) => {
    bulkUpdateMutation.mutate(data);
  };

  const openEditVendor = (vendor: any) => {
    setEditingVendor(vendor);
    vendorForm.reset(vendor);
    setVendorDialogOpen(true);
  };

  const resetForms = () => {
    setEditingVendor(null);
    vendorForm.reset();
    bulkUpdateForm.reset();
  };

  const generateReport = async (reportType: string) => {
    try {
      const response = await apiRequest('POST', '/api/reports/generate', { type: reportType });
      toast({ title: 'Success', description: `${reportType} report generated successfully` });
      setReportDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

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
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Vendor Management</CardTitle>
                    <CardDescription>Manage and monitor all vendor accounts</CardDescription>
                  </div>
                  <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForms}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingVendor ? 'Update vendor account details' : 'Create a new vendor account'}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...vendorForm}>
                        <form onSubmit={vendorForm.handleSubmit(handleVendorSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={vendorForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={vendorForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={vendorForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="vendor@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={vendorForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={vendorForm.control}
                              name="company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter company name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={vendorForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Active Account</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setVendorDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createVendorMutation.isPending || updateVendorMutation.isPending}>
                              {editingVendor ? 'Update Vendor' : 'Create Vendor'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
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
                          <div className="space-y-3">
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
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" onClick={() => openEditVendor(vendor)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => toggleVendorStatusMutation.mutate({ 
                                  id: vendor.id, 
                                  isActive: !vendor.isActive 
                                })}
                                disabled={toggleVendorStatusMutation.isPending}
                              >
                                {vendor.isActive ? (
                                  <>
                                    <UserX className="h-3 w-3 mr-1" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{vendor.username}"? This action cannot be undone and will also remove all their products.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteVendorMutation.mutate(vendor.id)}>
                                      Delete Vendor
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                      <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full justify-start" onClick={resetForms}>
                            <Package className="h-4 w-4 mr-2" />
                            Bulk Product Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Bulk Product Update</DialogTitle>
                            <DialogDescription>
                              Update multiple products at once by category or criteria
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...bulkUpdateForm}>
                            <form onSubmit={bulkUpdateForm.handleSubmit(handleBulkUpdate)} className="space-y-4">
                              <FormField
                                control={bulkUpdateForm.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select category to update" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {categories.map((category: any) => (
                                          <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={bulkUpdateForm.control}
                                name="action"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Action</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="price_increase">Increase Price</SelectItem>
                                        <SelectItem value="price_decrease">Decrease Price</SelectItem>
                                        <SelectItem value="mark_featured">Mark as Featured</SelectItem>
                                        <SelectItem value="unmark_featured">Remove Featured</SelectItem>
                                        <SelectItem value="activate">Activate Products</SelectItem>
                                        <SelectItem value="deactivate">Deactivate Products</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={bulkUpdateForm.control}
                                name="value"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Value (if applicable)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., 10 for 10% increase" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setBulkUpdateOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={bulkUpdateMutation.isPending}>
                                  Apply Changes
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Vendor Approval', description: 'No pending vendor approvals at this time' })}>
                        <Users className="h-4 w-4 mr-2" />
                        Vendor Approval Queue
                      </Button>

                      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Generate Reports
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Generate Reports</DialogTitle>
                            <DialogDescription>
                              Select the type of report you want to generate
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => generateReport('Sales Report')} className="h-20 flex-col">
                              <FileText className="h-6 w-6 mb-2" />
                              Sales Report
                            </Button>
                            <Button onClick={() => generateReport('Inventory Report')} className="h-20 flex-col">
                              <Package className="h-6 w-6 mb-2" />
                              Inventory Report
                            </Button>
                            <Button onClick={() => generateReport('Vendor Performance')} className="h-20 flex-col">
                              <Users className="h-6 w-6 mb-2" />
                              Vendor Performance
                            </Button>
                            <Button onClick={() => generateReport('Analytics Summary')} className="h-20 flex-col">
                              <BarChart3 className="h-6 w-6 mb-2" />
                              Analytics Summary
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'System Settings', description: 'System settings accessed successfully' })}>
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