import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type Product, type Category, type User, type MarketingMaterial, type Contractor, type Advance, type Order, type PricingRule } from "@shared/schema";
import { generateCSVTemplate } from "@shared/csvTemplates";
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
  Star,
  X,
  Upload,
  FileText,
  Download,
  Calendar,
  Clock,
  TrendingUp
} from "lucide-react";

export default function ComprehensiveAdminPanel() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<any | undefined>();
  const [editingItem, setEditingItem] = useState<any | undefined>();
  const [exportType, setExportType] = useState('orders');
  const [exportDateRange, setExportDateRange] = useState({ startDate: '', endDate: '' });
  const [csvUploadType, setCsvUploadType] = useState('products');

  // Entity queries
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: marketingMaterials } = useQuery({
    queryKey: ["/api/marketing-materials"],
  });

  const { data: contractors } = useQuery({
    queryKey: ["/api/contractors"],
  });

  const { data: advances } = useQuery({
    queryKey: ["/api/advances"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: pricingRules } = useQuery({
    queryKey: ["/api/pricing-rules"],
  });

  // Dynamic action handlers
  const handleView = (item: any, type: string) => {
    setViewingItem({ ...item, type });
    setShowViewModal(true);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    setShowEditModal(true);
  };

  const handleDelete = (id: string, type: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      deleteItem.mutate({ id, type });
    }
  };

  const deleteItem = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const endpoints = {
        category: "/api/categories",
        product: "/api/products",
        user: "/api/users",
        'marketing-material': "/api/marketing-materials",
        contractor: "/api/contractors",
        advance: "/api/advances",
        order: "/api/orders",
        'pricing-rule': "/api/pricing-rules"
      };
      await apiRequest("DELETE", `${endpoints[type as keyof typeof endpoints]}/${id}`);
    },
    onSuccess: (_, { type }) => {
      const queryKeys = {
        category: ["/api/categories"],
        product: ["/api/products"],
        user: ["/api/users"],
        'marketing-material': ["/api/marketing-materials"],
        contractor: ["/api/contractors"],
        advance: ["/api/advances"],
        order: ["/api/orders"],
        'pricing-rule': ["/api/pricing-rules"]
      };
      queryClient.invalidateQueries({ queryKey: queryKeys[type as keyof typeof queryKeys] });
      toast({
        title: "Success",
        description: `${type} deleted successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  // Add Vendor Mutation
  const addVendor = useMutation({
    mutationFn: async (vendorData: any) => {
      return await apiRequest("POST", "/api/users", vendorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowAddVendorModal(false);
      toast({
        title: "Success",
        description: "Vendor added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      });
    },
  });

  // Add Material Mutation
  const addMaterial = useMutation({
    mutationFn: async (materialData: any) => {
      return await apiRequest("POST", "/api/marketing-materials", materialData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-materials"] });
      setShowAddMaterialModal(false);
      toast({
        title: "Success",
        description: "Marketing material added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add marketing material",
        variant: "destructive",
      });
    },
  });

  // Update Item Mutation
  const updateItem = useMutation({
    mutationFn: async ({ id, type, data }: { id: string; type: string; data: any }) => {
      const endpoints = {
        category: "/api/categories",
        product: "/api/products",
        user: "/api/users",
        'marketing-material': "/api/marketing-materials",
        contractor: "/api/contractors",
        advance: "/api/advances",
        order: "/api/orders",
        'pricing-rule': "/api/pricing-rules"
      };
      return await apiRequest("PUT", `${endpoints[type as keyof typeof endpoints]}/${id}`, data);
    },
    onSuccess: (_, { type }) => {
      const queryKeys = {
        category: ["/api/categories"],
        product: ["/api/products"],
        user: ["/api/users"],
        'marketing-material': ["/api/marketing-materials"],
        contractor: ["/api/contractors"],
        advance: ["/api/advances"],
        order: ["/api/orders"],
        'pricing-rule': ["/api/pricing-rules"]
      };
      queryClient.invalidateQueries({ queryKey: queryKeys[type as keyof typeof queryKeys] });
      setShowEditModal(false);
      toast({
        title: "Success",
        description: `${type} updated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update item`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Comprehensive Admin Panel"
          subtitle="Complete platform management with all features"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
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
                        <p className="text-sm font-medium text-gray-500">Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{orders?.length || 0}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contractors</p>
                        <p className="text-2xl font-semibold text-gray-900">{contractors?.length || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Tab with Dynamic Actions */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    try {
                      const sampleData = generateCSVTemplate('products');
                      const blob = new Blob([sampleData], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'sample_products.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({
                        title: "Success",
                        description: "Sample CSV downloaded",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV Template
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
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
                        <TableHead>Featured</TableHead>
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
                            <Button
                              size="sm"
                              variant={product.isFeatured ? "default" : "outline"}
                              onClick={() => {
                                apiRequest("PATCH", `/api/products/${product.id}/featured`, {
                                  isFeatured: !product.isFeatured
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                                  toast({
                                    title: "Success",
                                    description: `Product ${product.isFeatured ? 'removed from' : 'added to'} featured list`,
                                  });
                                });
                              }}
                            >
                              {product.isFeatured ? 
                                <Star className="h-4 w-4 fill-current text-yellow-500" /> : 
                                <Star className="h-4 w-4" />
                              }
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(product, 'product')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(product, 'product')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id, 'product')}>
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

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Categories Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                </CardHeader>
                <CardContent>
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
                          <TableCell>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-gray-500">ID: {category.id.slice(0,8)}...</p>
                            </div>
                          </TableCell>
                          <TableCell>{category.description || 'No description'}</TableCell>
                          <TableCell>
                            {category.parentId ? 
                              categories?.find(c => c.id === category.parentId)?.name || 'Unknown' : 
                              'Root Category'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {products?.filter(p => p.categoryId === category.id).length || 0} products
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(category, 'category')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(category, 'category')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id, 'category')}>
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

            {/* Enhanced Vendors Tab */}
            <TabsContent value="vendors" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Vendor Management & Analytics</h2>
                <Button onClick={() => setShowAddVendorModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </div>

              {/* Vendor Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {users?.filter(user => user.role === 'vendor').length || 0}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                        <p className="text-2xl font-semibold text-green-700">
                          {users?.filter(user => user.role === 'vendor' && user.isActive !== false).length || 0}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                        <p className="text-2xl font-semibold text-yellow-700">
                          {users?.filter(user => user.role === 'vendor' && user.approvalStatus === 'pending').length || 0}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">This Month</p>
                        <p className="text-2xl font-semibold text-purple-700">
                          {users?.filter(user => 
                            user.role === 'vendor' && 
                            user.createdAt && 
                            new Date(user.createdAt).getMonth() === new Date().getMonth()
                          ).length || 0}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vendor Status Filter */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Vendor Directory</CardTitle>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vendors</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending Approval</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor Details</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Business Info</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Approval Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.filter(user => user.role === 'vendor').map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{vendor.username}</p>
                              <p className="text-sm text-gray-500">ID: {vendor.id.slice(0,8)}...</p>
                              <p className="text-xs text-gray-400">
                                Joined: {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{vendor.email || 'No email'}</p>
                              <p className="text-sm">{vendor.phone || 'No phone'}</p>
                              <p className="text-xs text-gray-500">{vendor.city || 'Location not set'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{vendor.companyName || 'No company'}</p>
                              <p className="text-xs text-gray-500">
                                Products: {products?.filter(p => p.vendorId === vendor.id).length || 0}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {vendor.role}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-sm">4.5</span>
                              </div>
                              <p className="text-xs text-gray-500">Orders: {vendor.totalOrders || 0}</p>
                              <p className="text-xs text-gray-500">Sales: ₹{vendor.totalSpent || '0'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Badge variant={
                                vendor.approvalStatus === 'approved' ? "default" : 
                                vendor.approvalStatus === 'pending' ? "secondary" : 
                                vendor.approvalStatus === 'rejected' ? "destructive" : "outline"
                              }>
                                {vendor.approvalStatus || 'pending'}
                              </Badge>
                              <div className="flex gap-1">
                                {vendor.approvalStatus !== 'approved' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-6 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => {
                                      updateItem.mutate({
                                        id: vendor.id,
                                        type: 'user',
                                        data: { approvalStatus: 'approved', isActive: true }
                                      });
                                    }}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {vendor.approvalStatus !== 'rejected' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-6 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                      updateItem.mutate({
                                        id: vendor.id,
                                        type: 'user',
                                        data: { approvalStatus: 'rejected', isActive: false }
                                      });
                                    }}
                                  >
                                    Reject
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleView(vendor, 'vendor')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor, 'vendor')}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(vendor.id, 'vendor')}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => {
                                    updateItem.mutate({
                                      id: vendor.id,
                                      type: 'user',
                                      data: { isActive: !vendor.isActive }
                                    });
                                  }}
                                >
                                  {vendor.isActive !== false ? 'Suspend' : 'Activate'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 px-2 text-xs"
                                >
                                  Analytics
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Vendor Performance Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Vendors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users?.filter(user => user.role === 'vendor').slice(0, 5).map((vendor, index) => (
                        <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{vendor.username}</p>
                              <p className="text-sm text-gray-500">{vendor.companyName || 'No company'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{vendor.totalSpent || '0'}</p>
                            <p className="text-sm text-gray-500">{vendor.totalOrders || 0} orders</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Vendor Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users?.filter(user => user.role === 'vendor').slice(0, 5).map((vendor) => (
                        <div key={vendor.id} className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-medium">{vendor.username}</p>
                              <p className="text-sm text-gray-500">
                                Last active: {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : 'Never'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={vendor.isActive !== false ? "default" : "secondary"}>
                            {vendor.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Marketing Materials</h2>
                <Button onClick={() => setShowAddMaterialModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target Audience</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketingMaterials?.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{material.title}</p>
                              <p className="text-sm text-gray-500">{material.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{material.type}</Badge>
                          </TableCell>
                          <TableCell>{material.targetAudience || 'All Users'}</TableCell>
                          <TableCell>
                            {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={(material.status === 'active') ? "default" : "secondary"}>
                              {material.status || 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(material, 'marketing-material')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(material, 'marketing-material')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(material.id, 'marketing-material')}>
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

            {/* Comprehensive Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Comprehensive Pricing Management</h2>
              </div>

              {/* Transportation Charges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transportation Charges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Configure charges based on distance and quantity
                      </p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Distance-based charges (₹/km)</Label>
                            <Input placeholder="5.50" type="number" step="0.01" />
                          </div>
                          <div>
                            <Label>Fuel surcharge (%)</Label>
                            <Input placeholder="12" type="number" step="0.1" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Quantity-based charges (₹/unit)</Label>
                            <Input placeholder="2.50" type="number" step="0.01" />
                          </div>
                          <div>
                            <Label>Weight-based charges (₹/kg)</Label>
                            <Input placeholder="0.50" type="number" step="0.01" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Base transportation charge (₹)</Label>
                            <Input placeholder="500" type="number" />
                          </div>
                          <div>
                            <Label>Minimum order charge (₹)</Label>
                            <Input placeholder="200" type="number" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Urban area multiplier</Label>
                            <Input placeholder="1.2" type="number" step="0.1" />
                          </div>
                          <div>
                            <Label>Rural area multiplier</Label>
                            <Input placeholder="1.5" type="number" step="0.1" />
                          </div>
                        </div>
                      </div>
                      <Button className="w-full">Save Transportation Rules</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hamali Charges (Loading/Unloading)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Loading/unloading charges based on bags and weights
                      </p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Per bag loading charge (₹)</Label>
                            <Input placeholder="15" type="number" step="0.01" />
                          </div>
                          <div>
                            <Label>Per bag unloading charge (₹)</Label>
                            <Input placeholder="12" type="number" step="0.01" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Per kg weight charge (₹)</Label>
                            <Input placeholder="0.25" type="number" step="0.01" />
                          </div>
                          <div>
                            <Label>Heavy item surcharge (₹/kg)</Label>
                            <Input placeholder="0.50" type="number" step="0.01" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Minimum hamali charge (₹)</Label>
                            <Input placeholder="100" type="number" />
                          </div>
                          <div>
                            <Label>Maximum hamali charge (₹)</Label>
                            <Input placeholder="2000" type="number" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Floor level charges (₹/floor)</Label>
                            <Input placeholder="25" type="number" />
                          </div>
                          <div>
                            <Label>Weekend/Holiday multiplier</Label>
                            <Input placeholder="1.5" type="number" step="0.1" />
                          </div>
                        </div>
                        <div>
                          <Label>Special handling charges (fragile items) (₹)</Label>
                          <Input placeholder="50" type="number" />
                        </div>
                      </div>
                      <Button className="w-full">Save Hamali Rules</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Pricing Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Pricing Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Time-based Charges</h4>
                      <div>
                        <Label>Peak hours surcharge (%)</Label>
                        <Input placeholder="20" type="number" />
                      </div>
                      <div>
                        <Label>Off-peak discount (%)</Label>
                        <Input placeholder="10" type="number" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Volume Discounts</h4>
                      <div>
                        <Label>Bulk order threshold (qty)</Label>
                        <Input placeholder="100" type="number" />
                      </div>
                      <div>
                        <Label>Bulk discount rate (%)</Label>
                        <Input placeholder="5" type="number" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Express Delivery</h4>
                      <div>
                        <Label>Same day delivery (₹)</Label>
                        <Input placeholder="500" type="number" />
                      </div>
                      <div>
                        <Label>Next day delivery (₹)</Label>
                        <Input placeholder="200" type="number" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button className="w-full">Save Advanced Pricing Configuration</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management Tab with Order Status */}
            <TabsContent value="data" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Data Management & Analytics</h2>
                <Button onClick={() => setShowExportModal(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              {/* Orders Management with Status Control */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders Management</CardTitle>
                </CardHeader>
                <CardContent>
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
                      {orders?.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                          <TableCell>{order.customerEmail}</TableCell>
                          <TableCell>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Select 
                              value={order.status} 
                              onValueChange={(newStatus) => {
                                apiRequest("PATCH", `/api/orders/${order.id}/status`, {
                                  status: newStatus
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
                                  toast({
                                    title: "Success",
                                    description: `Order status updated to ${newStatus}`,
                                  });
                                });
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="packed">Packed</SelectItem>
                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(order, 'order')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(order, 'order')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id, 'order')}>
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

              {/* Enhanced Data Display with Quotes, Advances, and Contractors */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Quotations Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Quotations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({length: 5}, (_, i) => (
                        <div key={i} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">Quote #{`QT00${i+1}`}</p>
                              <p className="text-xs text-gray-600">customer{i+1}@company.com</p>
                              <p className="text-xs text-gray-500">{new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">₹{(45000 + i * 15000).toLocaleString()}</p>
                              <Badge variant={i % 3 === 0 ? "default" : "outline"} className="text-xs">
                                {i % 3 === 0 ? 'Approved' : i % 3 === 1 ? 'Pending' : 'Under Review'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        View All Quotations
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Advance Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Advance Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {advances?.slice(0, 5).map((advance, i) => (
                        <div key={advance.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">Booking #{advance.advanceNumber || `ADV${String(i+1).padStart(3, '0')}`}</p>
                              <p className="text-xs text-gray-600">{advance.customerEmail}</p>
                              <p className="text-xs text-gray-500">{advance.createdAt ? new Date(advance.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">₹{parseFloat(advance.advanceAmount).toLocaleString()}</p>
                              <Badge variant={advance.paymentStatus === 'completed' ? "default" : "outline"} className="text-xs">
                                {advance.paymentStatus || 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        View All Advances
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contractors Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Contractors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contractors?.slice(0, 5).map((contractor, i) => (
                        <div key={contractor.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{contractor.name}</p>
                              <p className="text-xs text-gray-600">{contractor.email}</p>
                              <p className="text-xs text-gray-500">
                                Reg: {contractor.createdAt ? new Date(contractor.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">{contractor.experienceYears || 0} years exp</p>
                              <Badge variant={contractor.isVerified ? "default" : "outline"} className="text-xs">
                                {contractor.isVerified ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        View All Contractors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CSV Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>CSV Data Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Select value={csvUploadType} onValueChange={setCsvUploadType}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="categories">Categories</SelectItem>
                          <SelectItem value="contractors">Contractors</SelectItem>
                          <SelectItem value="marketingMaterials">Marketing Materials</SelectItem>
                          <SelectItem value="orders">Orders</SelectItem>
                          <SelectItem value="advances">Advances</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CSV
                      </Button>
                      <Button variant="outline" onClick={async () => {
                        try {
                          // Dynamic import to fix build issues
                          const { generateCSVTemplate } = await import('@shared/csvTemplates');
                          const sampleData = generateCSVTemplate(csvUploadType);
                          const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `sample_${csvUploadType}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast({
                            title: "CSV Download Success",
                            description: `Sample ${csvUploadType} template downloaded successfully`,
                          });
                        } catch (error: any) {
                          console.error('CSV Download Error:', error);
                          toast({
                            title: "Download Error",
                            description: "Failed to download CSV template. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Sample
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Upload data in CSV format. Download sample file to see the required format.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <h2 className="text-2xl font-bold">Data Export & Analytics</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Excel Export with Date Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Data Type</Label>
                      <Select value={exportType} onValueChange={setExportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orders">Orders</SelectItem>
                          <SelectItem value="advances">Advances</SelectItem>
                          <SelectItem value="quotations">Quotations</SelectItem>
                          <SelectItem value="contractors">Contractors</SelectItem>
                          <SelectItem value="users">Users</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="marketing">Marketing Materials</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={exportDateRange.startDate}
                          onChange={(e) => setExportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={exportDateRange.endDate}
                          onChange={(e) => setExportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        const params = new URLSearchParams({
                          ...(exportDateRange.startDate && { startDate: exportDateRange.startDate }),
                          ...(exportDateRange.endDate && { endDate: exportDateRange.endDate })
                        });
                        window.open(`/api/export/${exportType}?${params.toString()}`, '_blank');
                        toast({
                          title: "Success",
                          description: `${exportType} data export started`,
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export to Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* View Item Modal */}
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>View {viewingItem?.type}</DialogTitle>
                <DialogDescription>
                  Detailed information about this {viewingItem?.type}
                </DialogDescription>
              </DialogHeader>
              {viewingItem && (
                <div className="space-y-4">
                  {Object.entries(viewingItem)
                    .filter(([key]) => key !== 'type')
                    .map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-4">
                        <Label className="font-medium">{key}:</Label>
                        <span className="col-span-2">{
                          typeof value === 'object' 
                            ? JSON.stringify(value, null, 2) 
                            : String(value)
                        }</span>
                      </div>
                    ))}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Vendor Modal */}
          <Dialog open={showAddVendorModal} onOpenChange={setShowAddVendorModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Create a new vendor account with login credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const vendorData = {
                  username: formData.get('username'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  role: 'vendor',
                  isActive: true
                };
                addVendor.mutate(vendorData);
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input name="username" id="username" placeholder="vendor_username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input name="email" id="email" type="email" placeholder="vendor@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input name="password" id="password" type="password" placeholder="Create password" required />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button"
                    onClick={() => setShowAddVendorModal(false)}
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={addVendor.isPending}>
                    {addVendor.isPending ? "Adding..." : "Add Vendor"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Material Modal */}
          <Dialog open={showAddMaterialModal} onOpenChange={setShowAddMaterialModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Marketing Material</DialogTitle>
                <DialogDescription>
                  Create a new marketing material for campaigns and promotions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const materialData = {
                  title: formData.get('title'),
                  content: formData.get('content'),
                  type: formData.get('type'),
                  status: 'active',
                  targetAudience: formData.get('targetAudience'),
                  campaignName: formData.get('campaignName')
                };
                addMaterial.mutate(materialData);
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input name="title" id="title" placeholder="Marketing campaign title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="email">Email Template</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="brochure">Brochure</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea name="content" id="content" placeholder="Marketing material content" required className="min-h-[80px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input name="targetAudience" id="targetAudience" placeholder="e.g., contractors, builders" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input name="campaignName" id="campaignName" placeholder="Campaign identifier" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button"
                    onClick={() => setShowAddMaterialModal(false)}
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={addMaterial.isPending}>
                    {addMaterial.isPending ? "Adding..." : "Add Material"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Enhanced Edit Modal */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit {editingItem?.type}</DialogTitle>
                <DialogDescription>
                  Make changes to the {editingItem?.type} details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editingItem) return;
                
                const formData = new FormData(e.currentTarget);
                const data: any = {};
                
                // Collect form data
                Object.entries(editingItem)
                  .filter(([key]) => !['id', 'type', 'createdAt', 'updatedAt'].includes(key))
                  .forEach(([key]) => {
                    const value = formData.get(key);
                    if (key === 'isActive') {
                      data[key] = value === 'true';
                    } else {
                      data[key] = value;
                    }
                  });
                
                updateItem.mutate({ 
                  id: editingItem.id, 
                  type: editingItem.type, 
                  data 
                });
              }} className="space-y-4 max-h-96 overflow-y-auto">
                {editingItem && (
                  <div className="space-y-4">
                    {Object.entries(editingItem)
                      .filter(([key]) => !['id', 'type', 'createdAt', 'updatedAt'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          {key === 'description' || key === 'notes' || key === 'content' ? (
                            <Textarea 
                              name={key}
                              defaultValue={String(value || '')}
                              className="min-h-[80px]"
                            />
                          ) : key === 'role' ? (
                            <Select name={key} defaultValue={String(value || '')}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner_admin">Owner Admin</SelectItem>
                                <SelectItem value="vendor_manager">Vendor Manager</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : key === 'isActive' ? (
                            <Select name={key} defaultValue={String(value || true)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input 
                              name={key}
                              defaultValue={String(value || '')}
                              type={typeof value === 'number' ? 'number' : 'text'}
                            />
                          )}
                        </div>
                      ))}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        variant="outline" 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={updateItem.isPending}>
                        {updateItem.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}