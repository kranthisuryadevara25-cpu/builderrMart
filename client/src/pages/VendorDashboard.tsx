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
import { Package, Users, TrendingUp, DollarSign, Star, BarChart3, Brain, MapPin, Leaf, Rocket, Plus, Edit, Trash2, Eye, Settings } from 'lucide-react';
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

// Form schemas
const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  basePrice: z.string().min(1, 'Price is required'),
  stockQuantity: z.number().min(0, 'Stock must be positive'),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
});

const inventoryUpdateSchema = z.object({
  stockQuantity: z.number().min(0, 'Stock must be positive'),
  price: z.string().min(1, 'Price is required'),
});

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

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

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories']
  });

  // Form configurations
  const productForm = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      description: '',
      basePrice: '',
      stockQuantity: 0,
      isFeatured: false,
      isTrending: false,
    },
  });

  const inventoryForm = useForm({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      stockQuantity: 0,
      price: '',
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/products', { ...data, vendorId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Success', description: 'Product created successfully' });
      productForm.reset();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PUT', `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Success', description: 'Product updated successfully' });
      productForm.reset();
      setDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Success', description: 'Product deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PUT', `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Success', description: 'Inventory updated successfully' });
      inventoryForm.reset();
      setInventoryDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Form handlers
  const handleProductSubmit = (data: any) => {
    const productData = {
      ...data,
      basePrice: data.basePrice,
      stockQuantity: parseInt(data.stockQuantity),
      vendorId: user?.id,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleInventorySubmit = (data: any) => {
    if (selectedProduct) {
      updateInventoryMutation.mutate({ 
        id: selectedProduct.id, 
        data: { 
          stockQuantity: data.stockQuantity,
          basePrice: data.price 
        } 
      });
    }
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      ...product,
      basePrice: product.basePrice.toString(),
      stockQuantity: product.stockQuantity || 0,
    });
    setDialogOpen(true);
  };

  const openInventoryDialog = (product: any) => {
    setSelectedProduct(product);
    inventoryForm.reset({
      stockQuantity: product.stockQuantity || 0,
      price: product.basePrice.toString(),
    });
    setInventoryDialogOpen(true);
  };

  const resetForms = () => {
    setEditingProduct(null);
    setSelectedProduct(null);
    productForm.reset();
    inventoryForm.reset();
  };

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
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>Manage and track your product inventory</CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForms}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingProduct ? 'Update your product details' : 'Create a new product for your inventory'}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter product name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
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
                            control={productForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter product description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="basePrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (₹)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={productForm.control}
                              name="stockQuantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock Quantity</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex gap-4">
                            <FormField
                              control={productForm.control}
                              name="isFeatured"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Featured Product</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={productForm.control}
                              name="isTrending"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Trending Product</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                              {editingProduct ? 'Update Product' : 'Create Product'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
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
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="font-medium">₹{product.basePrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stock:</span>
                              <span className={`font-medium ${product.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                {product.stockQuantity || 0}
                                {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                                  <span className="text-xs text-red-500 ml-1">(Low)</span>
                                )}
                                {product.stockQuantity === 0 && (
                                  <span className="text-xs text-red-500 ml-1">(Out of Stock)</span>
                                )}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {product.isFeatured && (
                                <Badge variant="default">Featured</Badge>
                              )}
                              {product.isTrending && (
                                <Badge variant="secondary">Trending</Badge>
                              )}
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openInventoryDialog(product)}>
                                <Settings className="h-3 w-3 mr-1" />
                                Inventory
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
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProductMutation.mutate(product.id)}>
                                      Delete Product
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

              {/* Inventory Management Dialog */}
              <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Inventory</DialogTitle>
                    <DialogDescription>
                      Update stock quantity and price for {selectedProduct?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...inventoryForm}>
                    <form onSubmit={inventoryForm.handleSubmit(handleInventorySubmit)} className="space-y-4">
                      <FormField
                        control={inventoryForm.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={inventoryForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setInventoryDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateInventoryMutation.isPending}>
                          Update Inventory
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}