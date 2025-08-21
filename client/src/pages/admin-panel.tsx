import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type Product, type Category, type User } from "@shared/schema";
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
  Settings, 
  Users, 
  Package, 
  Tags, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye,
  DollarSign,
  Layers,
  UserCheck,
  Star
} from "lucide-react";

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [pendingVendor, setPendingVendor] = useState<any | undefined>();

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    parentId: ""
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    basePrice: "",
    stockQuantity: "",
    brand: "",
    company: "",
    gstRate: "18",
    specifications: "{}",
    quantitySlabs: "[]",
    dynamicCharges: "{}",
    bulkDiscountSlabs: "[]",
    deliveryDiscountSlabs: "[]"
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Mock pending vendors data
  const pendingVendors = [
    {
      id: "pending-1",
      username: "ABC Construction Supplies",
      email: "info@abcsupplies.com",
      businessName: "ABC Construction Supplies Pvt Ltd",
      gstNumber: "29ABCDE1234F1Z5",
      status: "pending",
      requestDate: "2024-01-15",
      documents: ["GST Certificate", "Business License", "PAN Card"]
    },
    {
      id: "pending-2", 
      username: "XYZ Building Materials",
      email: "contact@xyzmaterials.com",
      businessName: "XYZ Building Materials Ltd",
      gstNumber: "29XYZAB1234C1D2",
      status: "pending",
      requestDate: "2024-01-16",
      documents: ["GST Certificate", "Trade License"]
    }
  ];

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "", parentId: "" });
      toast({ title: "Category created successfully" });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      apiRequest("PUT", `/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowCategoryModal(false);
      setEditingCategory(undefined);
      toast({ title: "Category updated successfully" });
    }
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowProductModal(false);
      setProductForm({
        name: "", description: "", categoryId: "", basePrice: "",
        stockQuantity: "", brand: "", company: "", gstRate: "18",
        specifications: "{}", quantitySlabs: "[]", dynamicCharges: "{}",
        bulkDiscountSlabs: "[]", deliveryDiscountSlabs: "[]"
      });
      toast({ title: "Product created successfully" });
    }
  });

  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: { ...categoryForm, parentId: categoryForm.parentId || null }
      });
    } else {
      createCategoryMutation.mutate({
        ...categoryForm,
        parentId: categoryForm.parentId || null
      });
    }
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specifications = JSON.parse(productForm.specifications || "{}");
      const quantitySlabs = JSON.parse(productForm.quantitySlabs || "[]");
      const dynamicCharges = JSON.parse(productForm.dynamicCharges || "{}");
      const bulkDiscountSlabs = JSON.parse(productForm.bulkDiscountSlabs || "[]");
      const deliveryDiscountSlabs = JSON.parse(productForm.deliveryDiscountSlabs || "[]");
      
      createProductMutation.mutate({
        ...productForm,
        basePrice: parseFloat(productForm.basePrice),
        stockQuantity: parseInt(productForm.stockQuantity),
        gstRate: parseFloat(productForm.gstRate),
        specifications,
        quantitySlabs,
        dynamicCharges,
        bulkDiscountSlabs,
        deliveryDiscountSlabs,
        vendorId: user?.id // Admin creates for system
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON in specifications, quantity slabs, dynamic charges, or discount slabs",
        variant: "destructive"
      });
    }
  };

  const approveVendor = (vendorId: string) => {
    toast({
      title: "Vendor Approved",
      description: "Vendor application has been approved and they can now start selling."
    });
  };

  const rejectVendor = (vendorId: string) => {
    toast({
      title: "Vendor Rejected",
      description: "Vendor application has been rejected.",
      variant: "destructive"
    });
  };

  // Allow admin access for development - remove authentication check
  // if (!user || !isAdmin) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
  //         <p className="text-gray-500">You don't have permission to access the admin panel.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Admin Panel"
          subtitle="Manage platform operations and vendors"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="platform">Platform</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Products</p>
                        <p className="text-2xl font-semibold text-gray-900">{products?.length || 0}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Categories</p>
                        <p className="text-2xl font-semibold text-gray-900">{categories?.length || 0}</p>
                      </div>
                      <Tags className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                        <p className="text-2xl font-semibold text-gray-900">{pendingVendors.length}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                        <p className="text-2xl font-semibold text-gray-900">43</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">New vendor approved</p>
                        <p className="text-sm text-gray-500">ABC Construction Supplies - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">New product added</p>
                        <p className="text-sm text-gray-500">Premium Portland Cement - 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Vendor application received</p>
                        <p className="text-sm text-gray-500">XYZ Building Materials - 6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Category Management</h2>
                <Button onClick={() => setShowCategoryModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Parent Category</TableHead>
                        <TableHead>Products Count</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>
                            {category.parentId 
                              ? categories.find(c => c.id === category.parentId)?.name || "Unknown"
                              : "Root Category"
                            }
                          </TableCell>
                          <TableCell>
                            {products?.filter(p => p.categoryId === category.id).length || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryForm({
                                    name: category.name,
                                    description: category.description || "",
                                    parentId: category.parentId || ""
                                  });
                                  setShowCategoryModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <Button onClick={() => setShowProductModal(true)}>
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
                        <TableHead>Base Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((product) => (
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
                          <TableCell>{product.stockQuantity || 0}</TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Layers className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vendor Management Tab */}
            <TabsContent value="vendors" className="space-y-6">
              <h2 className="text-2xl font-bold">Vendor Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                        <p className="text-2xl font-semibold text-orange-600">{pendingVendors.length}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                        <p className="text-2xl font-semibold text-green-600">43</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">This Month Revenue</p>
                        <p className="text-2xl font-semibold text-blue-600">₹2.4M</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {pendingVendors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">Pending Vendor Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingVendors.map((vendor) => (
                        <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{vendor.businessName}</h3>
                            <p className="text-sm text-gray-500">{vendor.email}</p>
                            <p className="text-sm text-gray-500">GST: {vendor.gstNumber}</p>
                            <p className="text-xs text-gray-400">Applied on {vendor.requestDate}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPendingVendor(vendor);
                                setShowVendorModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveVendor(vendor.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectVendor(vendor.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Active Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: "Premium Building Supplies", status: "Active", products: 87, revenue: "₹4.2L", rating: 4.8 },
                        { name: "Steel & Iron Works", status: "Active", products: 34, revenue: "₹2.1L", rating: 4.6 },
                        { name: "Cement Solutions Ltd", status: "Active", products: 23, revenue: "₹3.8L", rating: 4.9 },
                      ].map((vendor, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>
                            <Badge variant="default">{vendor.status}</Badge>
                          </TableCell>
                          <TableCell>{vendor.products}</TableCell>
                          <TableCell>{vendor.revenue}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              {vendor.rating}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <h2 className="text-2xl font-bold">Pricing & Charges Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Charges</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Transaction Fee (%)</Label>
                      <Input defaultValue="2.5" />
                    </div>
                    <div>
                      <Label>Delivery Charge (₹)</Label>
                      <Input defaultValue="50" />
                    </div>
                    <div>
                      <Label>Loading Charge (₹)</Label>
                      <Input defaultValue="25" />
                    </div>
                    <Button>Update Charges</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tax Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>GST Rate (%)</Label>
                      <Input defaultValue="18" />
                    </div>
                    <div>
                      <Label>CGST Rate (%)</Label>
                      <Input defaultValue="9" />
                    </div>
                    <div>
                      <Label>SGST Rate (%)</Label>
                      <Input defaultValue="9" />
                    </div>
                    <Button>Update Tax Rates</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Platform Tab */}
            <TabsContent value="platform" className="space-y-6">
              <h2 className="text-2xl font-bold">Platform Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Platform Name</Label>
                      <Input defaultValue="BuildMart AI" />
                    </div>
                    <div>
                      <Label>Support Email</Label>
                      <Input defaultValue="support@buildmart.ai" />
                    </div>
                    <div>
                      <Label>Max Products per Vendor</Label>
                      <Input defaultValue="1000" />
                    </div>
                    <Button>Update Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-semibold">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Transactions</span>
                      <span className="font-semibold">₹12.4M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Revenue</span>
                      <span className="font-semibold">₹3.1M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate</span>
                      <span className="font-semibold text-green-600">+24%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCategory} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="parentCategory">Parent Category</Label>
              <Select value={categoryForm.parentId} onValueChange={(value) => 
                setCategoryForm({...categoryForm, parentId: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root Category)</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingCategory ? "Update" : "Create"} Category
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowCategoryModal(false);
                setEditingCategory(undefined);
                setCategoryForm({ name: "", description: "", parentId: "" });
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  placeholder="e.g., UltraTech"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={productForm.company}
                  onChange={(e) => setProductForm({...productForm, company: e.target.value})}
                  placeholder="e.g., UltraTech Cement Ltd"
                />
              </div>
              <div>
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Input
                  id="gstRate"
                  type="number"
                  step="0.01"
                  value={productForm.gstRate}
                  onChange={(e) => setProductForm({...productForm, gstRate: e.target.value})}
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
              />
            </div>
            
            <div>
              <Label htmlFor="quantitySlabs">Quantity Slabs (JSON)</Label>
              <Textarea
                id="quantitySlabs"
                placeholder='[{"minQty": 1, "maxQty": 10, "price": 500}, {"minQty": 11, "maxQty": 50, "price": 480}]'
                value={productForm.quantitySlabs}
                onChange={(e) => setProductForm({...productForm, quantitySlabs: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="bulkDiscountSlabs">Bulk Discount Slabs (JSON)</Label>
              <Textarea
                id="bulkDiscountSlabs"
                placeholder='[{"minQty": 20, "maxQty": 50, "discount": 5}, {"minQty": 51, "maxQty": 100, "discount": 10}]'
                value={productForm.bulkDiscountSlabs}
                onChange={(e) => setProductForm({...productForm, bulkDiscountSlabs: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="deliveryDiscountSlabs">Delivery Discount Slabs (JSON)</Label>
              <Textarea
                id="deliveryDiscountSlabs"
                placeholder='[{"minOrderValue": 5000, "maxOrderValue": 10000, "discount": 5}, {"minOrderValue": 10001, "discount": 10}]'
                value={productForm.deliveryDiscountSlabs}
                onChange={(e) => setProductForm({...productForm, deliveryDiscountSlabs: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="dynamicCharges">Dynamic Charges (JSON)</Label>
              <Textarea
                id="dynamicCharges"
                placeholder='{"loading": 100, "unloading": 50, "express_delivery": 200}'
                value={productForm.dynamicCharges}
                onChange={(e) => setProductForm({...productForm, dynamicCharges: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Create Product</Button>
              <Button type="button" variant="outline" onClick={() => setShowProductModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor Review Modal */}
      {pendingVendor && (
        <Dialog open={showVendorModal} onOpenChange={setShowVendorModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vendor Application Review</DialogTitle>
              <DialogDescription>
                Review vendor application and documents
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Business Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name</Label>
                    <p className="text-sm">{pendingVendor.businessName}</p>
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <p className="text-sm">{pendingVendor.email}</p>
                  </div>
                  <div>
                    <Label>GST Number</Label>
                    <p className="text-sm">{pendingVendor.gstNumber}</p>
                  </div>
                  <div>
                    <Label>Application Date</Label>
                    <p className="text-sm">{pendingVendor.requestDate}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Documents Submitted</h3>
                <div className="space-y-2">
                  {pendingVendor.documents.map((doc: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{doc}</span>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => approveVendor(pendingVendor.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Vendor
                </Button>
                <Button variant="destructive" onClick={() => rejectVendor(pendingVendor.id)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
                <Button variant="outline" onClick={() => setShowVendorModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}