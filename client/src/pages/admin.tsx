import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseApi } from '@/lib/firebase-api';
import { useToast } from '@/hooks/use-toast';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Package, Users, FileText, Calendar, Percent, TrendingUp, Star, Brain, MapPin, Leaf, Rocket, BarChart3 } from 'lucide-react';
import type { Category, Product, Discount, Quote, Booking } from '@shared/schema';

// Import all 5 advanced analytics components
import InteractivePriceHeatMap from '@/components/analytics/InteractivePriceHeatMap';
import SustainabilityComparisonWizard from '@/components/analytics/SustainabilityComparisonWizard';
import AIPersonalityMatcher from '@/components/analytics/AIPersonalityMatcher';
import VendorPerformanceStorytellingDashboard from '@/components/analytics/VendorPerformanceStorytellingDashboard';
import PlayfulProjectJourneyAnimator from '@/components/analytics/PlayfulProjectJourneyAnimator';

// Form schemas for validation
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  basePrice: z.string().min(1, 'Price is required'),
  stockQuantity: z.number().min(0, 'Stock must be positive'),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  vendorId: z.string().min(1, 'Vendor is required'),
});

const discountFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.string().min(1, 'Value is required'),
  minOrderAmount: z.string().optional(),
  validUntil: z.string().optional(),
});

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Data queries - Firebase
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['firebase', 'categories'],
    queryFn: () => firebaseApi.getCategories(),
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['firebase', 'products'],
    queryFn: () => firebaseApi.getProducts(),
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['firebase', 'users'],
    queryFn: () => firebaseApi.getUsers(),
  });

  const { data: discounts = [] } = useQuery<Discount[]>({
    queryKey: ['firebase', 'discounts'],
    queryFn: () => firebaseApi.getDiscounts(),
  });

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ['firebase', 'quotes'],
    queryFn: () => firebaseApi.getQuotes(),
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['firebase', 'bookings'],
    queryFn: () => firebaseApi.getBookings(),
  });

  // Category form
  const categoryForm = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: '',
    },
  });

  // Product form
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
      vendorId: '',
    },
  });

  // Discount form
  const discountForm = useForm({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '0',
      validUntil: '',
    },
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => firebaseApi.createCategory({ ...data, parentId: data.parentId || null, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'categories'] });
      toast({ title: 'Success', description: 'Category created successfully' });
      categoryForm.reset();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firebaseApi.updateCategory(id, { ...data, parentId: data.parentId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'categories'] });
      toast({ title: 'Success', description: 'Category updated successfully' });
      categoryForm.reset();
      setDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => firebaseApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'categories'] });
      toast({ title: 'Success', description: 'Category deleted successfully' });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => firebaseApi.createProduct({ ...data, basePrice: Number(data.basePrice) || 0, stockQuantity: data.stockQuantity ?? 0, vendorId: data.vendorId, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'products'] });
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
      firebaseApi.updateProduct(id, { ...data, basePrice: Number(data.basePrice) || 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'products'] });
      toast({ title: 'Success', description: 'Product updated successfully' });
      productForm.reset();
      setDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => firebaseApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'products'] });
      toast({ title: 'Success', description: 'Product deleted successfully' });
    },
  });

  const createDiscountMutation = useMutation({
    mutationFn: (data: any) => firebaseApi.createDiscount({ ...data, discountValue: Number(data.discountValue) || 0, minOrderAmount: Number(data.minOrderAmount) || 0, usageCount: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'discounts'] });
      toast({ title: 'Success', description: 'Discount created successfully' });
      discountForm.reset();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateDiscountMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      firebaseApi.updateDiscount(id, { ...data, discountValue: Number(data.discountValue) || 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'discounts'] });
      toast({ title: 'Success', description: 'Discount updated successfully' });
      discountForm.reset();
      setDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: (id: string) => firebaseApi.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase', 'discounts'] });
      toast({ title: 'Success', description: 'Discount deleted successfully' });
    },
  });

  // Form handlers
  const handleCategorySubmit = (data: any) => {
    if (editingItem) {
      updateCategoryMutation.mutate({ id: editingItem.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleProductSubmit = (data: any) => {
    const productData = {
      ...data,
      basePrice: data.basePrice,
      stockQuantity: parseInt(data.stockQuantity),
    };

    if (editingItem) {
      updateProductMutation.mutate({ id: editingItem.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleDiscountSubmit = (data: any) => {
    const discountData = {
      ...data,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount || '0',
      validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
    };

    if (editingItem) {
      updateDiscountMutation.mutate({ id: editingItem.id, data: discountData });
    } else {
      createDiscountMutation.mutate(discountData);
    }
  };

  const openEditDialog = (item: any, type: string) => {
    setEditingItem(item);
    if (type === 'category') {
      categoryForm.reset(item);
    } else if (type === 'product') {
      productForm.reset({
        ...item,
        basePrice: item.basePrice.toString(),
        stockQuantity: item.stockQuantity || 0,
      });
    } else if (type === 'discount') {
      discountForm.reset({
        ...item,
        discountValue: item.discountValue.toString(),
        minOrderAmount: item.minOrderAmount?.toString() || '0',
        validUntil: item.validUntil ? new Date(item.validUntil).toISOString().split('T')[0] : '',
      });
    }
    setDialogOpen(true);
  };

  const resetForms = () => {
    setEditingItem(null);
    categoryForm.reset();
    productForm.reset();
    discountForm.reset();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar title="Admin Panel" subtitle="Manage your e-commerce platform" />
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              BuildMart AI Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your e-commerce platform with comprehensive CRUD operations
            </p>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="heat-map" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Heat Map
            </TabsTrigger>
            <TabsTrigger value="sustainability" className="flex items-center gap-1">
              <Leaf className="h-3 w-3" />
              Sustainability
            </TabsTrigger>
            <TabsTrigger value="ai-matcher" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Matcher
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="project-journey" className="flex items-center gap-1">
              <Rocket className="h-3 w-3" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter((p: any) => p.isFeatured).length} featured
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <p className="text-xs text-muted-foreground">Active categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{discounts.length}</div>
                  <p className="text-xs text-muted-foreground">Discount codes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {quotes.filter((q: any) => q.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {quotes.length} total quotes
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Categories Management</h2>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForms();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Category</DialogTitle>
                    <DialogDescription>
                      {editingItem ? 'Update' : 'Create a new'} category for your products.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Category name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Category description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="parentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Category (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {categories.map((cat: Category) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        {editingItem ? 'Update' : 'Create'} Category
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: Category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category, 'category')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Products Management</h2>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForms();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Product</DialogTitle>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Product name" {...field} />
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
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((cat: Category) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Product description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={productForm.control}
                          name="basePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base Price</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
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
                        <FormField
                          control={productForm.control}
                          name="vendorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users.filter((u: any) => u.role === 'vendor').map((vendor: any) => (
                                    <SelectItem key={vendor.id} value={vendor.id}>
                                      {vendor.username}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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

                      <Button type="submit" className="w-full">
                        {editingItem ? 'Update' : 'Create'} Product
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: Product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <div className="flex gap-1">
                        {product.isFeatured && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {product.isTrending && (
                          <Badge variant="outline">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                    {product.description && (
                      <CardDescription>{product.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold">₹{product.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className={`font-semibold ${(product.stockQuantity || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stockQuantity || 0} units
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product, 'product')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProductMutation.mutate(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Discounts Management</h2>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForms();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Discount
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Discount</DialogTitle>
                  </DialogHeader>
                  <Form {...discountForm}>
                    <form onSubmit={discountForm.handleSubmit(handleDiscountSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={discountForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Code</FormLabel>
                              <FormControl>
                                <Input placeholder="SAVE20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={discountForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input placeholder="20% Off Sale" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={discountForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Discount description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={discountForm.control}
                          name="discountType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={discountForm.control}
                          name="discountValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={discountForm.control}
                          name="minOrderAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Order Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={discountForm.control}
                          name="validUntil"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valid Until</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        {editingItem ? 'Update' : 'Create'} Discount
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discounts.map((discount: Discount) => (
                <Card key={discount.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{discount.name}</CardTitle>
                      <Badge variant="outline">{discount.code}</Badge>
                    </div>
                    {discount.description && (
                      <CardDescription>{discount.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="font-semibold capitalize">
                        {discount.discountType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Value:</span>
                      <span className="font-semibold">
                        {discount.discountType === 'percentage' ? `${discount.discountValue}%` : `₹${discount.discountValue}`}
                      </span>
                    </div>
                    {discount.validUntil && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valid Until:</span>
                        <span className="text-sm">
                          {new Date(discount.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(discount, 'discount')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDiscountMutation.mutate(discount.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Quotes Management</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {quotes.map((quote: Quote) => (
                <Card key={quote.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Quote #{quote.quoteNumber}</CardTitle>
                        <CardDescription>
                          {quote.customerName} - {quote.customerEmail}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        quote.status === 'pending' ? 'default' :
                        quote.status === 'approved' ? 'secondary' :
                        quote.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {quote.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Project Type</p>
                        <p className="text-sm text-gray-600 capitalize">{quote.projectType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Amount</p>
                        <p className="text-lg font-bold text-green-600">₹{quote.totalAmount}</p>
                      </div>
                    </div>
                    {quote.projectLocation && (
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-gray-600">{quote.projectLocation}</p>
                      </div>
                    )}
                    {quote.notes && (
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-gray-600">{quote.notes}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {new Date(quote.createdAt!).toLocaleDateString()}</span>
                      {quote.validUntil && (
                        <span>Valid until: {new Date(quote.validUntil).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bookings Management</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {bookings.map((booking: Booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Booking #{booking.bookingNumber}</CardTitle>
                        <CardDescription>
                          {booking.customerName} - {booking.customerEmail}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        booking.status === 'pending' ? 'default' :
                        booking.status === 'confirmed' ? 'secondary' :
                        booking.status === 'in_progress' ? 'default' :
                        booking.status === 'completed' ? 'secondary' :
                        booking.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Service Type</p>
                        <p className="text-sm text-gray-600 capitalize">{booking.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Scheduled Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                          {booking.scheduledTime && ` at ${booking.scheduledTime}`}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-gray-600">{booking.location}</p>
                      </div>
                      {booking.cost && (
                        <div>
                          <p className="text-sm font-medium">Cost</p>
                          <p className="text-lg font-bold text-green-600">₹{booking.cost}</p>
                        </div>
                      )}
                    </div>
                    {booking.estimatedDuration && (
                      <div>
                        <p className="text-sm font-medium">Estimated Duration</p>
                        <p className="text-sm text-gray-600">{booking.estimatedDuration} minutes</p>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Created: {new Date(booking.createdAt!).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  Monitor real-time material prices across regions for strategic decision making
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
                  Analyze environmental impact and sustainability metrics across products
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
                  AI Material Matchmaker with Personality
                </CardTitle>
                <CardDescription>
                  Advanced AI-powered material recommendations based on user personality analysis
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
                  Comprehensive vendor analytics with storytelling insights and trend analysis
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
                  Interactive project visualization with gamified construction timeline tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlayfulProjectJourneyAnimator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
}