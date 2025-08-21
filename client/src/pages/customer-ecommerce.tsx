import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  ShoppingCart, 
  Heart,
  User,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Sparkles,
  Calculator,
  Truck,
  Clock,
  Package,
  IndianRupee,
  Eye,
  Plus,
  Minus,
  Building2,
  Brain,
  Zap,
  Calendar,
  ShoppingBag,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import type { Product, Category } from "@shared/schema";
import AIEstimator from "@/components/construction/AIEstimator";

interface CartItem {
  product: Product;
  quantity: number;
  selectedQuantitySlab?: any;
}

interface QuotationItem {
  productId: string;
  quantity: number;
  deliveryDays: number;
  urgency: 'standard' | 'urgent';
}

interface AdvanceBooking {
  productId: string;
  quantity: number;
  advanceAmount: number;
  deliveryDate: Date;
  specifications: any;
}

export default function CustomerEcommerce() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // URL routing for product details
  const [match, params] = useRoute("/product/:id");
  const [categoryMatch, categoryParams] = useRoute("/category/:categoryId");
  
  // State management
  const [currentSection, setCurrentSection] = useState<'home' | 'product-detail' | 'cart' | 'quotation' | 'booking'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Cart and quotation management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [advanceBookings, setAdvanceBookings] = useState<AdvanceBooking[]>([]);
  const [bulkQuantity, setBulkQuantity] = useState<number>(1);
  const [deliveryDays, setDeliveryDays] = useState<number>(4);
  
  // AI and advanced features
  const [showAIEstimator, setShowAIEstimator] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [realtimeQuotation, setRealtimeQuotation] = useState<any>(null);

  // Data fetching
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories/hierarchy'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });

  const { data: trendingProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products/trending'],
  });

  // Advanced search with AI
  const { data: searchResults, refetch: searchRefetch } = useQuery({
    queryKey: ['/api/products/search', searchTerm, selectedCategory, priceRange, sortBy],
    enabled: searchTerm.length > 0,
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchTerm,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortBy,
        sortOrder: 'asc'
      });
      
      const response = await apiRequest('GET', `/api/products/search?${params}`);
      return response;
    }
  });

  // Real-time pricing calculator
  const pricingMutation = useMutation({
    mutationFn: async ({ productId, quantity, deliveryDays, urgency }: any) => {
      const response = await apiRequest('POST', '/api/pricing/calculate', {
        productId,
        quantity,
        deliveryDate: new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString(),
        userType: user?.role || 'guest',
        urgency
      });
      return response;
    },
    onSuccess: (data) => {
      setRealtimeQuotation(data);
    }
  });

  // Generate quotation
  const quotationMutation = useMutation({
    mutationFn: async (items: QuotationItem[]) => {
      if (!user) {
        setShowAuthDialog(true);
        return;
      }
      
      const quotationData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          deliveryDays: item.deliveryDays,
          urgency: item.urgency
        })),
        customerName: user.username,
        customerEmail: user.email,
        location: 'India',
        userType: user.role,
        urgency: 'standard'
      };

      const response = await apiRequest('POST', '/api/quotations/generate', quotationData);
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Quotation Generated!",
        description: `Total: ₹${data?.grandTotal?.toLocaleString() || 0}`,
      });
      setCurrentSection('quotation');
    }
  });

  // Handle URL routing
  useEffect(() => {
    if (match && params?.id) {
      const product = products.find(p => p.id === params.id);
      if (product) {
        setSelectedProduct(product);
        setCurrentSection('product-detail');
        // Get AI recommendations for this product
        getProductRecommendations(product);
      }
    }
    if (categoryMatch && categoryParams?.categoryId) {
      setSelectedCategory(categoryParams.categoryId);
      setCurrentSection('home');
    }
  }, [match, params, categoryMatch, categoryParams, products]);

  // Get AI recommendations for a product
  const getProductRecommendations = async (product: Product) => {
    try {
      const response = await apiRequest('POST', '/api/products/recommendations', {
        currentProductId: product.id,
        categoryId: product.categoryId,
        contextualData: {
          productType: product.name
        }
      });
      const products = Array.isArray(response) ? response : [];
      setAiRecommendations(products.slice(0, 6));
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
  };

  // Add to cart
  const addToCart = (product: Product, quantity: number = 1, quantitySlab?: any) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const existingItem = cartItems.find(item => item.product.id === product.id);
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { product, quantity, selectedQuantitySlab: quantitySlab }]);
    }

    toast({
      title: "Added to Cart!",
      description: `${product.name} (${quantity}) added to your cart`,
    });
  };

  // Calculate bulk discount
  const calculateBulkDiscount = (basePrice: number, quantity: number): { price: number; discount: number } => {
    let discount = 0;
    if (quantity >= 100) discount = 0.15; // 15% discount for 100+
    else if (quantity >= 50) discount = 0.10; // 10% discount for 50+
    else if (quantity >= 20) discount = 0.05; // 5% discount for 20+
    
    const discountedPrice = basePrice * (1 - discount);
    return { price: discountedPrice, discount: discount * 100 };
  };

  // Calculate delivery-based pricing
  const calculateDeliveryPricing = (basePrice: number, days: number): { price: number; discount: number } => {
    let multiplier = 1;
    let discount = 0;
    
    if (days <= 2) {
      multiplier = 1.20; // 20% extra for express delivery
    } else if (days <= 4) {
      multiplier = 1.10; // 10% extra for fast delivery
    } else if (days >= 7) {
      multiplier = 0.95; // 5% discount for standard delivery
      discount = 5;
    }
    
    return { price: basePrice * multiplier, discount };
  };

  // Filtered and sorted products
  const getDisplayProducts = () => {
    let filtered = products;
    
    if (searchTerm && searchResults) {
      const resultsData = searchResults as any;
      if (resultsData?.products) {
        filtered = resultsData.products;
      }
    } else {
      if (selectedCategory !== 'all') {
        filtered = products.filter(p => p.categoryId === selectedCategory);
      }
      
      if (priceRange) {
        filtered = filtered.filter(p => {
          const price = parseFloat(p.basePrice);
          return price >= priceRange[0] && price <= priceRange[1];
        });
      }
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.basePrice) - parseFloat(b.basePrice);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // Hero Section Component
  const HeroSection = () => (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">BuildMart AI</h1>
        <p className="text-xl md:text-2xl mb-8">Smart Construction Materials Trading with AI-Powered Solutions</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search for cement, steel, bricks, plumbing materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg bg-white text-gray-900 rounded-lg"
          />
        </div>
        
        {/* AI Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            onClick={() => setShowAIEstimator(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
          >
            <Brain className="w-5 h-5 mr-2" />
            AI Material Estimator
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Smart Quotation
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Advance Booking
          </Button>
        </div>
      </div>
    </section>
  );

  // Categories Section
  const CategoriesSection = () => (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentSection('home');
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🏗️</div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  // Featured Products Section
  const FeaturedSection = () => (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <Star className="w-8 h-8 mr-3 text-yellow-500" />
            Featured Products
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );

  // Trending Products Section
  const TrendingSection = () => (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-green-500" />
            Trending Now
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
      </div>
    </section>
  );

  // All Products Section with Filters
  const ProductsSection = () => (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                </div>
                
                {/* Sort Options */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Bulk Quantity for Discounts */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Bulk Quantity: {bulkQuantity}
                  </Label>
                  <Slider
                    value={[bulkQuantity]}
                    onValueChange={(value) => setBulkQuantity(value[0])}
                    max={200}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  {bulkQuantity >= 20 && (
                    <Badge variant="secondary" className="mt-2">
                      {bulkQuantity >= 100 ? '15%' : bulkQuantity >= 50 ? '10%' : '5%'} Bulk Discount
                    </Badge>
                  )}
                </div>
                
                {/* Delivery Options */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Delivery</Label>
                  <div className="space-y-2">
                    {[2, 4, 7].map(days => {
                      const pricing = calculateDeliveryPricing(1000, days);
                      return (
                        <div key={days} className="flex items-center justify-between p-2 border rounded">
                          <Checkbox 
                            id={`delivery-${days}`}
                            checked={deliveryDays === days}
                            onCheckedChange={() => setDeliveryDays(days)}
                          />
                          <Label htmlFor={`delivery-${days}`} className="flex-1 ml-2">
                            {days <= 2 ? 'Express' : days <= 4 ? 'Fast' : 'Standard'} ({days} days)
                          </Label>
                          {pricing.discount > 0 && (
                            <Badge variant="secondary">{pricing.discount}% OFF</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory === 'all' ? 'All Products' : 
                 categories.find(c => c.id === selectedCategory)?.name + ' Products'}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {getDisplayProducts().map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                  bulkQuantity={bulkQuantity}
                  deliveryDays={deliveryDays}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Product Card Component
  const ProductCard = ({ 
    product, 
    featured = false, 
    viewMode = 'grid', 
    bulkQuantity = 1,
    deliveryDays = 4 
  }: { 
    product: Product; 
    featured?: boolean; 
    viewMode?: 'grid' | 'list';
    bulkQuantity?: number;
    deliveryDays?: number;
  }) => {
    const basePrice = parseFloat(product.basePrice);
    const bulkPricing = calculateBulkDiscount(basePrice, bulkQuantity);
    const deliveryPricing = calculateDeliveryPricing(bulkPricing.price, deliveryDays);
    
    const CardComponent = viewMode === 'list' ? 
      ({ children, ...props }: any) => <Card {...props} className="flex p-4">{children as React.ReactNode}</Card> :
      Card;

    return (
      <CardComponent className="cursor-pointer hover:shadow-lg transition-all group">
        <div 
          className={viewMode === 'list' ? 'flex w-full gap-4' : 'relative'}
          onClick={() => {
            setSelectedProduct(product);
            setCurrentSection('product-detail');
            getProductRecommendations(product);
          }}
        >
          {/* Product Image */}
          <div className={viewMode === 'list' ? 'w-32 h-32' : 'h-48'}>
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-500" />
            </div>
          </div>
          
          {/* Product Info */}
          <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              {featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description || "High-quality construction material"}
            </p>
            
            {/* Pricing Information */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">
                  ₹{deliveryPricing.price.toLocaleString()}
                </span>
                {(bulkPricing.discount > 0 || deliveryPricing.discount > 0) && (
                  <span className="text-gray-400 line-through">
                    ₹{basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Discount Badges */}
              <div className="flex flex-wrap gap-1">
                {bulkPricing.discount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {bulkPricing.discount}% Bulk Discount
                  </Badge>
                )}
                {deliveryPricing.discount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {deliveryPricing.discount}% Standard Delivery
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant={product.stockQuantity && product.stockQuantity > 0 ? "secondary" : "destructive"}>
                {product.stockQuantity && product.stockQuantity > 0 
                  ? `${product.stockQuantity} in stock` 
                  : 'Out of stock'}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Truck className="w-4 h-4 mr-1" />
                {deliveryDays <= 2 ? 'Express' : deliveryDays <= 4 ? 'Fast' : 'Standard'} Delivery
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, bulkQuantity);
                }}
                className="flex-1"
                disabled={!product.stockQuantity || product.stockQuantity <= 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  pricingMutation.mutate({
                    productId: product.id,
                    quantity: bulkQuantity,
                    deliveryDays,
                    urgency: deliveryDays <= 2 ? 'urgent' : 'standard'
                  });
                }}
              >
                <Calculator className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                  setCurrentSection('product-detail');
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardComponent>
    );
  };

  // Product Detail Page Component
  const ProductDetailPage = () => {
    if (!selectedProduct) return null;
    
    const basePrice = parseFloat(selectedProduct.basePrice);
    const [quantity, setQuantity] = useState(1);
    const bulkPricing = calculateBulkDiscount(basePrice, quantity);
    const deliveryPricing = calculateDeliveryPricing(bulkPricing.price, deliveryDays);
    
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button 
            onClick={() => setCurrentSection('home')}
            className="hover:text-blue-600"
          >
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <span>{categories.find(c => c.id === selectedProduct.categoryId)?.name}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{selectedProduct.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-24 h-24 text-gray-500" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Information */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{selectedProduct.name}</h1>
            <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
            
            {/* Pricing */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ₹{(deliveryPricing.price * quantity).toLocaleString()}
                </span>
                {(bulkPricing.discount > 0 || deliveryPricing.discount > 0) && (
                  <span className="text-gray-400 line-through text-xl">
                    ₹{(basePrice * quantity).toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-4">
                <Label>Quantity:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Bulk Discounts Display */}
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold">Bulk Pricing:</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-white rounded border text-center">
                    <div className="font-medium">20-49 units</div>
                    <div className="text-green-600">5% OFF</div>
                  </div>
                  <div className="p-2 bg-white rounded border text-center">
                    <div className="font-medium">50-99 units</div>
                    <div className="text-green-600">10% OFF</div>
                  </div>
                  <div className="p-2 bg-white rounded border text-center">
                    <div className="font-medium">100+ units</div>
                    <div className="text-green-600">15% OFF</div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Options */}
              <div className="space-y-2 mb-6">
                <h4 className="font-semibold">Delivery Options:</h4>
                <div className="space-y-1">
                  {[
                    { days: 2, name: 'Express Delivery', extra: '20% extra' },
                    { days: 4, name: 'Fast Delivery', extra: '10% extra' },
                    { days: 7, name: 'Standard Delivery', extra: '5% discount' }
                  ].map(option => (
                    <div key={option.days} className="flex items-center justify-between p-2 border rounded">
                      <Checkbox 
                        checked={deliveryDays === option.days}
                        onCheckedChange={() => setDeliveryDays(option.days)}
                      />
                      <span className="flex-1 ml-2">{option.name} ({option.days} days)</span>
                      <Badge variant="secondary" className="text-xs">{option.extra}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => addToCart(selectedProduct, quantity)}
                  className="w-full text-lg py-3"
                  disabled={!selectedProduct.stockQuantity || selectedProduct.stockQuantity <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add {quantity} to Cart
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      pricingMutation.mutate({
                        productId: selectedProduct.id,
                        quantity,
                        deliveryDays,
                        urgency: deliveryDays <= 2 ? 'urgent' : 'standard'
                      });
                    }}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Get Quotation
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Advance
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Product Specifications */}
            {selectedProduct.specs && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedProduct.specs as any).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="capitalize font-medium">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
              AI Recommended Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRecommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Cart Component
  const CartSection = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <ShoppingCart className="w-8 h-8 mr-3" />
        Shopping Cart ({cartItems.length})
      </h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => setCurrentSection('home')}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => {
            const basePrice = parseFloat(item.product.basePrice);
            const totalPrice = basePrice * item.quantity;
            
            return (
              <Card key={item.product.id} className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.product.name}</h3>
                    <p className="text-gray-600 mb-2">{item.product.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-green-600">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                      <span className="text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCartItems(prev => 
                          prev.map(cartItem => 
                            cartItem.product.id === item.product.id 
                              ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) }
                              : cartItem
                          )
                        );
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCartItems(prev => 
                          prev.map(cartItem => 
                            cartItem.product.id === item.product.id 
                              ? { ...cartItem, quantity: cartItem.quantity + 1 }
                              : cartItem
                          )
                        );
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setCartItems(prev => prev.filter(cartItem => cartItem.product.id !== item.product.id));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
          
          {/* Cart Summary */}
          <Card className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{cartItems.reduce((total, item) => 
                  total + (parseFloat(item.product.basePrice) * item.quantity), 0
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-4">
              <Button 
                className="flex-1"
                onClick={() => {
                  const items = cartItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    deliveryDays: 4,
                    urgency: 'standard' as const
                  }));
                  quotationMutation.mutate(items);
                }}
              >
                Generate Quotation
              </Button>
              <Button variant="outline" className="flex-1">
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  // Main Navigation Header
  const Header = () => (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setCurrentSection('home')}
              className="text-2xl font-bold text-blue-600"
            >
              BuildMart AI
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setCurrentSection('home')}
                className={`font-medium ${currentSection === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Home
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="relative"
              onClick={() => setCurrentSection('cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-2 py-1 min-w-[1.25rem] h-5">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
            
            {user ? (
              <Button variant="outline">
                <User className="w-5 h-5 mr-2" />
                {user.username}
              </Button>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Render appropriate section
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'product-detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartSection />;
      default:
        return (
          <>
            <HeroSection />
            <CategoriesSection />
            <FeaturedSection />
            <TrendingSection />
            <ProductsSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {renderCurrentSection()}
      
      {/* AI Estimator Dialog */}
      <Dialog open={showAIEstimator} onOpenChange={setShowAIEstimator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="w-6 h-6 mr-2 text-purple-600" />
              AI Material Estimator
            </DialogTitle>
            <DialogDescription>
              Upload a construction image or enter project details to get AI-powered material estimates
            </DialogDescription>
          </DialogHeader>
          <AIEstimator onAddToCart={(materials) => {
            materials.forEach(material => {
              // Convert material estimate to product-like structure for cart
              const product: Product = {
                id: `ai-${material.material.toLowerCase().replace(/\s+/g, '-')}`,
                name: material.material,
                description: material.description,
                basePrice: material.estimatedPrice.toString(),
                categoryId: material.category,
                specs: { unit: material.unit },
                vendorId: 'ai-estimator',
                stockQuantity: 1000,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                quantitySlabs: null,
                dynamicCharges: null,
                imageUrl: null
              };
              addToCart(product, material.adjustedQuantity || material.quantity);
            });
            setShowAIEstimator(false);
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Real-time Quotation Display */}
      {realtimeQuotation && (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <Card className="p-4 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                Live Quotation
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRealtimeQuotation(null)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span>₹{realtimeQuotation.basePrice.toLocaleString()}</span>
              </div>
              {realtimeQuotation.quantityDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Bulk Discount:</span>
                  <span>-₹{realtimeQuotation.quantityDiscount.toLocaleString()}</span>
                </div>
              )}
              {realtimeQuotation.deliveryCharges > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span>₹{realtimeQuotation.deliveryCharges.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-green-600">₹{realtimeQuotation.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              Please sign in to add items to cart, generate quotations, or use advanced features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}