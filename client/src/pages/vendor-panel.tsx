import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type Product, type Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Store, 
  Package, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Award,
  Target
} from "lucide-react";

export default function VendorPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // Vendor profile state
  const [vendorProfile, setVendorProfile] = useState({
    businessName: "",
    gstNumber: "",
    address: "",
    phone: "",
    website: "",
    description: "",
    categories: [],
    certifications: "",
    yearEstablished: "",
    employeeCount: ""
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    basePrice: "",
    stockQuantity: "",
    specifications: "{}",
    quantitySlabs: "[]",
    dynamicCharges: "{}"
  });

  const { data: vendorProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", user?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.id) params.append('vendorId', user.id);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Mock data for vendor analytics
  const vendorStats = {
    totalProducts: vendorProducts?.length || 0,
    activeProducts: vendorProducts?.filter(p => p.isActive).length || 0,
    totalValue: vendorProducts?.reduce((sum, p) => sum + (parseFloat(p.basePrice) * (p.stockQuantity || 0)), 0) || 0,
    lowStockItems: vendorProducts?.filter(p => (p.stockQuantity || 0) < 10).length || 0,
    monthlyOrders: 156,
    monthlyRevenue: 245000,
    rating: 4.7,
    rank: 12
  };

  const recentOrders = [
    { id: "ORD-001", customer: "ABC Construction", amount: 25000, status: "delivered", date: "2024-01-15" },
    { id: "ORD-002", customer: "XYZ Builders", amount: 18500, status: "shipped", date: "2024-01-16" },
    { id: "ORD-003", customer: "PQR Infrastructure", amount: 42000, status: "processing", date: "2024-01-17" },
  ];

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowProductModal(false);
      setProductForm({
        name: "", description: "", categoryId: "", basePrice: "",
        stockQuantity: "", specifications: "{}", quantitySlabs: "[]", dynamicCharges: "{}"
      });
      toast({ title: "Product created successfully" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowProductModal(false);
      setEditingProduct(undefined);
      toast({ title: "Product updated successfully" });
    }
  });

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specifications = JSON.parse(productForm.specifications || "{}");
      const quantitySlabs = JSON.parse(productForm.quantitySlabs || "[]");
      const dynamicCharges = JSON.parse(productForm.dynamicCharges || "{}");
      
      const productData = {
        ...productForm,
        basePrice: parseFloat(productForm.basePrice),
        stockQuantity: parseInt(productForm.stockQuantity),
        specifications,
        quantitySlabs,
        dynamicCharges,
        vendorId: user?.id
      };

      if (editingProduct) {
        updateProductMutation.mutate({ id: editingProduct.id, data: productData });
      } else {
        createProductMutation.mutate(productData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON in specifications, quantity slabs, or dynamic charges",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId,
      basePrice: product.basePrice,
      stockQuantity: (product.stockQuantity || 0).toString(),
      specifications: JSON.stringify(product.specifications || {}, null, 2),
      quantitySlabs: JSON.stringify(product.quantitySlabs || [], null, 2),
      dynamicCharges: JSON.stringify(product.dynamicCharges || {}, null, 2)
    });
    setShowProductModal(true);
  };

  if (!user || user.role !== "vendor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">You don't have permission to access the vendor panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Vendor Dashboard"
          subtitle="Manage your business and products"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="profile">Business Profile</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Products</p>
                        <p className="text-2xl font-semibold text-gray-900">{vendorStats.totalProducts}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                        <p className="text-2xl font-semibold text-gray-900">₹{vendorStats.monthlyRevenue.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rating</p>
                        <p className="text-2xl font-semibold text-gray-900">{vendorStats.rating}/5</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Platform Rank</p>
                        <p className="text-2xl font-semibold text-gray-900">#{vendorStats.rank}</p>
                      </div>
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' : 'outline'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inventory Health</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Customer Satisfaction</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                          </div>
                          <span className="text-sm font-medium">94%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Order Fulfillment</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Products</h2>
                <Button onClick={() => {
                  setEditingProduct(undefined);
                  setProductForm({
                    name: "", description: "", categoryId: "", basePrice: "",
                    stockQuantity: "", specifications: "{}", quantitySlabs: "[]", dynamicCharges: "{}"
                  });
                  setShowProductModal(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading products...
                          </TableCell>
                        </TableRow>
                      ) : vendorProducts?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No products found. Add your first product to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vendorProducts?.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {categories?.find(c => c.id === product.categoryId)?.name || "Unknown"}
                            </TableCell>
                            <TableCell>₹{parseFloat(product.basePrice).toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${
                                (product.stockQuantity || 0) === 0 ? 'text-red-600' :
                                (product.stockQuantity || 0) < 10 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {product.stockQuantity || 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.isActive ? "default" : "secondary"}>
                                {product.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <h2 className="text-2xl font-bold">Order Management</h2>
              
              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' : 'outline'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-2xl font-bold">Business Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => {
                        const revenue = [180000, 220000, 245000, 198000, 267000, 289000][index];
                        return (
                          <div key={month} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{month}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${(revenue / 300000) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-16 text-right">
                                ₹{(revenue / 1000).toFixed(0)}K
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vendorProducts?.slice(0, 5).map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 10} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{(parseFloat(product.basePrice) * (product.stockQuantity || 0)).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Business Profile</h2>
                <Button onClick={() => setShowProfileModal(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Business Name</Label>
                      <p className="text-sm">{vendorProfile.businessName || "Not provided"}</p>
                    </div>
                    <div>
                      <Label>GST Number</Label>
                      <p className="text-sm">{vendorProfile.gstNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <p className="text-sm">{vendorProfile.address || "Not provided"}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{vendorProfile.phone || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{vendorStats.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Platform Rank</span>
                      <span className="font-medium">#{vendorStats.rank}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Orders</span>
                      <span className="font-medium">{vendorStats.monthlyOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productCategory">Category</Label>
                <Select value={productForm.categoryId} onValueChange={(value) => 
                  setProductForm({...productForm, categoryId: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price (₹)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={productForm.basePrice}
                  onChange={(e) => setProductForm({...productForm, basePrice: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="specifications">Specifications (JSON)</Label>
              <Textarea
                id="specifications"
                placeholder='{"grade": "53", "size": "50kg"}'
                value={productForm.specifications}
                onChange={(e) => setProductForm({...productForm, specifications: e.target.value})}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="quantitySlabs">Quantity Slabs (JSON)</Label>
              <Textarea
                id="quantitySlabs"
                placeholder='[{"minQty": 1, "maxQty": 10, "price": 500}, {"minQty": 11, "maxQty": 50, "price": 480}]'
                value={productForm.quantitySlabs}
                onChange={(e) => setProductForm({...productForm, quantitySlabs: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">
                {editingProduct ? "Update" : "Create"} Product
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowProductModal(false);
                setEditingProduct(undefined);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Business Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={vendorProfile.businessName}
                  onChange={(e) => setVendorProfile({...vendorProfile, businessName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={vendorProfile.gstNumber}
                  onChange={(e) => setVendorProfile({...vendorProfile, gstNumber: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={vendorProfile.address}
                onChange={(e) => setVendorProfile({...vendorProfile, address: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={vendorProfile.phone}
                  onChange={(e) => setVendorProfile({...vendorProfile, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={vendorProfile.website}
                  onChange={(e) => setVendorProfile({...vendorProfile, website: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={vendorProfile.description}
                onChange={(e) => setVendorProfile({...vendorProfile, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button>Update Profile</Button>
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}