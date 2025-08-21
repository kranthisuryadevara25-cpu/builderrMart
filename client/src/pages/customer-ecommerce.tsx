import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import { type Product, type Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Star,
  Plus,
  Minus,
  Package,
  User,
  Heart,
  LogOut,
  Grid3X3,
  List,
  FileText,
  Truck,
  Award,
  TrendingUp,
  Building2,
  Tag,
  SortAsc,
  Eye,
  Quote
} from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  company?: string;
  brand?: string;
}

interface QuoteItem {
  productId: string;
  name: string;
  quantity: number;
  company: string;
  brand: string;
  specifications?: string;
}

export default function CustomerEcommerce() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  // View and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: "all",
    company: "all",
    brand: "all",
    rating: "all",
    availability: "all"
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState("relevance");
  
  // Cart and quote states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quote, setQuote] = useState<QuoteItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Quote form
  const [quoteForm, setQuoteForm] = useState({
    quantity: "",
    company: "",
    brand: "",
    specifications: "",
    deliveryDate: ""
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory, searchTerm, filters, sortBy],
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

  // Mock data for featured and trending products
  const featuredProducts = products?.slice(0, 6) || [];
  const trendingProducts = products?.slice(2, 8) || [];
  const companies = ["Tata Steel", "UltraTech", "ACC", "Ambuja", "Birla", "JSW"];
  const brands = ["Premium", "Standard", "Economy", "Industrial", "Commercial"];

  const filteredAndSortedProducts = () => {
    let filtered = products || [];
    
    // Apply filters
    if (filters.priceRange !== "all") {
      const price = parseFloat(filters.priceRange);
      if (filters.priceRange === "under-1000") filtered = filtered.filter(p => parseFloat(p.basePrice) < 1000);
      else if (filters.priceRange === "1000-5000") filtered = filtered.filter(p => {
        const price = parseFloat(p.basePrice);
        return price >= 1000 && price <= 5000;
      });
      else if (filters.priceRange === "5000-10000") filtered = filtered.filter(p => {
        const price = parseFloat(p.basePrice);
        return price >= 5000 && price <= 10000;
      });
      else if (filters.priceRange === "above-10000") filtered = filtered.filter(p => parseFloat(p.basePrice) > 10000);
    }
    
    // Apply sorting
    if (sortBy === "price-low") filtered.sort((a, b) => parseFloat(a.basePrice) - parseFloat(b.basePrice));
    else if (sortBy === "price-high") filtered.sort((a, b) => parseFloat(b.basePrice) - parseFloat(a.basePrice));
    else if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    return filtered;
  };

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
  };

  const openQuoteModal = (product: Product) => {
    setSelectedProduct(product);
    setQuoteForm({
      quantity: "1",
      company: "",
      brand: "",
      specifications: "",
      deliveryDate: ""
    });
    setShowQuoteModal(true);
  };

  const submitQuote = () => {
    if (selectedProduct && quoteForm.quantity && quoteForm.company && quoteForm.brand) {
      const newQuoteItem: QuoteItem = {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity: parseInt(quoteForm.quantity),
        company: quoteForm.company,
        brand: quoteForm.brand,
        specifications: quoteForm.specifications
      };
      
      setQuote(prev => [...prev, newQuoteItem]);
      setShowQuoteModal(false);
      // Show success message or handle quote submission
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: Category) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BuildMart</h1>
                <p className="text-xs text-gray-500">Construction Materials</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for construction materials, cement, steel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Quote className="h-4 w-4 mr-2" />
                Quotes ({quote.length})
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCart(true)}
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

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 py-3 overflow-x-auto">
            <Button
              variant={selectedCategory === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories?.map((category: Category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedCategory === "all" && (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 mb-8 text-white">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Premium Construction Materials</h2>
                <p className="text-lg mb-6">Get the best quality materials at competitive prices with fast delivery</p>
                <div className="flex gap-4">
                  <Button size="lg" variant="secondary">
                    <Award className="h-5 w-5 mr-2" />
                    Certified Quality
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-600">
                    <Truck className="h-5 w-5 mr-2" />
                    Fast Delivery
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Products */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Featured Products</h3>
                <Button variant="outline">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {featuredProducts.map((product: Product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h4>
                      <p className="text-lg font-bold text-orange-600">₹{parseFloat(product.basePrice).toLocaleString()}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => addToCart(product)} className="flex-1">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openQuoteModal(product)}>
                          <Quote className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Trending Products */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                  Trending Now
                </h3>
                <Button variant="outline">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingProducts.map((product: Product, index) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                        <Badge className="absolute top-2 right-2 bg-green-600">
                          #{index + 1} Trending
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-2 line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-orange-600">₹{parseFloat(product.basePrice).toLocaleString()}</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">4.{Math.floor(Math.random() * 5) + 5}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => addToCart(product)} className="flex-1">
                          Add to Cart
                        </Button>
                        <Button variant="outline" onClick={() => openQuoteModal(product)}>
                          <Quote className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Product Listing (when category selected) */}
        {selectedCategory !== "all" && (
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="w-64 flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium">Price Range</Label>
                    <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({...prev, priceRange: value}))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
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

                  {/* Company */}
                  <div>
                    <Label className="text-sm font-medium">Company</Label>
                    <Select value={filters.company} onValueChange={(value) => setFilters(prev => ({...prev, company: value}))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {companies.map(company => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand */}
                  <div>
                    <Label className="text-sm font-medium">Brand</Label>
                    <Select value={filters.brand} onValueChange={(value) => setFilters(prev => ({...prev, brand: value}))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div>
                    <Label className="text-sm font-medium">Minimum Rating</Label>
                    <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({...prev, rating: value}))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="4">4★ & Above</SelectItem>
                        <SelectItem value="3">3★ & Above</SelectItem>
                        <SelectItem value="2">2★ & Above</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div>
                    <Label className="text-sm font-medium">Availability</Label>
                    <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({...prev, availability: value}))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              {/* Sort and View Options */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    {categories?.find(c => c.id === selectedCategory)?.name || "Products"}
                  </h2>
                  <span className="text-gray-500">({filteredAndSortedProducts().length} items)</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Sort by Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                      <SelectItem value="rating">Rating: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredAndSortedProducts().map((product: Product) => {
                  const stockStatus = (product.stockQuantity || 0) === 0 ? "Out of Stock" : 
                                     (product.stockQuantity || 0) < 10 ? "Low Stock" : "In Stock";
                  
                  return viewMode === "grid" ? (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Badge variant={stockStatus === "Out of Stock" ? "destructive" : stockStatus === "Low Stock" ? "secondary" : "default"}>
                              {stockStatus}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(product.categoryId)}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xl font-bold text-orange-600">
                              ₹{parseFloat(product.basePrice).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">per unit</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">4.{Math.floor(Math.random() * 5) + 5}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => addToCart(product)}
                            disabled={(product.stockQuantity || 0) === 0}
                            className="flex-1"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button variant="outline" onClick={() => openQuoteModal(product)}>
                            <Quote className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                                <div className="flex items-center gap-4 mb-2">
                                  <Badge variant="outline">{getCategoryName(product.categoryId)}</Badge>
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                    <span className="text-sm">4.{Math.floor(Math.random() * 5) + 5}</span>
                                  </div>
                                  <Badge variant={stockStatus === "Out of Stock" ? "destructive" : stockStatus === "Low Stock" ? "secondary" : "default"}>
                                    {stockStatus}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-orange-600">
                                  ₹{parseFloat(product.basePrice).toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500 block">per unit</span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                onClick={() => addToCart(product)}
                                disabled={(product.stockQuantity || 0) === 0}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button variant="outline" onClick={() => openQuoteModal(product)}>
                                <Quote className="h-4 w-4 mr-2" />
                                Request Quote
                              </Button>
                              <Button variant="ghost">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredAndSortedProducts().length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No products found</p>
                  <p className="text-gray-400">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Quote</DialogTitle>
            <DialogDescription>
              Get a custom quote for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={quoteForm.quantity}
                onChange={(e) => setQuoteForm(prev => ({...prev, quantity: e.target.value}))}
                placeholder="Enter quantity needed"
              />
            </div>
            
            <div>
              <Label>Preferred Company *</Label>
              <Select
                value={quoteForm.company}
                onValueChange={(value) => setQuoteForm(prev => ({...prev, company: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                  <SelectItem value="other">Other (specify in notes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Preferred Brand *</Label>
              <Select
                value={quoteForm.brand}
                onValueChange={(value) => setQuoteForm(prev => ({...prev, brand: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                  <SelectItem value="other">Other (specify in notes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Special Requirements</Label>
              <Textarea
                value={quoteForm.specifications}
                onChange={(e) => setQuoteForm(prev => ({...prev, specifications: e.target.value}))}
                placeholder="Any special specifications or requirements..."
                rows={3}
              />
            </div>
            
            <div>
              <Label>Required Delivery Date</Label>
              <Input
                type="date"
                value={quoteForm.deliveryDate}
                onChange={(e) => setQuoteForm(prev => ({...prev, deliveryDate: e.target.value}))}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setShowQuoteModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={submitQuote} className="flex-1">
                Submit Quote Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Sidebar - Same as before but enhanced */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  <Button variant="ghost" onClick={() => setShowCart(false)}>×</Button>
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
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
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
                  <Button className="w-full" size="lg">
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