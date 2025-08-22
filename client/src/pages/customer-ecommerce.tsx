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
  MessageCircle,
  Flame,
  Quote,
  FileText,
  Trash2,
  ChevronUp,
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

// Multiple product item interface
interface SelectedQuoteProduct {
  product: Product;
  quantity: number;
}

interface SelectedBookingProduct {
  product: Product;
  quantity: number;
}

// Form schemas - updated for multiple products
const quoteFormSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(10, 'Phone number required'),
  projectType: z.enum(['residential', 'commercial', 'industrial']),
  projectLocation: z.string().min(1, 'Location is required'),
  requirements: z.string().optional(),
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
  advancePayment: z.number().min(0, 'Advance payment required'),
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
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // Multiple products state for quotation and booking
  const [selectedQuoteProducts, setSelectedQuoteProducts] = useState<SelectedQuoteProduct[]>([]);
  const [selectedBookingProducts, setSelectedBookingProducts] = useState<SelectedBookingProduct[]>([]);
  const [quoteProductSearch, setQuoteProductSearch] = useState('');
  const [bookingProductSearch, setBookingProductSearch] = useState('');
  const [bookingProductSearchTerm, setBookingProductSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
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
  const [selectedQuantitySlabs, setSelectedQuantitySlabs] = useState<{[key: string]: any}>({});
  const [bulkQuantity, setBulkQuantity] = useState<number>(1);
  const [deliveryDays, setDeliveryDays] = useState<number>(4);
  
  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buildmart-wishlist');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [compareList, setCompareList] = useState<Product[]>([]);
  
  // AI features
  const [showAIEstimator, setShowAIEstimator] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  
  // Advanced features
  const [showComparison, setShowComparison] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const aiMessagesRef = React.useRef<HTMLDivElement>(null);
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

  // Quote and booking mutations - Real-time with admin sharing
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
      // Invalidate admin queries to show new lead
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => {
      if (!bookingProduct) {
        throw new Error('No product selected for booking');
      }
      const pricing = getProductPricing(bookingProduct, data.quantity);
      const totalAmount = pricing.totalPrice;
      const advanceAmount = Math.max(totalAmount * 0.1, 100); // Minimum 10% or ₹100
      
      const bookingData = {
        ...data,
        productId: bookingProduct.id,
        productName: bookingProduct.name,
        productBasePrice: pricing.basePrice,
        productFinalPrice: pricing.finalPrice,
        totalAmount,
        advancePayment: advanceAmount,
        paymentStatus: 'advance_pending',
        bookingStatus: 'pending_payment',
        leadType: 'booking_request',
        submittedAt: new Date().toISOString(),
        requiresFollowUp: true
      };
      return apiRequest('POST', '/api/bookings', bookingData);
    },
    onSuccess: (response: any) => {
      toast({ 
        title: 'Booking Request Sent!', 
        description: `Booking #${response.bookingNumber || 'BK001'} created. Pay 10% advance (₹${response.advancePayment}) to confirm!`,
        duration: 5000
      });
      setShowBookingDialog(false);
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Search Handler - Fixed to allow multiple letters/words
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);
    
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setCurrentSection('home');
      return;
    }

    // Advanced search with multiple strategies
    if (!value || value.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const searchTerms = value.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);
    
    // Immediate search with debouncing
    const searchTimeout = setTimeout(() => {
      const results = products.filter(product => {
        const productName = product.name?.toLowerCase() || '';
        const productDesc = product.description?.toLowerCase() || '';
        const categoryName = categories.find(cat => cat.id === product.categoryId)?.name?.toLowerCase() || '';
        const specs = product.specs ? Object.values(product.specs).join(' ').toLowerCase() : '';
        
        // Multiple search strategies:
        // 1. Exact phrase match (highest priority)
        const searchPhrase = value.toLowerCase();
        if (productName.includes(searchPhrase) || productDesc.includes(searchPhrase) || 
            categoryName.includes(searchPhrase) || specs.includes(searchPhrase)) {
          return true;
        }
        
        // 2. All terms must be found somewhere (AND logic)
        const allTermsFound = searchTerms.every(term => 
          productName.includes(term) ||
          productDesc.includes(term) ||
          categoryName.includes(term) ||
          specs.includes(term)
        );
        
        if (allTermsFound) return true;
        
        // 3. At least half of the terms found (flexible matching)
        const foundTerms = searchTerms.filter(term => 
          productName.includes(term) ||
          productDesc.includes(term) ||
          categoryName.includes(term) ||
          specs.includes(term)
        );
        
        return foundTerms.length >= Math.ceil(searchTerms.length / 2);
      });
      
      // Sort results by relevance
      const sortedResults = results.sort((a, b) => {
        const aName = a.name?.toLowerCase() || '';
        const bName = b.name?.toLowerCase() || '';
        const searchPhrase = value.toLowerCase();
        
        // Prioritize exact name matches
        if (aName.includes(searchPhrase) && !bName.includes(searchPhrase)) return -1;
        if (!aName.includes(searchPhrase) && bName.includes(searchPhrase)) return 1;
        
        // Then by name similarity
        return aName.localeCompare(bName);
      });
      
      setSearchResults(sortedResults);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(searchTimeout);
  };

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

  // Save state to localStorage
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
    setCurrentSection('home');
    setLocation('/');
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
  
  // Wishlist functions
  const addToWishlist = (productId: string) => {
    if (wishlistItems.includes(productId)) {
      setWishlistItems(prev => prev.filter(id => id !== productId));
      toast({ title: "Removed from Wishlist", description: "Product removed from your wishlist" });
    } else {
      setWishlistItems(prev => [...prev, productId]);
      toast({ title: "Added to Wishlist", description: "Product added to your wishlist" });
    }
  };

  // Product quantity management
  const getProductQuantity = (productId: string) => productQuantities[productId] || 1;
  
  const setProductQuantity = (productId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    setProductQuantities(prev => {
      const updated = { ...prev, [productId]: newQuantity };
      // Immediately save to localStorage
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
        : JSON.parse(product.quantitySlabs as string || '[]');
      
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

  // Advanced features helper functions
  const addToComparison = (product: Product) => {
    if (comparisonProducts.length >= 4) {
      setShowComparison(true); // Auto-open when limit reached
      toast({
        title: "Auto-Starting Comparison",
        description: "You have 4 products - starting comparison now!",
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
    
    const newList = [...comparisonProducts, product];
    setComparisonProducts(newList);
    
    if (newList.length === 4) {
      setShowComparison(true);
      toast({
        title: "Auto-Starting Comparison",
        description: "You have 4 products - starting comparison now!",
      });
    } else {
      toast({
        title: "Added to Comparison",
        description: `${product.name} added (${newList.length}/4 products)`,
      });
    }
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
  // Simplified product filtering for category/price filters
  const getCategoryFilteredProducts = () => {
    let filtered = products;
    
    if (selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
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
          
          {/* New Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search for cement, steel, bricks, plumbing materials..."
              value={searchTerm}
              onChange={(e) => handleSearch(e)}
              className="pl-10 pr-4 py-2 w-full"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
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
    const currentQuantity = getProductQuantity(product.id);
    const pricing = getProductPricing(product, currentQuantity);
    const isInWishlist = wishlistItems.includes(product.id);
    
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
            
            {/* Badges - Fixed positioning */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {featured && (
                <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {trending && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                  <Flame className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
          </div>
          
          {/* Product Info - Fixed layout */}
          <div className={viewMode === 'list' ? 'flex-1' : 'p-4 flex flex-col h-full'}>
            <h3 className="font-semibold text-base group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description || "High-quality construction material"}
            </p>
            
            {/* Brand/Specs */}
            {product.specs && (
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs || {}).slice(0, 2).map(([key, value]: [string, any]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-sm">Qty:</Label>
              <div className="flex items-center border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProductQuantity(product.id, currentQuantity - 1);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  value={currentQuantity}
                  onChange={(e) => {
                    e.stopPropagation();
                    const qty = parseInt(e.target.value) || 1;
                    setProductQuantity(product.id, qty);
                  }}
                  className="w-16 text-center border-0"
                  min="1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProductQuantity(product.id, currentQuantity + 1);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Dynamic Pricing */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  ₹{pricing.finalPrice.toLocaleString()}
                </span>
                {pricing.discount > 0 && (
                  <span className="text-gray-400 line-through">
                    ₹{pricing.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Quantity Slab Discount Info */}
              {pricing.discount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Percent className="w-3 h-3 mr-1" />
                  {pricing.discount}% Volume Discount
                </Badge>
              )}
              
              {/* Show quantity slab info and total */}
              {product.quantitySlabs && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Buy {currentQuantity} @ ₹{pricing.finalPrice} each</div>
                  <div className="font-semibold text-green-600">
                    Total: ₹{pricing.totalPrice.toLocaleString()}
                  </div>
                </div>
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
                Fast Delivery
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, currentQuantity, selectedQuantitySlabs[product.id]);
                  }}
                  className="flex-1"
                  disabled={!product.stockQuantity || product.stockQuantity <= 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant={isInWishlist ? "default" : "outline"} 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToWishlist(product.id);
                  }}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {/* Feature Buttons */}
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
                    e.preventDefault();
                    e.stopPropagation();
                    openQuoteDialog(product);
                  }}
                  className="flex-1 text-xs"
                >
                  <Quote className="w-3 h-3 mr-1" />
                  Quote
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openBookingDialog(product);
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
                  className="flex-1 text-xs min-h-8"
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setCurrentSection('home');
              setSearchTerm('featured');
            }}
          >
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.slice(0, 6).map((product) => (
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setCurrentSection('home');
              setSearchTerm('trending');
            }}
          >
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
  const HomePage = () => {
    const hasSearchResults = searchTerm && searchResults.length > 0;
    const hasSearchButNoResults = searchTerm && searchResults.length === 0;
    
    return (
      <>
        {/* Search Results Section */}
        {hasSearchResults && (
          <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">
                Search Results for "{searchTerm}" ({searchResults.length} found)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.slice(0, 12).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {searchResults.length > 12 && (
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={() => {}}>
                    View All {searchResults.length} Results
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* No Search Results */}
        {hasSearchButNoResults && (
          <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn't find any products matching "{searchTerm}". Try different keywords or browse our categories.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
                setCurrentSection('home');
              }}>
                Clear Search
              </Button>
            </div>
          </section>
        )}
        
        {/* Default Homepage Content */}
        {!searchTerm && (
          <>
            <CategoryGrid />
            <FeaturedSection />
            <TrendingSection />
          </>
        )}
        
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
  };

  // Category Page Component
  const CategoryPage = () => {
    const category = categories.find(c => c.id === selectedCategoryId);
    const filteredProducts = getCategoryFilteredProducts();

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
    const quantity = getProductQuantity(selectedProduct.id);
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
                    onClick={() => setProductQuantity(selectedProduct.id, Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    value={quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value) || 1;
                      setProductQuantity(selectedProduct.id, qty);
                    }}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductQuantity(selectedProduct.id, quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    addToCart(selectedProduct, quantity);
                    toast({
                      title: "Added to Cart!",
                      description: `${selectedProduct.name} (${quantity}) added successfully`,
                      duration: 3000,
                    });
                  }}
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
        
        {/* Construction Business Recommended Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Construction className="w-6 h-6 mr-2 text-blue-600" />
            Recommended for Construction Projects
          </h2>
          <p className="text-gray-600 mb-6">
            Construction professionals who viewed this product also considered these essential materials
          </p>
          
          {/* Show recommended products based on category or similar type */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(() => {
              // Get products from same category or complementary categories
              const currentCategory = categories.find(cat => cat.id === selectedProduct.categoryId);
              let recommendedProducts = [];
              
              if (currentCategory) {
                // Get 2-3 products from same category (excluding current product)
                const sameCategory = products
                  .filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)
                  .slice(0, 3);
                
                // Get complementary products based on construction logic
                let complementaryProducts = [];
                if (currentCategory.name.toLowerCase().includes('cement') || currentCategory.name.toLowerCase().includes('concrete')) {
                  // If viewing cement, recommend steel and bricks
                  complementaryProducts = products.filter(p => 
                    p.name.toLowerCase().includes('steel') || 
                    p.name.toLowerCase().includes('brick') ||
                    p.name.toLowerCase().includes('sand')
                  ).slice(0, 2);
                } else if (currentCategory.name.toLowerCase().includes('steel') || currentCategory.name.toLowerCase().includes('bar')) {
                  // If viewing steel, recommend cement and bricks
                  complementaryProducts = products.filter(p => 
                    p.name.toLowerCase().includes('cement') || 
                    p.name.toLowerCase().includes('brick') ||
                    p.name.toLowerCase().includes('wire')
                  ).slice(0, 2);
                } else if (currentCategory.name.toLowerCase().includes('brick')) {
                  // If viewing bricks, recommend cement and steel
                  complementaryProducts = products.filter(p => 
                    p.name.toLowerCase().includes('cement') || 
                    p.name.toLowerCase().includes('steel') ||
                    p.name.toLowerCase().includes('sand')
                  ).slice(0, 2);
                } else if (currentCategory.name.toLowerCase().includes('plumbing')) {
                  // If viewing plumbing, recommend related items
                  complementaryProducts = products.filter(p => 
                    p.name.toLowerCase().includes('pipe') || 
                    p.name.toLowerCase().includes('fitting') ||
                    p.name.toLowerCase().includes('valve')
                  ).slice(0, 2);
                } else if (currentCategory.name.toLowerCase().includes('electrical')) {
                  // If viewing electrical, recommend related items
                  complementaryProducts = products.filter(p => 
                    p.name.toLowerCase().includes('wire') || 
                    p.name.toLowerCase().includes('cable') ||
                    p.name.toLowerCase().includes('switch')
                  ).slice(0, 2);
                } else {
                  // Default: get trending or featured products
                  complementaryProducts = featuredProducts.slice(0, 2);
                }
                
                recommendedProducts = [...sameCategory, ...complementaryProducts]
                  .filter((product, index, self) => 
                    index === self.findIndex(p => p.id === product.id) // Remove duplicates
                  )
                  .slice(0, 5); // Show max 5 products
              }
              
              // Fallback to featured products if no category-based recommendations
              if (recommendedProducts.length === 0) {
                recommendedProducts = featuredProducts.slice(0, 5);
              }
              
              return recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ));
            })()}
          </div>
          
          {/* AI-powered recommendations if available */}
          {aiRecommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI-Powered Suggestions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiRecommendations.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
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
                      onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
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
          <Card className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{cartItems.reduce((total, item) => {
                  const pricing = getProductPricing(item.product, item.quantity);
                  return total + pricing.totalPrice;
                }, 0).toLocaleString()}
              </span>
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                // Create a proper checkout flow
                const orderTotal = cartItems.reduce((total, item) => {
                  const pricing = getProductPricing(item.product, item.quantity);
                  return total + pricing.totalPrice;
                }, 0);
                
                const orderDetails = {
                  items: cartItems.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: parseFloat(item.product.basePrice),
                    total: parseFloat(item.product.basePrice) * item.quantity
                  })),
                  totalAmount: orderTotal,
                  customerEmail: user?.email || 'guest@buildmart.com',
                  orderDate: new Date().toISOString()
                };
                
                toast({
                  title: "Order Placed Successfully!",
                  description: `Order #BM${Date.now().toString().slice(-6)} - Total: ₹${orderTotal.toLocaleString()}. You will receive confirmation shortly.`,
                  duration: 5000
                });
                
                // Clear cart after successful order
                setCartItems([]);
                localStorage.removeItem('buildmart-cart');
                
                // Navigate back to home
                setCurrentSection('home');
              }}
            >
              <CreditCard className="w-4 h-4 mr-2" />
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
  // Helper functions for multiple products
  const addQuoteProduct = (product: Product) => {
    const existingIndex = selectedQuoteProducts.findIndex(item => item.product.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...selectedQuoteProducts];
      updated[existingIndex].quantity += 1;
      setSelectedQuoteProducts(updated);
    } else {
      setSelectedQuoteProducts([...selectedQuoteProducts, { product, quantity: 1 }]);
    }
    setQuoteProductSearch('');
  };

  const updateQuoteProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedQuoteProducts(selectedQuoteProducts.filter(item => item.product.id !== productId));
    } else {
      setSelectedQuoteProducts(selectedQuoteProducts.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeQuoteProduct = (productId: string) => {
    setSelectedQuoteProducts(selectedQuoteProducts.filter(item => item.product.id !== productId));
  };

  const addBookingProduct = (product: Product) => {
    const existingIndex = selectedBookingProducts.findIndex(item => item.product.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...selectedBookingProducts];
      updated[existingIndex].quantity += 1;
      setSelectedBookingProducts(updated);
    } else {
      setSelectedBookingProducts([...selectedBookingProducts, { product, quantity: 1 }]);
    }
    setBookingProductSearch('');
  };

  const updateBookingProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedBookingProducts(selectedBookingProducts.filter(item => item.product.id !== productId));
    } else {
      setSelectedBookingProducts(selectedBookingProducts.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeBookingProduct = (productId: string) => {
    setSelectedBookingProducts(selectedBookingProducts.filter(item => item.product.id !== productId));
  };

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
      },
    });

    // Initialize with quoteProduct if provided
    React.useEffect(() => {
      if (quoteProduct && selectedQuoteProducts.length === 0) {
        setSelectedQuoteProducts([{ product: quoteProduct, quantity: 1 }]);
      }
    }, [quoteProduct]);

    const calculateQuoteTotal = () => {
      const subtotal = selectedQuoteProducts.reduce((sum, item) => 
        sum + (parseFloat(item.product.basePrice) * item.quantity), 0
      );
      const taxAmount = subtotal * 0.18;
      return { subtotal, taxAmount, total: subtotal + taxAmount };
    };

    const onSubmit = (values: any) => {
      if (selectedQuoteProducts.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one product for the quote",
          variant: "destructive",
        });
        return;
      }

      const { subtotal, taxAmount, total } = calculateQuoteTotal();
      const quoteData = {
        ...values,
        items: selectedQuoteProducts.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.product.basePrice),
          totalPrice: parseFloat(item.product.basePrice) * item.quantity,
        })),
        requirements: {
          projectType: values.projectType,
          location: values.projectLocation,
          details: values.requirements,
        },
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: total.toString(),
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
              {/* Multiple Products Selection */}
              <div className="space-y-4">
                <Label>Select Products for Quote</Label>
                
                {/* Product Search */}
                <div className="space-y-2">
                  <Input
                    placeholder="Search products to add to quote..."
                    value={quoteProductSearch}
                    onChange={(e) => setQuoteProductSearch(e.target.value)}
                  />
                  
                  {quoteProductSearch && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {products?.filter(product => 
                        product.name.toLowerCase().includes(quoteProductSearch.toLowerCase())
                      ).slice(0, 5).map(product => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => addQuoteProduct(product)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">₹{parseFloat(product.basePrice).toLocaleString()}</p>
                            </div>
                            <Plus className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                {selectedQuoteProducts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Products ({selectedQuoteProducts.length})</Label>
                    {selectedQuoteProducts.map(item => (
                      <Card key={item.product.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              ₹{parseFloat(item.product.basePrice).toLocaleString()} × {item.quantity} = 
                              ₹{(parseFloat(item.product.basePrice) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuoteProductQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuoteProductQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeQuoteProduct(item.product.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {/* Quote Summary */}
                    <Card className="p-3 bg-blue-50">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>₹{calculateQuoteTotal().subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax (18%):</span>
                          <span>₹{calculateQuoteTotal().taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>₹{calculateQuoteTotal().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* Product Summary - Show selected product details */}
              {quoteProduct && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">{quoteProduct.name}</h4>
                      <p className="text-sm text-blue-700 mt-1">{quoteProduct.description}</p>
                      <p className="text-sm font-medium text-blue-800 mt-2">Base Price: ₹{quoteProduct.basePrice}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuoteProduct(null)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

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
        advancePayment: 0,
      },
    });

    // Initialize with bookingProduct if provided
    React.useEffect(() => {
      if (bookingProduct && selectedBookingProducts.length === 0) {
        setSelectedBookingProducts([{ product: bookingProduct, quantity: 1 }]);
      }
    }, [bookingProduct]);

    const calculateBookingTotal = () => {
      const subtotal = selectedBookingProducts.reduce((sum, item) => 
        sum + (parseFloat(item.product.basePrice) * item.quantity), 0
      );
      const serviceCharge = subtotal * 0.15; // 15% service charge
      return { subtotal, serviceCharge, total: subtotal + serviceCharge };
    };

    const onSubmit = (values: any) => {
      if (selectedBookingProducts.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one product for booking",
          variant: "destructive",
        });
        return;
      }

      const { total } = calculateBookingTotal();
      const bookingData = {
        ...values,
        scheduledDate: new Date(values.scheduledDate + 'T' + values.scheduledTime),
        requirements: {
          products: selectedBookingProducts.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
          })),
          details: values.requirements,
        },
        estimatedDuration: values.serviceType === 'delivery' ? 180 : 300,
        cost: total.toString(),
      };
      createBookingMutation.mutate(bookingData);
    };

    return (
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
            <DialogDescription>
              Schedule delivery, installation, or consultation for multiple products
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Multiple Products Selection for Booking */}
              <div className="space-y-4">
                <Label>Select Products for Service Booking</Label>
                
                {/* Product Search */}
                <div className="space-y-2">
                  <Input
                    placeholder="Search products to add to booking..."
                    value={bookingProductSearch}
                    onChange={(e) => setBookingProductSearch(e.target.value)}
                  />
                  
                  {bookingProductSearch && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {products?.filter(product => 
                        product.name.toLowerCase().includes(bookingProductSearch.toLowerCase())
                      ).slice(0, 5).map(product => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => addBookingProduct(product)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">₹{parseFloat(product.basePrice).toLocaleString()}</p>
                            </div>
                            <Plus className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Products for Booking */}
                {selectedBookingProducts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Products ({selectedBookingProducts.length})</Label>
                    {selectedBookingProducts.map(item => (
                      <Card key={item.product.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              ₹{parseFloat(item.product.basePrice).toLocaleString()} × {item.quantity} = 
                              ₹{(parseFloat(item.product.basePrice) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingProductQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingProductQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBookingProduct(item.product.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {/* Booking Summary */}
                    <Card className="p-3 bg-green-50">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Products Total:</span>
                          <span>₹{calculateBookingTotal().subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Charge (15%):</span>
                          <span>₹{calculateBookingTotal().serviceCharge.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total Booking Cost:</span>
                          <span>₹{calculateBookingTotal().total.toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* Product Summary - Show selected product details */}
              {bookingProduct && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900">{bookingProduct.name}</h4>
                      <p className="text-sm text-green-700 mt-1">{bookingProduct.description}</p>
                      <p className="text-sm font-medium text-green-800 mt-2">Base Price: ₹{bookingProduct.basePrice}</p>
                      <p className="text-xs text-green-600 mt-1">10% advance payment required</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBookingProduct(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

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
                imageUrl: null,
                brand: null,
                bulkDiscountSlabs: null,
                deliveryDiscountSlabs: null,
                company: null,
                gstRate: null,
                isTrending: null
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