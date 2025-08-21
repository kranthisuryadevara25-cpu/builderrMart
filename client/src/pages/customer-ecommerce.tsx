import React, { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Quote,
  Brain,
  Sparkles,
  Calculator,
  ShoppingBag,
  Layers,
  Home,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  X,
  MapPin,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import AIEstimator from "@/components/construction/AIEstimator";

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
  const { toast } = useToast();
  
  // Navigation and view states
  const [currentSection, setCurrentSection] = useState<'home' | 'products' | 'categories' | 'cart' | 'profile'>('home');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Enhanced filter states
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
  const [showAIEstimator, setShowAIEstimator] = useState(false);
  const [showPricingCalculator, setShowPricingCalculator] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Pricing calculator state
  const [pricingForm, setPricingForm] = useState({
    quantity: 1,
    location: 'local',
    urgency: 'standard',
    userType: 'retail'
  });
  const [calculatedPricing, setCalculatedPricing] = useState<any>(null);
  
  // Quote form
  const [quoteForm, setQuoteForm] = useState({
    quantity: "",
    company: "",
    brand: "",
    specifications: "",
    deliveryDate: ""
  });

  // Enhanced API calls
  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories/hierarchy"],
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: trendingProducts, isLoading: trendingLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/trending"],
  });

  // Enhanced search with advanced filtering
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/products/search", {
      q: searchTerm,
      category: filters.company !== 'all' ? selectedCategory : undefined,
      minPrice: filters.priceRange === "1000-5000" ? 1000 : filters.priceRange === "5000-10000" ? 5000 : filters.priceRange === "above-10000" ? 10000 : undefined,
      maxPrice: filters.priceRange === "under-1000" ? 1000 : filters.priceRange === "1000-5000" ? 5000 : filters.priceRange === "5000-10000" ? 10000 : undefined,
      inStock: filters.availability === "in-stock" ? true : undefined,
      brand: filters.brand !== 'all' ? filters.brand : undefined,
      sortBy: sortBy === "price-low" || sortBy === "price-high" ? "price" : sortBy === "name" ? "name" : "created",
      sortOrder: sortBy === "price-high" ? "desc" : "asc",
      limit: 50
    }],
    enabled: searchTerm.length > 0 || Object.values(filters).some(f => f !== 'all') || selectedCategory !== 'all'
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get AI recommendations
  const recommendationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products/recommendations", data);
      return response.json();
    }
  });

  // Calculate pricing
  const pricingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/pricing/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculatedPricing(data);
      toast({
        title: "Pricing Calculated",
        description: "Real-time pricing has been calculated successfully."
      });
    }
  });

  // Generate quotation
  const quotationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/quotations/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quotation Generated",
        description: `Quotation ${data.id} has been generated successfully.`
      });
    }
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.basePrice),
        quantity: 1
      }]);
    }
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  const addToQuote = (product: Product) => {
    setSelectedProduct(product);
    setShowQuoteModal(true);
  };

  const handleQuoteSubmit = () => {
    if (selectedProduct && quoteForm.quantity && quoteForm.company && quoteForm.brand) {
      const newQuoteItem: QuoteItem = {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity: parseInt(quoteForm.quantity),
        company: quoteForm.company,
        brand: quoteForm.brand,
        specifications: quoteForm.specifications
      };
      setQuote([...quote, newQuoteItem]);
      setQuoteForm({ quantity: "", company: "", brand: "", specifications: "", deliveryDate: "" });
      setShowQuoteModal(false);
      setSelectedProduct(null);
      
      toast({
        title: "Added to Quote",
        description: `${selectedProduct.name} has been added to your quote.`
      });
    }
  };

  const calculatePricing = () => {
    if (selectedProduct) {
      pricingMutation.mutate({
        productId: selectedProduct.id,
        quantity: pricingForm.quantity,
        location: pricingForm.location,
        urgency: pricingForm.urgency,
        userType: pricingForm.userType
      });
    }
  };

  const generateQuotation = () => {
    if (quote.length > 0) {
      quotationMutation.mutate({
        items: quote.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          company: item.company,
          brand: item.brand,
          specifications: item.specifications
        })),
        customerName: user?.username,
        customerEmail: user?.email,
        location: 'city',
        userType: 'retail'
      });
    }
  };

  const getDisplayProducts = () => {
    if (searchTerm.length > 0 || Object.values(filters).some(f => f !== 'all') || selectedCategory !== 'all') {
      return searchResults?.products || [];
    }
    return products || [];
  };

  const renderLandingPage = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 md:p-12">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Welcome to BuildMart AI
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-blue-100">
            Your AI-powered construction materials marketplace
          </p>
          <p className="text-lg mb-8 text-blue-100">
            Discover premium construction materials with intelligent recommendations, 
            real-time pricing, and advanced material estimation powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setCurrentSection('products')}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => setShowAIEstimator(true)}
            >
              <Brain className="mr-2 h-5 w-5" />
              AI Material Estimation
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Layers className="mr-2 h-6 w-6" />
          Shop by Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories?.slice(0, 10).map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentSection('products');
              }}
            >
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.children?.length || 0} subcategories</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Award className="mr-2 h-6 w-6 text-yellow-600" />
          Featured Products
        </h2>
        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-blue-400" />
                  </div>
                  <Badge className="absolute top-2 left-2 bg-yellow-500">Featured</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-blue-600">₹{product.basePrice}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => addToCart(product)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => addToQuote(product)}>
                      <Quote className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trending Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-green-600" />
          Trending Products
        </h2>
        {trendingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts?.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="flex">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                    <Package className="h-8 w-8 text-green-400" />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <Badge className="mb-2 bg-green-500">Trending</Badge>
                    <h3 className="font-semibold mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-xl font-bold text-green-600">₹{product.basePrice}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => addToCart(product)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addToQuote(product)}>
                        <Quote className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProductsSection = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search construction materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="created">Newest First</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Price Range</Label>
              <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
                <SelectTrigger>
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

            <div>
              <Label className="text-sm font-medium">Brand</Label>
              <Select value={filters.brand} onValueChange={(value) => setFilters({...filters, brand: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="UltraTech">UltraTech</SelectItem>
                  <SelectItem value="TATA">TATA</SelectItem>
                  <SelectItem value="ACC">ACC</SelectItem>
                  <SelectItem value="JSW">JSW</SelectItem>
                  <SelectItem value="Ambuja">Ambuja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <Select value={filters.rating} onValueChange={(value) => setFilters({...filters, rating: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="3+">3+ Stars</SelectItem>
                  <SelectItem value="2+">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Availability</Label>
              <Select value={filters.availability} onValueChange={(value) => setFilters({...filters, availability: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="in-stock">In Stock Only</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Products Grid/List */}
      {searchLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {getDisplayProducts().map((product: Product) => (
            <Card key={product.id} className={`hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
              <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                <div className={`bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ${
                  viewMode === 'list' ? 'h-full rounded-l-lg' : 'h-48 rounded-t-lg'
                }`}>
                  <Package className="h-16 w-16 text-blue-400" />
                </div>
              </div>
              <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                  <div className="flex items-center ml-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">4.8</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                {/* Specifications */}
                {product.specifications && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(product.specifications as any).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {value as string}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">₹{product.basePrice}</span>
                    <div className="text-xs text-gray-500">
                      Stock: {product.stockQuantity || 0} units
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowPricingCalculator(true);
                      }}
                    >
                      <Calculator className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => addToQuote(product)}
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => addToCart(product)}
                  disabled={(product.stockQuantity || 0) === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {(product.stockQuantity || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {getDisplayProducts().length === 0 && !searchLoading && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderCartSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Shopping Cart</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">Add some construction materials to get started</p>
          <Button onClick={() => setCurrentSection('products')}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">₹{item.price} per unit</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (item.quantity > 1) {
                          setCart(cart.map(cartItem => 
                            cartItem.productId === item.productId 
                              ? { ...cartItem, quantity: cartItem.quantity - 1 }
                              : cartItem
                          ));
                        }
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCart(cart.map(cartItem => 
                          cartItem.productId === item.productId 
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                        ));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <div className="w-20 text-right font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setCart(cart.filter(cartItem => cartItem.productId !== item.productId));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total: ₹{cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => generateQuotation()}>
                    Generate Quote
                  </Button>
                  <Button>
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Quote Items */}
      {quote.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Quote Items</h3>
          <div className="space-y-2">
            {quote.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity} | Company: {item.company} | Brand: {item.brand}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setQuote(quote.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="mt-4" onClick={() => generateQuotation()}>
            Generate Quotation
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BuildMart AI</span>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'categories', label: 'Categories', icon: Layers },
                { id: 'cart', label: 'Cart', icon: ShoppingCart }
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={currentSection === item.id ? 'default' : 'ghost'}
                  onClick={() => setCurrentSection(item.id as any)}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === 'cart' && cart.length > 0 && (
                    <Badge className="ml-1">{cart.length}</Badge>
                  )}
                </Button>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAIEstimator(true)}
              >
                <Brain className="mr-2 h-4 w-4" />
                AI Estimation
              </Button>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.username}</span>
              </div>
              
              <Button variant="ghost" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentSection === 'home' && renderLandingPage()}
        {currentSection === 'products' && renderProductsSection()}
        {currentSection === 'cart' && renderCartSection()}
        {currentSection === 'categories' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">All Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Package className="h-8 w-8 text-blue-600" />
                      <Badge>{category.children?.length || 0} subcategories</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setCurrentSection('products');
                      }}
                    >
                      View Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {category.children && category.children.length > 0 && (
                      <div className="mt-4 space-y-1">
                        <p className="text-xs font-medium text-gray-500">Subcategories:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.children.slice(0, 3).map((child: any) => (
                            <Badge key={child.id} variant="secondary" className="text-xs">
                              {child.name}
                            </Badge>
                          ))}
                          {category.children.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{category.children.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AI Estimator Dialog */}
      <Dialog open={showAIEstimator} onOpenChange={setShowAIEstimator}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              AI Construction Material Estimator
            </DialogTitle>
            <DialogDescription>
              Upload construction images to get AI-powered material estimates
            </DialogDescription>
          </DialogHeader>
          <AIEstimator />
        </DialogContent>
      </Dialog>

      {/* Quote Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Quote</DialogTitle>
            <DialogDescription>
              Specify requirements for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={quoteForm.quantity}
                onChange={(e) => setQuoteForm({...quoteForm, quantity: e.target.value})}
                placeholder="Enter quantity"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company *</Label>
                <Select value={quoteForm.company} onValueChange={(value) => setQuoteForm({...quoteForm, company: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UltraTech">UltraTech</SelectItem>
                    <SelectItem value="TATA">TATA</SelectItem>
                    <SelectItem value="ACC">ACC</SelectItem>
                    <SelectItem value="JSW">JSW</SelectItem>
                    <SelectItem value="Ambuja">Ambuja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Brand *</Label>
                <Select value={quoteForm.brand} onValueChange={(value) => setQuoteForm({...quoteForm, brand: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Economy">Economy</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Specifications</Label>
              <Textarea
                value={quoteForm.specifications}
                onChange={(e) => setQuoteForm({...quoteForm, specifications: e.target.value})}
                placeholder="Enter specific requirements..."
              />
            </div>
            
            <div>
              <Label>Preferred Delivery Date</Label>
              <Input
                type="date"
                value={quoteForm.deliveryDate}
                onChange={(e) => setQuoteForm({...quoteForm, deliveryDate: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleQuoteSubmit}>
                Add to Quote
              </Button>
              <Button variant="outline" onClick={() => setShowQuoteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Calculator Modal */}
      <Dialog open={showPricingCalculator} onOpenChange={setShowPricingCalculator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Real-time Pricing Calculator
            </DialogTitle>
            <DialogDescription>
              Calculate dynamic pricing for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={pricingForm.quantity}
                  onChange={(e) => setPricingForm({...pricingForm, quantity: parseInt(e.target.value) || 1})}
                  min="1"
                />
              </div>
              
              <div>
                <Label>Location</Label>
                <Select value={pricingForm.location} onValueChange={(value) => setPricingForm({...pricingForm, location: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="suburban">Suburban</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Urgency</Label>
                <Select value={pricingForm.urgency} onValueChange={(value) => setPricingForm({...pricingForm, urgency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (7 days)</SelectItem>
                    <SelectItem value="urgent">Urgent (3 days)</SelectItem>
                    <SelectItem value="express">Express (1 day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>User Type</Label>
                <Select value={pricingForm.userType} onValueChange={(value) => setPricingForm({...pricingForm, userType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={calculatePricing}
              disabled={pricingMutation.isPending}
            >
              {pricingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Price
                </>
              )}
            </Button>
            
            {calculatedPricing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>₹{calculatedPricing.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity Discount:</span>
                      <span className="text-green-600">-₹{calculatedPricing.quantityDiscount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Surcharge:</span>
                      <span>₹{calculatedPricing.locationSurcharge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Urgency Charge:</span>
                      <span>₹{calculatedPricing.urgencyCharge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span>₹{calculatedPricing.deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loading Charge:</span>
                      <span>₹{calculatedPricing.loadingCharge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span>₹{calculatedPricing.taxAmount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">₹{calculatedPricing.totalAmount}</span>
                    </div>
                    {calculatedPricing.savings > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>You Save:</span>
                        <span>₹{calculatedPricing.savings}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'cart', label: 'Cart', icon: ShoppingCart }
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentSection(item.id as any)}
              className={`flex flex-col items-center space-y-1 ${
                currentSection === item.id ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
              {item.id === 'cart' && cart.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {cart.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}