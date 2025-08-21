import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type Product, type Category } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Package, TrendingDown, TrendingUp, Search, Filter } from "lucide-react";

export default function Inventory() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", user?.role === "vendor" ? user.id : undefined, selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.role === "vendor") params.append('vendorId', user.id);
      if (selectedCategory && selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (!user) return null;

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const, icon: AlertTriangle };
    if (quantity < 50) return { label: "Low Stock", variant: "secondary" as const, icon: TrendingDown };
    return { label: "In Stock", variant: "default" as const, icon: TrendingUp };
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: Category) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const filteredProducts = products?.filter((product: Product) => {
    if (stockFilter === "low") return (product.stockQuantity || 0) < 50;
    if (stockFilter === "out") return (product.stockQuantity || 0) === 0;
    if (stockFilter === "in") return (product.stockQuantity || 0) >= 50;
    return true;
  }) || [];

  const totalItems = filteredProducts.length;
  const lowStockItems = filteredProducts.filter(p => (p.stockQuantity || 0) < 50 && (p.stockQuantity || 0) > 0).length;
  const outOfStockItems = filteredProducts.filter(p => (p.stockQuantity || 0) === 0).length;
  const totalValue = filteredProducts.reduce((sum, product) => sum + (parseFloat(product.basePrice) * (product.stockQuantity || 0)), 0);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Inventory Management"
          subtitle="Monitor and manage stock levels"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Items</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Low Stock</p>
                      <p className="text-2xl font-semibold text-orange-600">{lowStockItems}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                      <p className="text-2xl font-semibold text-red-600">{outOfStockItems}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Value</p>
                      <p className="text-2xl font-semibold text-green-600">₹{totalValue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
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
                  
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock</SelectItem>
                      <SelectItem value="in">In Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Inventory Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading inventory...
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No products found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product: Product) => {
                          const stockStatus = getStockStatus(product.stockQuantity);
                          const StatusIcon = stockStatus.icon;
                          const productValue = parseFloat(product.basePrice) * product.stockQuantity;
                          
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-500">{product.description}</p>
                                </div>
                              </TableCell>
                              <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                              <TableCell>
                                <span className="font-medium">{product.stockQuantity}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                                  <StatusIcon className="h-3 w-3" />
                                  {stockStatus.label}
                                </Badge>
                              </TableCell>
                              <TableCell>₹{parseFloat(product.basePrice).toLocaleString()}</TableCell>
                              <TableCell>₹{productValue.toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}