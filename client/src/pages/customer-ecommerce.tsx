import React, { useState, useEffect, useMemo } from "react";
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
  MessageCircle,
  Flame,
  Quote,
  FileText,
  Trash2,
  CreditCard
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
  productId: z.string().optional(),
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(10, 'Phone number required'),
  projectType: z.enum(['residential', 'commercial', 'industrial']),
  projectLocation: z.string().min(1, 'Location is required'),
  requirements: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

const bookingFormSchema = z.object({
  productId: z.string().optional(),
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(10, 'Phone number required'),
  serviceType: z.enum(['delivery', 'installation', 'consultation']),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  requirements: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  advancePayment: z.number().min(0, 'Advance payment required'),
});

export default function CustomerEcommerce() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/product/:id");
  const [location, navigate] = useLocation();

  // Core state
  const [currentSection, setCurrentSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  // Cart and pricing management
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buildmart-cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [productQuantities, setProductQuantities] = useState<{[key: string]: number}>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buildmart-quantities');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Dialog states
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showProductComparison, setShowProductComparison] = useState(false);
  const [showAIEstimator, setShowAIEstimator] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Product context states
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);

  // Wishlist and comparison
  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buildmart-wishlist');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Data fetching
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories/hierarchy'],
    refetchOnWindowFocus: false,
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['/api/products/featured'],
    refetchOnWindowFocus: false,
  });

  const { data: trendingProducts = [] } = useQuery({
    queryKey: ['/api/products/trending'],
    refetchOnWindowFocus: false,
  });

  // Quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: (data: any) => {
      if (!quoteProduct) {
        throw new Error('No product selected for quote');
      }
      const pricing = getProductPricing(quoteProduct, data.quantity);
      const quoteData = {
        ...data,
        productId: quoteProduct.id,
        productName: quoteProduct.name,
        productBasePrice: pricing.basePrice,
        productFinalPrice: pricing.finalPrice,
        estimatedPrice: pricing.totalPrice,
        discount: pricing.discount,
        status: 'pending',
        leadType: 'quote_request',
        submittedAt: new Date().toISOString(),
        requiresFollowUp: true
      };
      return apiRequest('POST', '/api/quotes', quoteData);
    },
    onSuccess: (response: any) => {
      toast({ 
        title: 'Quote Request Sent!', 
        description: `Quote #${response.quoteNumber || 'QT001'} submitted. Our team will contact you within 2 hours!`,
        duration: 5000
      });
      setShowQuoteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: any) => {
      if (!bookingProduct) {
        throw new Error('No product selected for booking');
      }
      const pricing = getProductPricing(bookingProduct, data.quantity);
      const advanceAmount = pricing.totalPrice * 0.1;
      const bookingData = {
        ...data,
        productId: bookingProduct.id,
        productName: bookingProduct.name,
        cost: (pricing.totalPrice + (data.advancePayment || advanceAmount)).toString(),
        estimatedDuration: data.serviceType === 'delivery' ? 180 : 300,
        status: 'confirmed',
        advancePayment: data.advancePayment || advanceAmount,
        scheduledDate: new Date(data.scheduledDate),
        requirements: {
          productId: bookingProduct.id,
          productName: bookingProduct.name,
          quantity: data.quantity,
          details: data.requirements,
        }
      };
      return apiRequest('POST', '/api/bookings', bookingData);
    },
    onSuccess: (response: any) => {
      toast({ 
        title: 'Booking Confirmed!', 
        description: `Booking #${response.bookingNumber || 'BK001'} confirmed. You'll receive confirmation details shortly.`,
        duration: 5000
      });
      setShowBookingDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // LocalStorage persistence
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('buildmart-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (Object.keys(productQuantities).length > 0) {
      localStorage.setItem('buildmart-quantities', JSON.stringify(productQuantities));
    }
  }, [productQuantities]);

  useEffect(() => {
    if (wishlistItems.length > 0) {
      localStorage.setItem('buildmart-wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems]);

  // Handle URL routing
  useEffect(() => {
    if (match && params?.id) {
      const product = products.find(p => p.id === params.id);
      if (product) {
        setSelectedProduct(product);
        setCurrentSection('product-detail');
      }
    }
  }, [match, params, products]);

  // Navigation functions
  const navigateHome = () => {
    setCurrentSection('home');
    setSelectedProduct(null);
    setSelectedCategoryId('');
    navigate('/');
  };

  const navigateToCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentSection('category');
    setSelectedProduct(null);
  };

  const navigateToProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setCurrentSection('product-detail');
      navigate(`/product/${productId}`);
    }
  };

  // Cart management functions
  const addToCart = (product: Product, quantity: number = 1, quantitySlab?: any) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cartItems.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cartItems, { product, quantity, selectedQuantitySlab: quantitySlab }];
    }
    
    setCartItems(updatedCart);
    localStorage.setItem('buildmart-cart', JSON.stringify(updatedCart));

    toast({
      title: "Added to Cart!",
      description: `${product.name} (${quantity}) added to your cart`,
      duration: 3000,
    });
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('buildmart-cart', JSON.stringify(updatedCart));
    toast({
      title: "Item Removed",
      description: "Item removed from cart",
      duration: 2000,
    });
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    const quantity = Math.max(1, newQuantity);
    const updatedCart = cartItems.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('buildmart-cart', JSON.stringify(updatedCart));
  };

  // Product quantity management
  const getProductQuantity = (productId: string) => productQuantities[productId] || 1;
  
  const setProductQuantity = (productId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    setProductQuantities(prev => {
      const updated = { ...prev, [productId]: newQuantity };
      localStorage.setItem('buildmart-quantities', JSON.stringify(updated));
      return updated;
    });
  };

  const getProductPricing = (product: Product, quantity?: number) => {
    const qty = quantity || getProductQuantity(product.id);
    const basePrice = parseFloat(product.basePrice);
    
    // Check for quantity slabs
    let finalPrice = basePrice;
    let discount = 0;
    let applicableSlab = null;
    
    if (product.quantitySlabs) {
      const slabs = Array.isArray(product.quantitySlabs) 
        ? product.quantitySlabs 
        : JSON.parse(product.quantitySlabs as string);
      
      applicableSlab = slabs.find((slab: any) => 
        qty >= slab.min_qty && qty <= slab.max_qty
      );
      
      if (applicableSlab) {
        finalPrice = applicableSlab.price_per_unit;
        discount = Math.round(((basePrice - finalPrice) / basePrice) * 100);
      }
    }
    
    return { finalPrice, basePrice, discount, quantity: qty, applicableSlab, totalPrice: finalPrice * qty };
  };

  // Filter products - FIXED SEARCH FUNCTIONALITY
  const getFilteredProducts = () => {
    let filtered = [...(products || [])];
    
    // Search filtering
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      
      // Special search terms
      if (term === 'featured') {
        return featuredProducts || [];
      } else if (term === 'trending') {
        return trendingProducts || [];
      } 
      
      // Regular search through products
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        const productName = (product.name || '').toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        const categoryName = categories.find(cat => cat.id === product.categoryId)?.name?.toLowerCase() || '';
        
        return productName.includes(term) || 
               productDesc.includes(term) || 
               categoryName.includes(term);
      });
    }
    
    // Category filtering
    if (selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
    }
    
    // Price range filtering
    filtered = filtered.filter(p => {
      const price = parseFloat(p.basePrice || '0');
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.basePrice || '0') - parseFloat(b.basePrice || '0');
        case 'price_high':
          return parseFloat(b.basePrice || '0') - parseFloat(a.basePrice || '0');
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
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
    <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 shadow-xl border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Package className="w-6 h-6 text-white font-bold" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-lg text-sharp">BuildMart AI</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl mx-8 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for cement, steel, bricks, plumbing materials..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentSection('home');
              }}
              className="pl-12 pr-6 py-3 w-full text-lg font-medium bg-white/95 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-lg focus:ring-4 focus:ring-blue-300/50 focus:border-yellow-400 transition-all duration-300 text-sharp"
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => setCurrentSection('home')} className="text-white hover:bg-white/20 hover:text-yellow-300 font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-sharp">
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
            <Button variant="ghost" onClick={() => setCurrentSection('categories')} className="text-white hover:bg-white/20 hover:text-yellow-300 font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-sharp">
              Categories
            </Button>
            <Button variant="ghost" onClick={() => setShowAIEstimator(true)} className="text-white hover:bg-white/20 hover:text-yellow-300 font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-sharp">
              <Bot className="w-5 h-5 mr-2" />
              AI Estimator
            </Button>
            <Button variant="ghost" onClick={() => setShowAIAssistant(true)} className="text-white hover:bg-white/20 hover:text-yellow-300 font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-sharp">
              <MessageCircle className="w-5 h-5 mr-2" />
              AI Assistant
            </Button>
          </nav>

          {/* Cart Icon */}
          <Button 
            variant="outline" 
            onClick={() => setCurrentSection('cart')}
            className="relative bg-white/90 hover:bg-yellow-400 hover:text-blue-900 border-2 border-white/30 text-blue-900 font-bold transition-all duration-300 shadow-lg rounded-xl px-4 py-2 transform hover:scale-105"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-sm font-bold bg-red-500 text-white shadow-lg animate-pulse"
              >
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );

  // Home Page Component  
  const HomePage = () => {
    const displayProducts = useMemo(() => {
      return getFilteredProducts();
    }, [products, searchTerm, selectedCategoryId, priceRange, sortBy, featuredProducts, trendingProducts, categories]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!searchTerm && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 mb-8 shadow-lg border border-blue-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl font-black text-gray-900 mb-4 text-sharp">
                  Premium Construction Materials
                </h1>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  Build your dreams with quality materials at unbeatable prices. AI-powered recommendations, instant quotes, and fast delivery.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => setShowAIEstimator(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    AI Material Estimator
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowAIAssistant(true)}
                    className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    Ask AI Assistant
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-300 rounded-2xl flex items-center justify-center shadow-xl">
                  <Building2 className="w-32 h-32 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!searchTerm && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 duration-200 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200" onClick={() => setSearchTerm('cement')}>
              <div className="text-center">
                <Box className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-bold text-orange-800 text-sharp">Cement</h3>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 duration-200 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200" onClick={() => setSearchTerm('steel')}>
              <div className="text-center">
                <Scale className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <h3 className="font-bold text-gray-800 text-sharp">Steel</h3>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 duration-200 bg-gradient-to-br from-red-50 to-red-100 border-red-200" onClick={() => setSearchTerm('bricks')}>
              <div className="text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-bold text-red-800 text-sharp">Bricks</h3>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 duration-200 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" onClick={() => setSearchTerm('plumbing')}>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-bold text-blue-800 text-sharp">Plumbing</h3>
              </div>
            </Card>
          </div>
        )}

        {/* Featured/Trending Products */}
        {!searchTerm && (
          <div className="space-y-8">
            {/* Featured Products */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900 text-sharp">Featured Products</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Trending Products */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h2 className="text-3xl font-bold text-gray-900 text-sharp">Trending Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingProducts.slice(0, 4).map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchTerm && searchTerm.trim() !== '' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-sharp">
                Search Results for "{searchTerm}" ({displayProducts.length} items)
              </h2>
              
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                
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
            </div>

            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {displayProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>

            {displayProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search terms or browse our categories</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Product Card Component
  const ProductCard = ({ product, viewMode = 'grid' }: { product: Product, viewMode?: string }) => {
    const pricing = getProductPricing(product);
    const quantity = getProductQuantity(product.id);

    return (
      <Card 
        className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 ${
          viewMode === 'list' ? 'flex flex-row' : ''
        }`}
        onClick={() => navigateToProduct(product.id)}
      >
        {/* Product Image */}
        <div className={viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'}>
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-500" />
          </div>
        </div>
        
        {/* Product Info */}
        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors text-sharp">
              {product.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle wishlist
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          
          {/* Pricing */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-green-600">
              ₹{pricing.totalPrice.toLocaleString()}
            </span>
            {pricing.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                ₹{(pricing.basePrice * quantity).toLocaleString()}
              </span>
            )}
            {pricing.discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {pricing.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setProductQuantity(product.id, quantity - 1);
              }}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setProductQuantity(product.id, quantity + 1);
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, quantity);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuoteProduct(product);
                  setShowQuoteDialog(true);
                }}
                className="text-xs"
              >
                <Quote className="w-3 h-3 mr-1" />
                Quote
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setBookingProduct(product);
                  setShowBookingDialog(true);
                }}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Book
              </Button>
            </div>
          </div>

          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          
          {product.isTrending && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-green-900">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
      </Card>
    );
  };

  // Cart Section
  const CartSection = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 text-sharp">Shopping Cart</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
        </Badge>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4 text-sharp">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some great products to get started!</p>
          <Button 
            onClick={() => setCurrentSection('home')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const pricing = getProductPricing(item.product, item.quantity);
            
            return (
              <Card key={item.product.id} className="p-6 border-2 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-sharp">{item.product.name}</h3>
                    <p className="text-gray-600 mb-3">{item.product.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{pricing.totalPrice.toLocaleString()}
                      </span>
                      {pricing.discount > 0 && (
                        <span className="text-lg text-gray-400 line-through">
                          ₹{(pricing.basePrice * item.quantity).toLocaleString()}
                        </span>
                      )}
                      {pricing.discount > 0 && (
                        <Badge variant="destructive">
                          {pricing.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-lg font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
          
          {/* Cart Summary */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold text-gray-900 text-sharp">Total:</span>
              <span className="text-3xl font-black text-green-600">
                ₹{cartItems.reduce((total, item) => {
                  const pricing = getProductPricing(item.product, item.quantity);
                  return total + pricing.totalPrice;
                }, 0).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => setCurrentSection('home')}
                className="font-semibold border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Continue Shopping
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg"
                onClick={() => {
                  toast({
                    title: "Order Placed Successfully!",
                    description: `Order total: ₹${cartItems.reduce((total, item) => {
                      const pricing = getProductPricing(item.product, item.quantity);
                      return total + pricing.totalPrice;
                    }, 0).toLocaleString()}. You will receive confirmation shortly.`,
                    duration: 5000
                  });
                  setCartItems([]);
                }}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  // Quote Dialog Component
  const QuoteDialog = () => {
    const form = useForm({
      resolver: zodResolver(quoteFormSchema),
      defaultValues: {
        productId: quoteProduct?.id || '',
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
      createQuoteMutation.mutate(values);
    };

    return (
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-sharp">Request Quote</DialogTitle>
            <DialogDescription>
              {quoteProduct ? `Get a detailed quote for ${quoteProduct.name}` : 'Get a customized quote for your construction needs'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="min-h-[100px]"
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
                <Button type="submit" disabled={createQuoteMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
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
        productId: bookingProduct?.id || '',
        customerName: user?.username || '',
        customerEmail: user?.email || '',
        customerPhone: '',
        serviceType: 'delivery' as const,
        scheduledDate: '',
        scheduledTime: '',
        location: '',
        requirements: '',
        quantity: 1,
        advancePayment: 0,
      },
    });

    const onSubmit = (values: any) => {
      createBookingMutation.mutate(values);
    };

    return (
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-sharp">Book Service</DialogTitle>
            <DialogDescription>
              {bookingProduct ? `Book a service for ${bookingProduct.name}` : 'Schedule delivery, installation, or consultation'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                          <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                          <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address for service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="advancePayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Payment (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <FormLabel>Special Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special instructions or requirements..." 
                        className="min-h-[100px]"
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
                <Button type="submit" disabled={createBookingMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  // Main render
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'cart':
        return <CartSection />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      {renderCurrentSection()}
      
      {/* Dialogs */}
      <QuoteDialog />
      <BookingDialog />
      
      {/* AI Tools */}
      {showAIEstimator && (
        <Dialog open={showAIEstimator} onOpenChange={setShowAIEstimator}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-sharp">AI Material Estimator</DialogTitle>
              <DialogDescription>
                Get intelligent material estimates for your construction project
              </DialogDescription>
            </DialogHeader>
            <AIEstimator />
          </DialogContent>
        </Dialog>
      )}
      
      {showAIAssistant && (
        <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-sharp">AI Shopping Assistant</DialogTitle>
              <DialogDescription>
                Get personalized product recommendations and answers to your questions
              </DialogDescription>
            </DialogHeader>
            <AIShoppingAssistant />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}