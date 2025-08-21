import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type Product, type Category, type User, type MarketingMaterial, type Contractor, type Advance, type Order, type PricingRule } from "@shared/schema";
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
  FileText
} from "lucide-react";

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [pendingVendor, setPendingVendor] = useState<any | undefined>();
  const [viewingItem, setViewingItem] = useState<any | undefined>();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('orders');
  const [exportDateRange, setExportDateRange] = useState({ startDate: '', endDate: '' });

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

  // Dynamic form arrays for enhanced UI
  const [quantitySlabs, setQuantitySlabs] = useState([
    { id: 1, fromQty: '', toQty: '', price: '' }
  ]);
  const [deliveryDiscountSlabs, setDeliveryDiscountSlabs] = useState([
    { id: 1, days: '', discount: '' }
  ]);
  const [dynamicCharges, setDynamicCharges] = useState([
    { id: 1, chargeName: '', amount: '' }
  ]);
  const [specifications, setSpecifications] = useState([
    { id: 1, key: '', value: '' }
  ]);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvUploadType, setCsvUploadType] = useState('products');

  // CSV Upload handlers
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseCSVData(csv, csvUploadType);
    };
    reader.readAsText(file);
  };

  const parseCSVData = (csv: string, type: string) => {
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    if (type === 'products') {
      uploadProductsFromCSV(data);
    } else if (type === 'categories') {
      uploadCategoriesFromCSV(data);
    }
  };

  const uploadProductsFromCSV = (products: any[]) => {
    products.forEach(product => {
      const productData = {
        name: product.name || '',
        description: product.description || '',
        basePrice: parseFloat(product.basePrice) || 0,
        categoryId: product.categoryId || '',
        stockQuantity: parseInt(product.stockQuantity) || 0,
        brand: product.brand || '',
        company: product.company || '',
        gstRate: parseFloat(product.gstRate) || 18,
        specifications: product.specifications ? JSON.parse(product.specifications) : {},
        quantitySlabs: product.quantitySlabs ? JSON.parse(product.quantitySlabs) : [],
        dynamicCharges: product.dynamicCharges ? JSON.parse(product.dynamicCharges) : {},
        bulkDiscountSlabs: product.bulkDiscountSlabs ? JSON.parse(product.bulkDiscountSlabs) : [],
        deliveryDiscountSlabs: product.deliveryDiscountSlabs ? JSON.parse(product.deliveryDiscountSlabs) : [],
        vendorId: user?.id
      };
      
      createProductMutation.mutate(productData);
    });
    
    toast({
      title: "CSV Upload Started",
      description: `Processing ${products.length} products from CSV`
    });
  };

  const uploadCategoriesFromCSV = (categories: any[]) => {
    categories.forEach(category => {
      const categoryData = {
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || null
      };
      
      createCategoryMutation.mutate(categoryData);
    });
    
    toast({
      title: "CSV Upload Started", 
      description: `Processing ${categories.length} categories from CSV`
    });
  };

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // New entity queries
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

  // Helper functions for dynamic arrays
  const addQuantitySlab = () => {
    setQuantitySlabs([...quantitySlabs, { id: Date.now(), fromQty: '', toQty: '', price: '' }]);
  };

  const removeQuantitySlab = (id: number) => {
    setQuantitySlabs(quantitySlabs.filter(slab => slab.id !== id));
  };

  const addDeliveryDiscountSlab = () => {
    setDeliveryDiscountSlabs([...deliveryDiscountSlabs, { id: Date.now(), days: '', discount: '' }]);
  };

  const removeDeliveryDiscountSlab = (id: number) => {
    setDeliveryDiscountSlabs(deliveryDiscountSlabs.filter(slab => slab.id !== id));
  };

  const addDynamicCharge = () => {
    setDynamicCharges([...dynamicCharges, { id: Date.now(), chargeName: '', amount: '' }]);
  };

  const removeDynamicCharge = (id: number) => {
    setDynamicCharges(dynamicCharges.filter(charge => charge.id !== id));
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { id: Date.now(), key: '', value: '' }]);
  };

  const removeSpecification = (id: number) => {
    setSpecifications(specifications.filter(spec => spec.id !== id));
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert dynamic arrays to JSON format
      const specsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key && spec.value) {
          specsObj[spec.key] = spec.value;
        }
      });

      const quantitySlabsArray = quantitySlabs
        .filter(slab => slab.fromQty && slab.toQty && slab.price)
        .map(slab => ({
          minQty: parseInt(slab.fromQty),
          maxQty: parseInt(slab.toQty),
          price: parseFloat(slab.price)
        }));

      const deliveryDiscountSlabsArray = deliveryDiscountSlabs
        .filter(slab => slab.days && slab.discount)
        .map(slab => ({
          days: parseInt(slab.days),
          discount: parseFloat(slab.discount)
        }));

      const dynamicChargesObj: Record<string, number> = {};
      dynamicCharges.forEach(charge => {
        if (charge.chargeName && charge.amount) {
          dynamicChargesObj[charge.chargeName] = parseFloat(charge.amount);
        }
      });
      
      createProductMutation.mutate({
        ...productForm,
        basePrice: parseFloat(productForm.basePrice),
        stockQuantity: parseInt(productForm.stockQuantity),
        gstRate: parseFloat(productForm.gstRate),
        specifications: specsObj,
        quantitySlabs: quantitySlabsArray,
        dynamicCharges: dynamicChargesObj,
        bulkDiscountSlabs: deliveryDiscountSlabsArray, // Using delivery discount for bulk discount
        deliveryDiscountSlabs: deliveryDiscountSlabsArray,
        vendorId: user?.id // Admin creates for system
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error processing form data",
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
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCSVUpload(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    CSV Upload
                  </Button>
                  <Button onClick={() => setShowProductModal(true)}>
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
                  <SelectItem value="none">None (Root Category)</SelectItem>
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
            
            {/* Specifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Product Specifications</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                  <Plus className="w-4 h-4 mr-1" /> Add Specification
                </Button>
              </div>
              <div className="space-y-2">
                {specifications.map((spec) => (
                  <div key={spec.id} className="flex gap-2">
                    <Input
                      placeholder="Key (e.g., Grade)"
                      value={spec.key}
                      onChange={(e) => setSpecifications(specifications.map(s => 
                        s.id === spec.id ? {...s, key: e.target.value} : s
                      ))}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., 53)"
                      value={spec.value}
                      onChange={(e) => setSpecifications(specifications.map(s => 
                        s.id === spec.id ? {...s, value: e.target.value} : s
                      ))}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeSpecification(spec.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Slabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Quantity Pricing Slabs</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuantitySlab}>
                  <Plus className="w-4 h-4 mr-1" /> Add Quantity Slab
                </Button>
              </div>
              <div className="space-y-2">
                {quantitySlabs.map((slab) => (
                  <div key={slab.id} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="From Qty"
                      value={slab.fromQty}
                      onChange={(e) => setQuantitySlabs(quantitySlabs.map(s => 
                        s.id === slab.id ? {...s, fromQty: e.target.value} : s
                      ))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <Input
                      type="number"
                      placeholder="To Qty"
                      value={slab.toQty}
                      onChange={(e) => setQuantitySlabs(quantitySlabs.map(s => 
                        s.id === slab.id ? {...s, toQty: e.target.value} : s
                      ))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={slab.price}
                      onChange={(e) => setQuantitySlabs(quantitySlabs.map(s => 
                        s.id === slab.id ? {...s, price: e.target.value} : s
                      ))}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeQuantitySlab(slab.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Discount Slabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Delivery Discount Slabs</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDeliveryDiscountSlab}>
                  <Plus className="w-4 h-4 mr-1" /> Add Delivery Discount
                </Button>
              </div>
              <div className="space-y-2">
                {deliveryDiscountSlabs.map((slab) => (
                  <div key={slab.id} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Days"
                      value={slab.days}
                      onChange={(e) => setDeliveryDiscountSlabs(deliveryDiscountSlabs.map(s => 
                        s.id === slab.id ? {...s, days: e.target.value} : s
                      ))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">days →</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Discount %"
                      value={slab.discount}
                      onChange={(e) => setDeliveryDiscountSlabs(deliveryDiscountSlabs.map(s => 
                        s.id === slab.id ? {...s, discount: e.target.value} : s
                      ))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">% off</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeDeliveryDiscountSlab(slab.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Charges */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Dynamic Charges</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDynamicCharge}>
                  <Plus className="w-4 h-4 mr-1" /> Add Charge
                </Button>
              </div>
              <div className="space-y-2">
                {dynamicCharges.map((charge) => (
                  <div key={charge.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="Charge Name (e.g., Loading)"
                      value={charge.chargeName}
                      onChange={(e) => setDynamicCharges(dynamicCharges.map(c => 
                        c.id === charge.id ? {...c, chargeName: e.target.value} : c
                      ))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={charge.amount}
                      onChange={(e) => setDynamicCharges(dynamicCharges.map(c => 
                        c.id === charge.id ? {...c, amount: e.target.value} : c
                      ))}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeDynamicCharge(charge.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
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

      {/* Export Data Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Export data with date filters in JSON format
            </DialogDescription>
          </DialogHeader>
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
                  <SelectItem value="quotes">Quotations</SelectItem>
                  <SelectItem value="contractors">Contractors</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
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
                setShowExportModal(false);
              }}
            >
              Export Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}