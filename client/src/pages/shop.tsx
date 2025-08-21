import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { type Product, type Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Star,
  Eye,
  Plus,
  Minus,
  Heart,
  Package
} from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function Shop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
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

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.basePrice),
        quantity: 1,
      }];
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateCartQuantity = (productId: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Filter products by price range
  const filteredProducts = products?.filter(product => {
    const price = parseFloat(product.basePrice);
    if (priceRange === "under-1000") return price < 1000;
    if (priceRange === "1000-5000") return price >= 1000 && price <= 5000;
    if (priceRange === "5000-10000") return price >= 5000 && price <= 10000;
    if (priceRange === "above-10000") return price > 10000;
    return true;
  }) || [];

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: Category) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity < 10) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BuildMart Store</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.username || "Guest"}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowCartSidebar(true)}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({getCartItemCount()})
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
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
              <SelectTrigger className="w-full lg:w-48">
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
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                <SelectItem value="above-10000">Above ₹10,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No products found matching your criteria</p>
            </div>
          ) : (
            filteredProducts.map((product: Product) => {
              const stockStatus = getStockStatus(product.stockQuantity || 0);
              const isInCart = cart.some(item => item.productId === product.id);
              
              return (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(product.categoryId)}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{parseFloat(product.basePrice).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">per unit</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">4.5</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={product.stockQuantity === 0}
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {isInCart ? "Added" : "Add"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCartSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCartSidebar(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  <Button variant="ghost" onClick={() => setShowCartSidebar(false)}>
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm text-gray-600">₹{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.productId, -1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.productId, 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="p-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <Button className="w-full">
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}