import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  ArrowRight,
  Home,
  Menu,
  X,
  Percent,
  Award,
  ThumbsUp,
  Bot,
  Scale,
  Trophy,
  Box,
  Share2,
  MessageCircle
} from "lucide-react";
import type { Product, Category } from "@shared/schema";
import AIEstimator from "@/components/construction/AIEstimator";
import ProductComparison from "@/components/ProductComparison";
import AIShoppingAssistant from "@/components/AIShoppingAssistant";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import ARProductViewer from "@/components/ARProductViewer";
import SocialSharing from "@/components/SocialSharing";

interface CartItem {
  product: Product;
  quantity: number;
  selectedQuantitySlab?: any;
}

// Form schemas
const quoteFormSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(10, 'Phone number required'),
  projectType: z.enum(['residential', 'commercial', 'industrial']),
  projectLocation: z.string().min(1, 'Location is required'),
  requirements: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

const bookingFormSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(10, 'Phone number required'),
  serviceType: z.enum(['delivery', 'installation', 'consultation']),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  requirements: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export default function CustomerEcommerce() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  
  // URL routing for product details
  const [match, params] = useRoute("/product/:id");
  const [categoryMatch, categoryParams] = useRoute("/category/:categoryId");
  
  // State management
  const [currentSection, setCurrentSection] = useState<'home' | 'category' | 'product-detail' | 'cart'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Cart and pricing management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bulkQuantity, setBulkQuantity] = useState<number>(1);
  const [deliveryDays, setDeliveryDays] = useState<number>(4);
  
  // AI features
  const [showAIEstimator, setShowAIEstimator] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  
  // Advanced features
  const [showComparison, setShowComparison] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showLoyaltyProgram, setShowLoyaltyProgram] = useState(false);
  const [showARViewer, setShowARViewer] = useState(false);
  const [showSocialSharing, setShowSocialSharing] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  
  // Quote and Booking features
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);

  // Quote and booking mutations
  const createQuoteMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/quotes', data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Quote request submitted successfully! We\'ll contact you soon.' });
      setShowQuoteDialog(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/bookings', data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Booking request submitted successfully! We\'ll confirm your appointment.' });
      setShowBookingDialog(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Helper functions for quote and booking
  const openQuoteDialog = (product?: Product) => {
    if (product) {
      setQuoteProduct(product);
    }
    setShowQuoteDialog(true);
  };

  const openBookingDialog = (product?: Product) => {
    if (product) {
      setBookingProduct(product);
    }
    setShowBookingDialog(true);
  };

  // Data fetching - Public access (no auth required)
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

  // Handle URL routing
  useEffect(() => {
    if (match && params?.id) {
      const product = products.find(p => p.id === params.id);
      if (product) {
        setSelectedProduct(product);
        setCurrentSection('product-detail');
        getProductRecommendations(product);
      }
    } else if (categoryMatch && categoryParams?.categoryId) {
      setSelectedCategoryId(categoryParams.categoryId);
      setCurrentSection('category');
    } else {
      setCurrentSection('home');
      setSelectedProduct(null);
      setSelectedCategoryId(null);
    }
  }, [match, params, categoryMatch, categoryParams, products]);

  // Get AI recommendations for a product
  const getProductRecommendations = async (product: Product) => {
    try {
      const response = await apiRequest('POST', '/api/products/recommendations', {
        currentProductId: product.id,
        categoryId: product.categoryId,
      });
      const products = Array.isArray(response) ? response : [];
      setAiRecommendations(products.slice(0, 6));
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setAiRecommendations([]);
    }
  };

  // Navigation functions
  const navigateToCategory = (categoryId: string) => {
    setLocation(`/category/${categoryId}`);
  };

  const navigateToProduct = (productId: string) => {
    setLocation(`/product/${productId}`);
  };

  const navigateHome = () => {
    setLocation('/');
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
  
  // Advanced features helper functions
  const addToComparison = (product: Product) => {
    if (comparisonProducts.length >= 4) {
      toast({
        title: "Comparison Limit Reached",
        description: "You can compare up to 4 products at once",
        variant: "destructive"
      });
      return;
    }
    
    if (comparisonProducts.find(p => p.id === product.id)) {
      toast({
        title: "Already in Comparison", 
        description: "This product is already added for comparison",
      });
      return;
    }
    
    setComparisonProducts(prev => [...prev, product]);
    toast({
      title: "Added to Comparison",
      description: `${product.name} added to comparison list`,
    });
  };
  
  const startComparison = (products: Product[]) => {
    setComparisonProducts(products);
    setShowComparison(true);
  };
  
  const shareProduct = (product: Product) => {
    setSharingProduct(product);
    setShowSocialSharing(true);
  };
  
  const viewInAR = (product: Product) => {
    setSelectedProduct(product);
    setShowARViewer(true);
  };

  // Calculate bulk discount
  const calculateBulkDiscount = (basePrice: number, quantity: number): { price: number; discount: number } => {
    let discount = 0;
    if (quantity >= 100) discount = 0.15;
    else if (quantity >= 50) discount = 0.10;
    else if (quantity >= 20) discount = 0.05;
    
    const discountedPrice = basePrice * (1 - discount);
    return { price: discountedPrice, discount: discount * 100 };
  };

  // Calculate delivery-based pricing
  const calculateDeliveryPricing = (basePrice: number, days: number): { price: number; discount: number } => {
    let multiplier = 1;
    let discount = 0;
    
    if (days <= 2) {
      multiplier = 1.20;
    } else if (days <= 4) {
      multiplier = 1.10;
    } else if (days >= 7) {
      multiplier = 0.95;
      discount = 5;
    }
    
    return { price: basePrice * multiplier, discount };
  };

  // Filter products
  const getFilteredProducts = (productsToFilter: Product[] = products) => {
    let filtered = productsToFilter;
    
    if (selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered = filtered.filter(p => {
      const price = parseFloat(p.basePrice);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.basePrice) - parseFloat(b.basePrice);
        case 'price_high':
          return parseFloat(b.basePrice) - parseFloat(a.basePrice);
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

  // Header Component
  const Header = () => (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={navigateHome}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 flex items-center"
            >
              <Building2 className="w-8 h-8 mr-2" />
              BuildMart AI
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search for cement, steel, bricks, plumbing materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAIAssistant(true)}>
              <Bot className="w-4 h-4 mr-1" />
              AI Assistant
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowLoyaltyProgram(true)}>
              <Trophy className="w-4 h-4 mr-1" />
              Rewards
            </Button>
            {comparisonProducts.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowComparison(true)}>
                <Scale className="w-4 h-4 mr-1" />
                Compare ({comparisonProducts.length})
              </Button>
            )}
            <Button 
              variant="outline" 
              className="relative"
              onClick={() => setCurrentSection('cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-2 py-1 min-w-[1.25rem] h-5 text-xs">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
            
            {user ? (
              <Button variant="outline" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
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

  // Category Grid Component
  const CategoryGrid = () => (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.slice(0, 8).map((category, index) => {
            const icons = ['🏗️', '🔧', '🧱', '⚙️', '🚰', '⚡', '🏠', '🎨'];
            return (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => navigateToCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{icons[index] || '📦'}</div>
                  <h3 className="font-semibold text-sm text-center line-clamp-2">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );

  // Product Card Component
  const ProductCard = ({ 
    product, 
    featured = false,
    trending = false,
    viewMode = 'grid' 
  }: { 
    product: Product; 
    featured?: boolean;
    trending?: boolean; 
    viewMode?: 'grid' | 'list';
  }) => {
    const basePrice = parseFloat(product.basePrice);
    const bulkPricing = calculateBulkDiscount(basePrice, bulkQuantity);
    const deliveryPricing = calculateDeliveryPricing(bulkPricing.price, deliveryDays);
    
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-all group">
        <div 
          className={viewMode === 'list' ? 'flex gap-4 p-4' : 'relative'}
          onClick={() => navigateToProduct(product.id)}
        >
          {/* Product Image */}
          <div className={viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'}>
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-500" />
            </div>
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {trending && (
                <Badge className="bg-red-500 text-white">
                  <Flame className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-2">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description || "High-quality construction material"}
            </p>
            
            {/* Brand/Specs */}
            {product.specs && (
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs).slice(0, 2).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Pricing */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  ₹{deliveryPricing.price.toLocaleString()}
                </span>
                {(bulkPricing.discount > 0 || deliveryPricing.discount > 0) && (
                  <span className="text-gray-400 line-through">
                    ₹{basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Bulk Discount Info */}
              {bulkQuantity >= 20 && (
                <Badge variant="secondary" className="text-xs">
                  <Percent className="w-3 h-3 mr-1" />
                  {bulkPricing.discount}% Bulk Discount
                </Badge>
              )}
            </div>
            
            {/* Stock and Delivery */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant={product.stockQuantity && product.stockQuantity > 0 ? "secondary" : "destructive"}>
                {product.stockQuantity && product.stockQuantity > 0 
                  ? `${product.stockQuantity.toLocaleString()} in stock` 
                  : 'Out of stock'}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Truck className="w-4 h-4 mr-1" />
                {deliveryDays <= 2 ? 'Express' : deliveryDays <= 4 ? 'Fast' : 'Standard'}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
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
                    // Quick view functionality
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              
              {/* New Feature Buttons */}
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToComparison(product);
                  }}
                  className="flex-1 text-xs"
                >
                  <Scale className="w-3 h-3 mr-1" />
                  Compare
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewInAR(product);
                  }}
                  className="flex-1 text-xs"
                >
                  <Box className="w-3 h-3 mr-1" />
                  AR View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    shareProduct(product);
                  }}
                  className="flex-1 text-xs"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Featured Products Section
  const FeaturedSection = () => (
    <section className="py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Star className="w-6 h-6 mr-2 text-yellow-500" />
            Featured Products
          </h2>
          <Button variant="outline" size="sm">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
      </div>
    </section>
  );

  // Trending Products Section
  const TrendingSection = () => (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-red-500" />
            Trending Now
          </h2>
          <Button variant="outline" size="sm">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} trending />
          ))}
        </div>
      </div>
    </section>
  );

  // Home Page Component
  const HomePage = () => (
    <>
      <CategoryGrid />
      <FeaturedSection />
      <TrendingSection />
      
      {/* AI Tools Section */}
      <section className="py-8 px-4 bg-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">AI-Powered Construction Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Brain className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <h3 className="font-semibold mb-2">Material Estimator</h3>
              <p className="text-sm text-gray-600 mb-4">Upload construction images to get AI-powered material estimates</p>
              <Button onClick={() => setShowAIEstimator(true)}>
                Try Now
              </Button>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Calculator className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="font-semibold mb-2">Smart Quotation</h3>
              <p className="text-sm text-gray-600 mb-4">Get instant quotes with bulk discounts and delivery options</p>
              <Button variant="outline" onClick={() => openQuoteDialog()}>
                Get Quote
              </Button>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">Advance Booking</h3>
              <p className="text-sm text-gray-600 mb-4">Book materials in advance with flexible payment options</p>
              <Button variant="outline" onClick={() => openBookingDialog()}>
                Book Now
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </>
  );

  // Category Page Component
  const CategoryPage = () => {
    const category = categories.find(c => c.id === selectedCategoryId);
    const filteredProducts = getFilteredProducts();

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={navigateHome} className="hover:text-blue-600">Home</button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium">{category?.name}</span>
        </nav>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000}
                    min={0}
                    step={500}
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
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Quantity */}
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
                            checked={deliveryDays === days}
                            onCheckedChange={() => setDeliveryDays(days)}
                          />
                          <Label className="flex-1 ml-2">
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
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">{category?.name}</h1>
                <p className="text-gray-600">{filteredProducts.length} products</p>
              </div>
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
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={navigateHome} className="hover:text-blue-600">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button 
            onClick={() => navigateToCategory(selectedProduct.categoryId)}
            className="hover:text-blue-600"
          >
            {categories.find(c => c.id === selectedProduct.categoryId)?.name}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium">{selectedProduct.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-24 h-24 text-gray-500" />
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
              <div className="flex items-center gap-4 mb-6">
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
                  <Button variant="outline" onClick={() => openQuoteDialog(selectedProduct)}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Get Quote
                  </Button>
                  <Button variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
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
              You might also like
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ShoppingCart className="w-6 h-6 mr-2" />
        Shopping Cart ({cartItems.length})
      </h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={navigateHome}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const basePrice = parseFloat(item.product.basePrice);
            const totalPrice = basePrice * item.quantity;
            
            return (
              <Card key={item.product.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-bold text-green-600">
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
            <Button className="w-full">
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      )}
    </div>
  );

  // Main render
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'category':
        return <CategoryPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartSection />;
      default:
        return <HomePage />;
    }
  };

  // Quote Dialog Component
  const QuoteDialog = () => {
    const form = useForm({
      resolver: zodResolver(quoteFormSchema),
      defaultValues: {
        customerName: user?.username || '',
        customerEmail: user?.email || '',
        customerPhone: '',
        projectType: 'residential' as const,
        projectLocation: '',
        requirements: '',
        quantity: 1,
      },
    });

    const onSubmit = (values: any) => {
      const quoteData = {
        ...values,
        items: quoteProduct ? [
          {
            productId: quoteProduct.id,
            productName: quoteProduct.name,
            quantity: values.quantity,
            unitPrice: parseFloat(quoteProduct.basePrice),
            totalPrice: parseFloat(quoteProduct.basePrice) * values.quantity,
          }
        ] : [],
        requirements: {
          projectType: values.projectType,
          location: values.projectLocation,
          details: values.requirements,
        },
        subtotal: quoteProduct ? (parseFloat(quoteProduct.basePrice) * values.quantity).toString() : '0',
        taxAmount: quoteProduct ? (parseFloat(quoteProduct.basePrice) * values.quantity * 0.18).toString() : '0',
        totalAmount: quoteProduct ? (parseFloat(quoteProduct.basePrice) * values.quantity * 1.18).toString() : '0',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      createQuoteMutation.mutate(quoteData);
    };

    return (
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Quote</DialogTitle>
            <DialogDescription>
              {quoteProduct ? `Get a quote for ${quoteProduct.name}` : 'Get a custom quote for your construction materials'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Required</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe any specific requirements, timeline, or questions you have..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createQuoteMutation.isPending}>
                  {createQuoteMutation.isPending ? 'Submitting...' : 'Request Quote'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  // Booking Dialog Component
  const BookingDialog = () => {
    const form = useForm({
      resolver: zodResolver(bookingFormSchema),
      defaultValues: {
        customerName: user?.username || '',
        customerEmail: user?.email || '',
        customerPhone: '',
        serviceType: 'delivery' as const,
        scheduledDate: '',
        scheduledTime: '',
        location: '',
        requirements: '',
        quantity: 1,
      },
    });

    const onSubmit = (values: any) => {
      const bookingData = {
        ...values,
        requirements: {
          productId: bookingProduct?.id,
          productName: bookingProduct?.name,
          quantity: values.quantity,
          details: values.requirements,
        },
        estimatedDuration: values.serviceType === 'delivery' ? 180 : 300,
        cost: bookingProduct ? (parseFloat(bookingProduct.basePrice) * values.quantity * 1.15).toString() : '1000',
      };
      createBookingMutation.mutate(bookingData);
    };

    return (
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
            <DialogDescription>
              {bookingProduct ? `Book a service for ${bookingProduct.name}` : 'Schedule delivery, installation, or consultation'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="9:00 AM - 12:00 PM">Morning (9 AM - 12 PM)</SelectItem>
                          <SelectItem value="12:00 PM - 3:00 PM">Afternoon (12 PM - 3 PM)</SelectItem>
                          <SelectItem value="3:00 PM - 6:00 PM">Evening (3 PM - 6 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special instructions or requirements for the service..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBookingMutation.isPending}>
                  {createBookingMutation.isPending ? 'Booking...' : 'Book Service'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              Upload construction images or enter project details for AI-powered material estimates
            </DialogDescription>
          </DialogHeader>
          <AIEstimator onAddToCart={(materials) => {
            materials.forEach(material => {
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
      
      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              Sign in to add items to cart, save wishlist, and access personalized features.
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
      
      {/* Quote and Booking Dialogs */}
      <QuoteDialog />
      <BookingDialog />
      
      {/* Advanced Feature Modals */}
      <ProductComparison 
        isOpen={showComparison}
        onOpenChange={setShowComparison}
        initialProducts={comparisonProducts}
        onAddToCart={(product) => addToCart(product, 1)}
      />
      
      <AIShoppingAssistant
        isOpen={showAIAssistant}
        onOpenChange={setShowAIAssistant}
        onAddToCart={(product) => addToCart(product, 1)}
        onStartComparison={startComparison}
        currentContext={{
          viewingCategory: selectedCategoryId || undefined,
          viewingProduct: selectedProduct || undefined,
          cartItems: cartItems.map(item => item.product),
          recentSearches: [searchTerm].filter(Boolean)
        }}
      />
      
      <LoyaltyProgram
        isOpen={showLoyaltyProgram}
        onOpenChange={setShowLoyaltyProgram}
        userPurchases={cartItems.length}
        totalSpent={cartItems.reduce((total, item) => 
          total + (parseFloat(item.product.basePrice) * item.quantity), 0
        )}
      />
      
      {selectedProduct && (
        <ARProductViewer
          isOpen={showARViewer}
          onOpenChange={setShowARViewer}
          product={selectedProduct}
          onShare={shareProduct}
        />
      )}
      
      <SocialSharing
        isOpen={showSocialSharing}
        onOpenChange={setShowSocialSharing}
        product={sharingProduct || undefined}
        shareType="product"
      />
    </div>
  );
}