import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseApi } from "@/lib/firebase-api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { type Product, type Category } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VoiceSearchInput } from "@/components/ui/voice-search-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { Eye, Edit, Trash2, Download, Plus, Layers, Search } from "lucide-react";

interface ProductTableProps {
  vendorId?: string;
}

export function ProductTable({ vendorId }: ProductTableProps) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [pricingProduct, setPricingProduct] = useState<Product | undefined>();
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>();

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["firebase", "products", vendorId, selectedCategory, searchTerm],
    queryFn: () => firebaseApi.getProducts({
      ...(vendorId ? { vendorId } : {}),
      ...(selectedCategory && selectedCategory !== "all" ? { categoryId: selectedCategory } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
    }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["firebase", "categories"],
    queryFn: () => firebaseApi.getCategories(),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => firebaseApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firebase", "products"] });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
      setDeletingProduct(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity < 50) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: Category) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const renderQuantitySlabs = (slabs: any) => {
    if (!slabs || !Array.isArray(slabs)) return null;
    return (
      <Button
        variant="link"
        size="sm"
        onClick={() => setPricingProduct(products?.find((p: Product) => p.quantitySlabs === slabs))}
        className="p-0 h-auto text-primary"
      >
        <Layers className="h-4 w-4 mr-1" />
        {slabs.length} Slabs
      </Button>
    );
  };

  const exportData = () => {
    toast({
      title: "Export started",
      description: "Your data export will be ready shortly.",
    });
  };

  if (productsLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <VoiceSearchInput
            placeholder="Search products by name, description, category, vendor, or price..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-64"
            testId="input-search-products"
          />
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category: Category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {/* Add vendor options here */}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-boxes text-primary"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-success"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products?.filter((p: Product) => p.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-warning"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products?.filter((p: Product) => p.stockQuantity && p.stockQuantity < 50).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-pause-circle text-secondary"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products?.filter((p: Product) => p.stockQuantity === 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Quantity Slabs</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product: Product) => {
                const stockStatus = getStockStatus(product.stockQuantity || 0);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.imageUrl || "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?ixlib=rb-4.0.3&w=100&h=100"}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryName(product.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      Vendor {product.vendorId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      ₹{product.basePrice}
                    </TableCell>
                    <TableCell>
                      {renderQuantitySlabs(product.quantitySlabs)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPricingProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingProduct(product)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Product Modal */}
      <ProductForm
        open={showCreateModal || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setEditingProduct(undefined);
          }
        }}
        product={editingProduct}
      />

      {/* Pricing Slabs Modal */}
      <Dialog open={!!pricingProduct} onOpenChange={() => setPricingProduct(undefined)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quantity Pricing Slabs</DialogTitle>
            <DialogDescription>
              {pricingProduct?.name} - Base Price: ₹{pricingProduct?.basePrice}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {pricingProduct?.quantitySlabs && Array.isArray(pricingProduct.quantitySlabs) ? (
              pricingProduct.quantitySlabs.map((slab: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Quantity Range</p>
                      <p className="text-sm font-medium text-gray-900">
                        {slab.min_qty} - {slab.max_qty} units
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Price per Unit</p>
                      <p className="text-sm font-medium text-gray-900">₹{slab.price_per_unit}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Total Savings</p>
                      <p className="text-sm font-medium text-green-600">
                        ₹{Number(pricingProduct.basePrice) - slab.price_per_unit}/unit
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No pricing slabs defined for this product.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeletingProduct(undefined)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingProduct && deleteProductMutation.mutate(deletingProduct.id)}
              disabled={deleteProductMutation.isPending}
            >
              Delete Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
