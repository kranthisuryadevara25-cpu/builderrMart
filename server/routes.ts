import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCategorySchema, insertProductSchema, insertDiscountSchema, insertQuoteSchema, insertBookingSchema,
  insertMarketingMaterialSchema, insertContractorSchema, insertAdvanceSchema, insertOrderSchema, insertPricingRuleSchema,
  updateCategorySchema, updateProductSchema, updateDiscountSchema, updateQuoteSchema, updateBookingSchema 
} from "@shared/schema";
import { z } from "zod";
import { AIEstimationService } from "./aiEstimation";
import { ObjectStorageService } from "./objectStorage";
import { initializeDummyData } from "./seedData";
import { AIRecommendationService } from "./aiRecommendations";
import { DynamicPricingEngine } from "./pricingEngine";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare module "express" {
  interface Request {
    user?: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize dummy data
  setTimeout(() => {
    initializeDummyData();
  }, 2000);

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'buildmart-ai-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  };

  const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
  };

  const requireAdminRole = requireRole(['owner_admin', 'vendor_manager']);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`🔐 Login attempt - Email: ${email}, Password length: ${password?.length}`);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`❌ User not found for email: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`✅ User found: ${user.username} (${user.role})`);
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.log(`❌ Password validation failed for: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`✅ Login successful for: ${email}`);
      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error(`🚨 Login error:`, error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // Stripe payment route for checkout calculations
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      // Mock payment intent creation (replace with actual Stripe integration)
      const paymentIntent = {
        client_secret: "pi_test_" + Math.random().toString(36).substr(2, 9),
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr"
      };
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // AI Services
  const aiEstimationService = new AIEstimationService();
  const objectStorageService = new ObjectStorageService();
  const aiRecommendationService = new AIRecommendationService();
  const pricingEngine = new DynamicPricingEngine();

  // Get upload URL for construction images
  app.post("/api/construction/upload-url", requireAuth, async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getImageUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Analyze construction image and estimate materials
  app.post("/api/construction/analyze", async (req, res) => {
    try {
      const { imageURL, additionalInfo } = req.body;
      
      if (!imageURL) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      // Get the normalized image path
      const imagePath = objectStorageService.normalizeImagePath(imageURL);
      
      // Download the image file
      const imageFile = await objectStorageService.getImageFile(imagePath);
      
      // Convert image to base64 for AI analysis
      const imageBase64 = await objectStorageService.downloadImageAsBase64(imageFile);
      
      // Analyze the image with AI
      const analysis = await aiEstimationService.getEnhancedEstimation(
        imageBase64,
        additionalInfo
      );
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing construction image:", error);
      res.status(500).json({ 
        message: "Failed to analyze construction image: " + error.message 
      });
    }
  });

  // Get material estimates without image (based on user inputs) - Public access for demo
  app.post("/api/construction/estimate", async (req, res) => {
    try {
      const { area, floors, projectType, budget } = req.body;
      
      if (!area) {
        return res.status(400).json({ message: "Area is required for estimation" });
      }

      // Create a mock analysis based on user inputs
      const analysis = await aiEstimationService.getEnhancedEstimation(
        "", // No image
        { area, floors, projectType, budget }
      );
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Error creating material estimate:", error);
      res.status(500).json({ 
        message: "Failed to create material estimate: " + error.message 
      });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories/hierarchy", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error("Error getting categories hierarchy:", error);
      res.json([]);
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", requireAuth, requireRole(['owner_admin', 'vendor_manager']), async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/categories/:id", requireAuth, requireRole(['owner_admin', 'vendor_manager']), async (req: any, res) => {
    try {
      const categoryData = updateCategorySchema.parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/categories/:id", requireAuth, requireRole(['owner_admin', 'vendor_manager']), async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req: any, res) => {
    try {
      const { vendorId, categoryId, search } = req.query;
      const products = await storage.getProducts(vendorId, categoryId, search);
      res.json(products || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.json([]);
    }
  });

  // Specific product routes (must come before :id route)
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products || []);
    } catch (error: any) {
      console.error("Error getting featured products:", error);
      res.json([]);
    }
  });

  app.get("/api/products/trending", async (req, res) => {
    try {
      const products = await storage.getTrendingProducts();
      res.json(products || []);
    } catch (error: any) {
      console.error("Error getting trending products:", error);
      res.json([]);
    }
  });

  app.get("/api/products/:id", async (req: any, res) => {
    try {
      // Skip special routes
      if (req.params.id === 'featured' || req.params.id === 'trending') {
        return res.status(404).json({ message: "Route not found" });
      }
      
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Vendors can only see their own products
      if (req.user && req.user.role === 'vendor' && product.vendorId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", requireAuth, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Set vendor ID for vendors
      if (req.user.role === 'vendor') {
        productData.vendorId = req.user.id;
      }
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req: any, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Vendors can only edit their own products
      if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const productData = updateProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(req.params.id, productData);
      res.json(updatedProduct);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req: any, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Vendors can only delete their own products
      if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const success = await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced E-commerce Routes

  // AI Recommendations - routes moved above to avoid conflicts

  app.post("/api/products/recommendations", async (req, res) => {
    try {
      const { categoryId, currentProductId, userBehavior, contextualData } = req.body;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const recommendations = await aiRecommendationService.getProductRecommendations({
        userId: (req as any).user?.id,
        categoryId,
        currentProductId,
        userBehavior,
        contextualData
      }, limit);
      
      res.json(recommendations);
    } catch (error: any) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  // Dynamic Pricing Routes
  app.post("/api/pricing/calculate", requireAuth, async (req, res) => {
    try {
      const { productId, quantity, location, deliveryDate, userType, paymentMethod, urgency } = req.body;
      
      if (!productId || !quantity) {
        return res.status(400).json({ message: "Product ID and quantity are required" });
      }

      const pricing = await pricingEngine.calculateProductPricing(productId, {
        quantity: parseInt(quantity),
        location,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        userType,
        paymentMethod,
        urgency
      });
      
      res.json(pricing);
    } catch (error: any) {
      console.error("Error calculating pricing:", error);
      res.status(500).json({ message: "Failed to calculate pricing: " + error.message });
    }
  });

  app.post("/api/quotations/generate", requireAuth, async (req, res) => {
    try {
      const { items, customerName, customerEmail, deliveryAddress, location, userType, urgency } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items array is required" });
      }

      const quotation = await pricingEngine.generateQuotation(items, {
        customerName,
        customerEmail,
        deliveryAddress,
        location,
        userType,
        urgency
      });
      
      res.json(quotation);
    } catch (error: any) {
      console.error("Error generating quotation:", error);
      res.status(500).json({ message: "Failed to generate quotation: " + error.message });
    }
  });

  app.get("/api/pricing/market-analysis/:productId", requireAuth, async (req, res) => {
    try {
      const { productId } = req.params;
      const analysis = await pricingEngine.getMarketPriceAnalysis(productId);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error getting market analysis:", error);
      res.status(500).json({ message: "Failed to get market analysis: " + error.message });
    }
  });

  // Enhanced Product Search and Filtering
  app.get("/api/products/search", async (req, res) => {
    try {
      const { 
        q: query, 
        category, 
        minPrice, 
        maxPrice, 
        inStock, 
        brand, 
        sortBy, 
        sortOrder = 'asc',
        page = '1',
        limit = '20'
      } = req.query;

      let products = await storage.getProducts();

      // Apply filters
      if (query) {
        const searchTerm = (query as string).toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchTerm) || 
          (p.description && p.description.toLowerCase().includes(searchTerm)) ||
          (p.specs && JSON.stringify(p.specs).toLowerCase().includes(searchTerm))
        );
      }

      if (category) {
        products = products.filter(p => p.categoryId === category);
      }

      if (minPrice || maxPrice) {
        const min = minPrice ? parseFloat(minPrice as string) : 0;
        const max = maxPrice ? parseFloat(maxPrice as string) : Infinity;
        products = products.filter(p => {
          const price = parseFloat(p.basePrice);
          return price >= min && price <= max;
        });
      }

      if (inStock === 'true') {
        products = products.filter(p => (p.stockQuantity || 0) > 0);
      }

      if (brand) {
        products = products.filter(p => {
          const specs = p.specs as any;
          return specs?.brand?.toLowerCase() === (brand as string).toLowerCase();
        });
      }

      // Apply sorting
      if (sortBy) {
        products.sort((a, b) => {
          let aVal, bVal;
          switch (sortBy) {
            case 'price':
              aVal = parseFloat(a.basePrice);
              bVal = parseFloat(b.basePrice);
              break;
            case 'name':
              aVal = a.name;
              bVal = b.name;
              break;
            case 'stock':
              aVal = a.stockQuantity || 0;
              bVal = b.stockQuantity || 0;
              break;
            case 'created':
              aVal = new Date(a.createdAt || 0).getTime();
              bVal = new Date(b.createdAt || 0).getTime();
              break;
            default:
              return 0;
          }
          
          if (sortOrder === 'desc') {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
          }
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
      }

      // Apply pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedProducts = products.slice(startIndex, endIndex);

      res.json({
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: products.length,
          totalPages: Math.ceil(products.length / limitNum)
        },
        filters: {
          totalResults: products.length,
          appliedFilters: {
            query: query || null,
            category: category || null,
            priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : null,
            brand: brand || null,
            inStock: inStock === 'true'
          }
        }
      });
    } catch (error: any) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Categories with hierarchy - fixed
  app.get("/api/categories/hierarchy", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      
      if (!categories || categories.length === 0) {
        return res.json([]);
      }
      
      // Simple flat category list for now to avoid hierarchy issues
      res.json(categories);
    } catch (error: any) {
      console.error("Error getting category hierarchy:", error);
      // Return empty array instead of error to prevent breaking the UI
      res.json([]);
    }
  });

  // Discount CRUD routes
  app.get("/api/discounts", requireAuth, requireRole(['owner_admin', 'vendor_manager']), async (req, res) => {
    try {
      const discounts = await storage.getDiscounts();
      res.json(discounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/discounts", requireAuth, requireRole(['owner_admin', 'vendor_manager']), async (req: any, res) => {
    try {
      const discountData = insertDiscountSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const discount = await storage.createDiscount(discountData);
      res.json(discount);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/discounts/:id", requireAuth, requireRole(['owner_admin', 'vendor_manager']), async (req, res) => {
    try {
      const discountData = updateDiscountSchema.parse(req.body);
      const discount = await storage.updateDiscount(req.params.id, discountData);
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      res.json(discount);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/discounts/:id", requireAuth, requireRole(['owner_admin', 'vendor_manager']), async (req, res) => {
    try {
      const success = await storage.deleteDiscount(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Discount not found" });
      }
      res.json({ message: "Discount deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quote CRUD routes
  app.get("/api/quotes", requireAuth, async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/quotes/:id", requireAuth, async (req, res) => {
    try {
      const quoteData = updateQuoteSchema.parse(req.body);
      const quote = await storage.updateQuote(req.params.id, quoteData);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Booking CRUD routes  
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const bookingData = updateBookingSchema.parse(req.body);
      const booking = await storage.updateBooking(req.params.id, bookingData);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Advanced booking route (legacy - now uses the booking system above)
  app.post("/api/products/advance-booking", async (req, res) => {
    try {
      const { productId, quantity, deliveryDate, customerName, customerEmail, customerPhone, location, requirements } = req.body;
      
      if (!productId || !quantity || !deliveryDate || !customerName || !customerEmail) {
        return res.status(400).json({ message: "Product ID, quantity, delivery date, customer name, and email are required" });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const booking = await storage.createBooking({
        customerName,
        customerEmail,
        customerPhone,
        serviceType: 'delivery',
        scheduledDate: new Date(deliveryDate),
        location: location || 'Not specified',
        requirements: { productId, quantity, productName: product.name, ...requirements },
        cost: String(parseFloat(product.basePrice) * quantity)
      });
      
      res.json({
        success: true,
        booking,
        message: "Advance booking created successfully"
      });
    } catch (error: any) {
      console.error("Error creating advance booking:", error);
      res.status(500).json({ message: "Failed to create advance booking: " + error.message });
    }
  });

  // Quote management endpoints
  app.post('/api/quotes', async (req, res) => {
    try {
      const quoteData = {
        ...req.body,
        id: `QT${Date.now()}`,
        quoteNumber: `QT${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // In a real app, save to database
      console.log('New Quote Request:', quoteData);
      
      res.json({
        success: true,
        quoteNumber: quoteData.quoteNumber,
        estimatedPrice: quoteData.estimatedPrice,
        message: 'Quote request submitted successfully'
      });
    } catch (error: any) {
      console.error('Quote creation error:', error);
      res.status(500).json({ message: 'Failed to create quote' });
    }
  });

  // Booking management endpoints
  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
        id: `BK${Date.now()}`,
        bookingNumber: `BK${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'pending_payment'
      };
      
      // In a real app, save to database
      console.log('New Booking Request:', bookingData);
      
      res.json({
        success: true,
        bookingNumber: bookingData.bookingNumber,
        totalAmount: bookingData.totalAmount,
        advancePayment: bookingData.advancePayment,
        message: 'Booking request created successfully'
      });
    } catch (error: any) {
      console.error('Booking creation error:', error);
      res.status(500).json({ message: 'Failed to create booking' });
    }
  });

  // Admin quotes endpoint (for lead management)
  app.get('/api/admin/quotes', async (req, res) => {
    try {
      // In a real app, fetch from database with proper auth
      const mockQuotes = [
        {
          id: 'QT001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          productName: 'ACC Cement',
          quantity: 100,
          estimatedPrice: 42500,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockQuotes);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch quotes' });
    }
  });

  // Admin bookings endpoint
  app.get('/api/admin/bookings', async (req, res) => {
    try {
      const mockBookings = [
        {
          id: 'BK001',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          serviceType: 'delivery',
          totalAmount: 15000,
          advancePayment: 1500,
          status: 'pending_payment',
          createdAt: new Date().toISOString()
        }
      ];
      res.json(mockBookings);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  // Marketing Materials routes
  app.get("/api/marketing-materials", requireAuth, async (req, res) => {
    try {
      const materials = await storage.getMarketingMaterials();
      res.json(materials);
    } catch (error) {
      console.error("Error fetching marketing materials:", error);
      res.status(500).json({ message: "Failed to fetch marketing materials" });
    }
  });

  app.post("/api/marketing-materials", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const validatedData = insertMarketingMaterialSchema.parse(req.body);
      const material = await storage.createMarketingMaterial({ ...validatedData, createdBy: (req as any).user.id });
      res.status(201).json(material);
    } catch (error) {
      console.error("Error creating marketing material:", error);
      res.status(400).json({ message: "Failed to create marketing material" });
    }
  });

  app.delete("/api/marketing-materials/:id", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const success = await storage.deleteMarketingMaterial(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Marketing material not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting marketing material:", error);
      res.status(500).json({ message: "Failed to delete marketing material" });
    }
  });

  // Contractors routes
  app.get("/api/contractors", requireAuth, async (req, res) => {
    try {
      const contractors = await storage.getContractors();
      res.json(contractors);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      res.status(500).json({ message: "Failed to fetch contractors" });
    }
  });

  app.post("/api/contractors", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const validatedData = insertContractorSchema.parse(req.body);
      const contractor = await storage.createContractor(validatedData);
      res.status(201).json(contractor);
    } catch (error) {
      console.error("Error creating contractor:", error);
      res.status(400).json({ message: "Failed to create contractor" });
    }
  });

  app.delete("/api/contractors/:id", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const success = await storage.deleteContractor(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contractor:", error);
      res.status(500).json({ message: "Failed to delete contractor" });
    }
  });

  // Orders and Advances routes
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/advances", requireAuth, async (req, res) => {
    try {
      const advances = await storage.getAdvances();
      res.json(advances);
    } catch (error) {
      console.error("Error fetching advances:", error);
      res.status(500).json({ message: "Failed to fetch advances" });
    }
  });

  // Pricing Rules routes
  app.get("/api/pricing-rules", requireAuth, async (req, res) => {
    try {
      const rules = await storage.getPricingRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching pricing rules:", error);
      res.status(500).json({ message: "Failed to fetch pricing rules" });
    }
  });

  app.post("/api/pricing-rules", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const validatedData = insertPricingRuleSchema.parse(req.body);
      const rule = await storage.createPricingRule({ ...validatedData, createdBy: (req as any).user.id });
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating pricing rule:", error);
      res.status(400).json({ message: "Failed to create pricing rule" });
    }
  });

  // Data Export routes
  app.get("/api/export/:type", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const { type } = req.params;
      const { startDate, endDate } = req.query;
      const data = await storage.getExportData(type, startDate as string, endDate as string);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.json"`);
      res.json(data);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Featured products management (admin only)
  app.patch("/api/products/:id/featured", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const { isFeatured } = req.body;
      const product = await storage.updateProduct(req.params.id, { isFeatured });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating featured status:", error);
      res.status(500).json({ message: "Failed to update featured status" });
    }
  });

  // User Profile Routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For demo purposes, using a mock user ID. In real app, get from authentication
      const userId = "mock-user-id";
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      // Remove password from response
      const { password, ...profileData } = profile;
      
      // Add calculated fields
      const profileWithStats = {
        ...profileData,
        memberSince: profile.createdAt,
        totalOrders: profile.totalOrders || 0,
        totalSpent: parseFloat(profile.totalSpent?.toString() || '0') || 0,
        loyaltyPoints: profile.loyaltyPoints || 0,
      };
      
      res.json(profileWithStats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/profile", async (req, res) => {
    try {
      // For demo purposes, using a mock user ID. In real app, get from authentication
      const userId = "mock-user-id";
      const profileData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { password, id, role, isActive, createdAt, updatedAt, ...updateData } = profileData;
      
      const updatedProfile = await storage.updateUserProfile(userId, updateData);
      if (!updatedProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      // Remove password from response
      const { password: pwd, ...profileResponse } = updatedProfile;
      res.json(profileResponse);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/orders", async (req, res) => {
    try {
      // For demo purposes, using a mock user ID. In real app, get from authentication
      const userId = "mock-user-id";
      const userOrders = await storage.getUserOrders(userId);
      res.json(userOrders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders/:id/reorder", async (req, res) => {
    try {
      // For demo purposes, using a mock user ID. In real app, get from authentication
      const userId = "mock-user-id";
      const orderId = req.params.id;
      
      const newOrder = await storage.reorderFromOrder(orderId, userId);
      res.json(newOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Material Trends API
  app.get("/api/material-trends", async (req, res) => {
    try {
      const { productId, region, timeRange } = req.query;
      // Mock data for now - replace with actual database query
      const trends = [
        {
          id: '1',
          productId: productId || 'default',
          price: 380 + Math.random() * 20,
          marketCondition: 'rising',
          region: region || 'national',
          recordDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      res.json(trends);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Material Comparisons API
  app.post("/api/material-comparisons", async (req, res) => {
    try {
      const comparisonData = req.body;
      // Mock saving - replace with actual database insert
      const saved = { id: 'comp-' + Date.now(), ...comparisonData, createdAt: new Date() };
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/material-comparisons", async (req, res) => {
    try {
      // Mock data - replace with actual database query
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Project Journey API
  app.get("/api/project-journeys", async (req, res) => {
    try {
      // Mock data for demonstration
      const projects = [
        {
          id: 'proj-1',
          userId: 'user-1',
          projectName: 'Dream Home Construction',
          projectType: 'residential',
          estimatedArea: 2500,
          currentPhase: 'structure',
          materialsOrdered: [],
          timeline: {},
          budget: 3500000,
          spentAmount: 1400000,
          completionPercentage: 45,
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/project-journeys", async (req, res) => {
    try {
      const projectData = req.body;
      const newProject = {
        id: 'proj-' + Date.now(),
        userId: 'user-1', // Replace with actual user ID from auth
        ...projectData,
        currentPhase: 'planning',
        spentAmount: 0,
        completionPercentage: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      res.json(newProject);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/project-journeys/:id", async (req, res) => {
    try {
      const updates = req.body;
      const updated = {
        id: req.params.id,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Material Sustainability API
  app.get("/api/material-sustainability", async (req, res) => {
    try {
      // Mock sustainability data
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Personalized Recommendations API
  app.get("/api/personalized-recommendations", async (req, res) => {
    try {
      // Mock recommendations
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/personalized-recommendations/generate", async (req, res) => {
    try {
      const context = req.body.context;
      // Mock AI recommendation generation
      const recommendations = {
        generated: true,
        context: context,
        timestamp: new Date().toISOString()
      };
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== 5 ADVANCED ANALYTICS FEATURES API ENDPOINTS =====

  // 1. Interactive Price Heat Map API
  app.get("/api/analytics/price-heat-map", async (req, res) => {
    try {
      const { materialType, region, timeRange } = req.query;
      
      // Mock comprehensive heat map data for all major materials and regions
      const heatMapData = [
        // Cement prices across India
        { materialType: 'cement', region: 'Maharashtra', state: 'Maharashtra', city: 'Mumbai', currentPrice: 420, priceChange: 2.5, marketDemand: 'high', supplyStatus: 'adequate', coordinates: { lat: 19.0760, lng: 72.8777 } },
        { materialType: 'cement', region: 'Delhi', state: 'Delhi', city: 'New Delhi', currentPrice: 410, priceChange: 1.8, marketDemand: 'high', supplyStatus: 'adequate', coordinates: { lat: 28.6139, lng: 77.2090 } },
        { materialType: 'cement', region: 'Karnataka', state: 'Karnataka', city: 'Bangalore', currentPrice: 390, priceChange: -0.5, marketDemand: 'medium', supplyStatus: 'surplus', coordinates: { lat: 12.9716, lng: 77.5946 } },
        { materialType: 'cement', region: 'Tamil Nadu', state: 'Tamil Nadu', city: 'Chennai', currentPrice: 385, priceChange: 3.2, marketDemand: 'high', supplyStatus: 'shortage', coordinates: { lat: 13.0827, lng: 80.2707 } },
        
        // Steel prices
        { materialType: 'steel', region: 'Maharashtra', state: 'Maharashtra', city: 'Mumbai', currentPrice: 65000, priceChange: 5.2, marketDemand: 'high', supplyStatus: 'adequate', coordinates: { lat: 19.0760, lng: 72.8777 } },
        { materialType: 'steel', region: 'West Bengal', state: 'West Bengal', city: 'Kolkata', currentPrice: 62000, priceChange: 4.8, marketDemand: 'medium', supplyStatus: 'adequate', coordinates: { lat: 22.5726, lng: 88.3639 } },
        { materialType: 'steel', region: 'Gujarat', state: 'Gujarat', city: 'Ahmedabad', currentPrice: 63500, priceChange: 3.7, marketDemand: 'high', supplyStatus: 'adequate', coordinates: { lat: 23.0225, lng: 72.5714 } },
        
        // Bricks prices
        { materialType: 'bricks', region: 'Uttar Pradesh', state: 'Uttar Pradesh', city: 'Lucknow', currentPrice: 8.5, priceChange: 1.2, marketDemand: 'medium', supplyStatus: 'adequate', coordinates: { lat: 26.8467, lng: 80.9462 } },
        { materialType: 'bricks', region: 'Punjab', state: 'Punjab', city: 'Chandigarh', currentPrice: 9.2, priceChange: 2.1, marketDemand: 'high', supplyStatus: 'shortage', coordinates: { lat: 30.7333, lng: 76.7794 } },
        
        // Metal (Aluminum) prices
        { materialType: 'metal', region: 'Maharashtra', state: 'Maharashtra', city: 'Mumbai', currentPrice: 185000, priceChange: 4.5, marketDemand: 'medium', supplyStatus: 'adequate', coordinates: { lat: 19.0760, lng: 72.8777 } },
        { materialType: 'metal', region: 'Kerala', state: 'Kerala', city: 'Kochi', currentPrice: 180000, priceChange: 6.2, marketDemand: 'high', supplyStatus: 'shortage', coordinates: { lat: 9.9312, lng: 76.2673 } },
      ];

      let filteredData = heatMapData;
      
      if (materialType && materialType !== 'all') {
        filteredData = filteredData.filter(item => item.materialType === materialType);
      }
      
      if (region && region !== 'all') {
        filteredData = filteredData.filter(item => item.region === region);
      }

      res.json({
        success: true,
        data: filteredData,
        summary: {
          totalRegions: [...new Set(filteredData.map(item => item.region))].length,
          averagePriceChange: filteredData.reduce((sum, item) => sum + item.priceChange, 0) / filteredData.length,
          highDemandRegions: filteredData.filter(item => item.marketDemand === 'high').length,
          shortageRegions: filteredData.filter(item => item.supplyStatus === 'shortage').length
        }
      });
    } catch (error: any) {
      console.error("Error fetching heat map data:", error);
      res.status(500).json({ message: "Failed to fetch heat map data" });
    }
  });

  // 2. Sustainability Comparison Wizard API
  app.post("/api/analytics/sustainability-comparison", async (req, res) => {
    try {
      const { productIds, projectType, priorities } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Product IDs array is required" });
      }

      // Mock sustainability comparison data
      const comparisonResults = productIds.map((productId: string, index: number) => ({
        productId,
        productName: `Product ${index + 1}`,
        sustainabilityScore: 75 + Math.random() * 20,
        carbonFootprint: 2.5 + Math.random() * 3,
        recyclabilityScore: 60 + Math.random() * 30,
        energyEfficiency: 70 + Math.random() * 25,
        localSourcing: Math.random() > 0.5,
        certifications: ['Green Building Certified', 'Energy Star'][Math.floor(Math.random() * 2)],
        environmentalImpact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        costPerUnit: 100 + Math.random() * 50,
        durabilityScore: 80 + Math.random() * 15,
        recommendations: [
          "Consider for eco-friendly projects",
          "Good balance of cost and sustainability", 
          "High recycling potential"
        ][Math.floor(Math.random() * 3)]
      }));

      const comparison = {
        comparisonId: `comp_${Date.now()}`,
        projectType: projectType || 'residential',
        results: comparisonResults,
        summary: {
          bestSustainabilityOption: comparisonResults.reduce((best, current) => 
            current.sustainabilityScore > best.sustainabilityScore ? current : best
          ),
          mostCostEffective: comparisonResults.reduce((best, current) => 
            current.costPerUnit < best.costPerUnit ? current : best
          ),
          averageCarbonFootprint: comparisonResults.reduce((sum, item) => sum + item.carbonFootprint, 0) / comparisonResults.length,
          totalSavings: Math.random() * 10000 + 5000
        },
        recommendations: [
          "Switch to locally sourced materials for 15% carbon reduction",
          "Consider bulk purchasing certified green materials",
          "Implement waste reduction strategies during construction"
        ]
      };

      res.json({ success: true, comparison });
    } catch (error: any) {
      console.error("Error creating sustainability comparison:", error);
      res.status(500).json({ message: "Failed to create sustainability comparison" });
    }
  });

  // 3. AI Personality Matcher API
  app.post("/api/analytics/ai-personality-matcher", async (req, res) => {
    try {
      const { answers, userId, projectType } = req.body;
      
      if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ message: "Personality assessment answers are required" });
      }

      // AI personality analysis based on answers
      const personalityTypes = ['analytical', 'creative', 'practical', 'environmentalist', 'budget_conscious'];
      const personalities = ['helpful', 'enthusiastic', 'analytical', 'friendly', 'professional'];
      
      const personalityType = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
      const aiPersonality = personalities[Math.floor(Math.random() * personalities.length)];
      
      const profile = {
        userId: userId || `user_${Date.now()}`,
        personalityType,
        aiPersonality,
        preferences: {
          prioritizesCost: answers.budget_importance > 7,
          prioritizesQuality: answers.quality_importance > 7,
          prioritizesSustainability: answers.sustainability_importance > 7,
          riskTolerance: answers.risk_tolerance || 'medium',
          communicationStyle: answers.communication_style || 'professional',
          projectComplexity: answers.project_complexity || 'medium'
        },
        recommendations: [],
        matchScore: 85 + Math.random() * 10,
        strengths: [],
        improvements: []
      };

      // Generate personality-specific recommendations
      switch (personalityType) {
        case 'analytical':
          profile.recommendations = [
            "Focus on detailed specifications and technical data",
            "Compare multiple suppliers with comprehensive analysis", 
            "Request detailed material testing reports"
          ];
          profile.strengths = ['Data-driven decisions', 'Risk assessment', 'Quality focus'];
          break;
        case 'creative':
          profile.recommendations = [
            "Explore innovative material combinations",
            "Consider unique design possibilities",
            "Look for materials with aesthetic appeal"
          ];
          profile.strengths = ['Innovation', 'Design thinking', 'Flexibility'];
          break;
        case 'practical':
          profile.recommendations = [
            "Focus on proven, reliable materials",
            "Prioritize ease of installation and maintenance",
            "Choose materials with good availability"
          ];
          profile.strengths = ['Efficiency', 'Reliability', 'Cost-effectiveness'];
          break;
        case 'environmentalist':
          profile.recommendations = [
            "Select certified sustainable materials",
            "Prioritize local sourcing to reduce carbon footprint",
            "Consider recyclable and biodegradable options"
          ];
          profile.strengths = ['Environmental consciousness', 'Long-term thinking', 'Social responsibility'];
          break;
        case 'budget_conscious':
          profile.recommendations = [
            "Compare prices across multiple suppliers",
            "Look for bulk discount opportunities", 
            "Consider alternative materials with similar properties"
          ];
          profile.strengths = ['Cost optimization', 'Value seeking', 'Resource efficiency'];
          break;
      }

      res.json({ 
        success: true, 
        profile,
        aiResponse: `Hi! I'm your ${aiPersonality} AI assistant. Based on your ${personalityType} personality type, I've customized my recommendations to match your decision-making style. Let's build something amazing together!`
      });
    } catch (error: any) {
      console.error("Error creating AI personality profile:", error);
      res.status(500).json({ message: "Failed to create AI personality profile" });
    }
  });

  // 4. Vendor Performance Storytelling Dashboard API
  app.get("/api/analytics/vendor-performance/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { timeRange } = req.query;
      
      // Mock comprehensive vendor performance data
      const performanceData = {
        vendorId,
        vendorName: `Vendor ${vendorId.slice(-4)}`,
        performanceGrade: ['A+', 'A', 'B+', 'B', 'C+'][Math.floor(Math.random() * 5)],
        totalSales: 150000 + Math.random() * 100000,
        averageRating: 4.2 + Math.random() * 0.6,
        totalOrders: 250 + Math.floor(Math.random() * 100),
        onTimeDeliveries: 210 + Math.floor(Math.random() * 40),
        totalDeliveries: 245 + Math.floor(Math.random() * 15),
        customerSatisfactionScore: 4.3 + Math.random() * 0.5,
        responsiveTime: 2.5 + Math.random() * 2, // hours
        qualityScore: 85 + Math.random() * 10,
        
        monthlyPerformance: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          sales: 10000 + Math.random() * 15000,
          orders: 15 + Math.floor(Math.random() * 25),
          rating: 4.0 + Math.random() * 0.8,
          onTimeDelivery: 85 + Math.random() * 10
        })),
        
        strengths: [
          'Excellent product quality',
          'Fast response time',
          'Competitive pricing',
          'Reliable delivery',
          'Good customer service'
        ].slice(0, 3 + Math.floor(Math.random() * 3)),
        
        improvementAreas: [
          'Inventory management',
          'Communication clarity',
          'Packaging quality',
          'Documentation accuracy',
          'Order processing speed'
        ].slice(0, 2 + Math.floor(Math.random() * 2)),
        
        customerFeedback: [
          { comment: "Great quality products and fast delivery!", rating: 5, date: '2024-01-15' },
          { comment: "Good service but could improve packaging", rating: 4, date: '2024-01-10' },
          { comment: "Very reliable vendor, always on time", rating: 5, date: '2024-01-08' }
        ],
        
        recentAchievements: [
          'Achieved 95% on-time delivery rate',
          'Customer satisfaction improved by 15%',
          'Reduced response time by 30%',
          'Expanded product catalog by 25%'
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
        
        trends: {
          salesTrend: Math.random() > 0.5 ? 'increasing' : 'stable',
          ratingTrend: Math.random() > 0.3 ? 'improving' : 'stable',
          deliveryTrend: Math.random() > 0.4 ? 'improving' : 'stable'
        },
        
        competitiveAnalysis: {
          marketPosition: Math.floor(Math.random() * 10) + 1,
          strengthsVsCompetitors: ['Price competitiveness', 'Product quality', 'Customer service'],
          marketShare: 5 + Math.random() * 15
        }
      };

      // Calculate derived metrics
      performanceData.onTimeDeliveryRate = (performanceData.onTimeDeliveries / performanceData.totalDeliveries * 100);
      performanceData.orderGrowthRate = Math.random() * 20 + 5; // 5-25% growth
      performanceData.averageOrderValue = performanceData.totalSales / performanceData.totalOrders;

      res.json({ success: true, data: performanceData });
    } catch (error: any) {
      console.error("Error fetching vendor performance data:", error);
      res.status(500).json({ message: "Failed to fetch vendor performance data" });
    }
  });

  // Get all vendors for performance comparison
  app.get("/api/analytics/vendor-performance", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      const performanceData = vendors.map((vendor: any) => ({
        vendorId: vendor.id,
        vendorName: vendor.username,
        performanceGrade: ['A+', 'A', 'B+', 'B', 'C+'][Math.floor(Math.random() * 5)],
        totalSales: 50000 + Math.random() * 200000,
        averageRating: 3.5 + Math.random() * 1.5,
        totalOrders: 50 + Math.floor(Math.random() * 200),
        onTimeDeliveryRate: 75 + Math.random() * 20,
        customerSatisfactionScore: 3.8 + Math.random() * 1.2
      }));

      res.json({ success: true, data: performanceData });
    } catch (error: any) {
      console.error("Error fetching vendor performance data:", error);
      res.status(500).json({ message: "Failed to fetch vendor performance data" });
    }
  });

  // 5. Playful Project Journey Animator API
  app.post("/api/analytics/project-journey", async (req, res) => {
    try {
      const { projectName, projectType, area, floors, budget } = req.body;
      
      if (!projectName || !projectType || !area) {
        return res.status(400).json({ message: "Project name, type, and area are required" });
      }

      const projectId = `proj_${Date.now()}`;
      
      // Calculate project phases and timeline based on inputs
      const phases = [
        { 
          id: 'planning', 
          name: 'Planning & Design', 
          duration: Math.ceil(area / 1000 * 2), // 2 weeks per 1000 sq ft
          materials: ['Blueprint paper', 'Design software', 'Survey equipment'],
          cost: budget * 0.05,
          status: 'completed'
        },
        { 
          id: 'foundation', 
          name: 'Foundation Work', 
          duration: Math.ceil(area / 500 * 2), // 2 weeks per 500 sq ft  
          materials: ['Cement', 'Steel', 'Sand', 'Gravel'],
          cost: budget * 0.25,
          status: 'in_progress'
        },
        { 
          id: 'structure', 
          name: 'Structure Building', 
          duration: Math.ceil(area / 300 * 3) * (floors || 1), // 3 weeks per 300 sq ft per floor
          materials: ['Steel', 'Cement', 'Bricks', 'Concrete blocks'],
          cost: budget * 0.35,
          status: 'pending'
        },
        { 
          id: 'roofing', 
          name: 'Roofing', 
          duration: Math.ceil(area / 800 * 1), // 1 week per 800 sq ft
          materials: ['Roofing tiles', 'Metal sheets', 'Insulation'],
          cost: budget * 0.15,
          status: 'pending'
        },
        { 
          id: 'finishing', 
          name: 'Finishing Work', 
          duration: Math.ceil(area / 400 * 4), // 4 weeks per 400 sq ft
          materials: ['Paint', 'Tiles', 'Fixtures', 'Electrical components'],
          cost: budget * 0.20,
          status: 'pending'
        }
      ];

      const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
      const completionPercentage = Math.floor(Math.random() * 30) + 15; // 15-45% completed

      const journeyData = {
        projectId,
        projectName,
        projectType,
        area,
        floors: floors || 1,
        budget,
        phases,
        timeline: {
          totalDuration: `${totalDuration} weeks`,
          startDate: new Date().toISOString(),
          expectedCompletion: new Date(Date.now() + totalDuration * 7 * 24 * 60 * 60 * 1000).toISOString(),
          currentPhase: 'foundation',
          completionPercentage
        },
        milestones: [
          { name: 'Foundation Complete', date: new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
          { name: 'Structure 50% Complete', date: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
          { name: 'Roofing Complete', date: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
          { name: 'Project Handover', date: new Date(Date.now() + totalDuration * 7 * 24 * 60 * 60 * 1000).toISOString(), achieved: false }
        ],
        materialRequirements: {
          cement: `${Math.ceil(area / 100 * 15)} bags`,
          steel: `${Math.ceil(area / 100 * 8)} tons`,
          bricks: `${Math.ceil(area / 100 * 500)} pieces`,
          sand: `${Math.ceil(area / 100 * 3)} cubic meters`
        },
        challenges: [
          'Weather delays during monsoon',
          'Material price fluctuations',
          'Labor availability',
          'Quality control checkpoints'
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
        recommendations: [
          'Order materials in bulk for cost savings',
          'Schedule regular quality inspections',
          'Maintain buffer stock for critical materials',
          'Plan for weather contingencies'
        ],
        funFacts: [
          `Your project will use approximately ${Math.ceil(area / 100 * 2)} truckloads of materials`,
          `The steel used could build ${Math.floor(Math.ceil(area / 100 * 8) / 2)} small cars`,
          `Cement usage equivalent to ${Math.ceil(area / 100 * 15 / 50)} elephant weights`,
          `Total material weight: ${Math.ceil(area / 100 * 25)} tons`
        ]
      };

      res.json({ success: true, journey: journeyData });
    } catch (error: any) {
      console.error("Error creating project journey:", error);
      res.status(500).json({ message: "Failed to create project journey" });
    }
  });

  // Get existing project journeys
  app.get("/api/analytics/project-journeys", async (req, res) => {
    try {
      const { userId } = req.query;
      
      // Mock existing projects for the user
      const projects = [
        {
          projectId: 'proj_1',
          projectName: 'Dream Home Villa',
          projectType: 'residential',
          area: 2500,
          completionPercentage: 65,
          currentPhase: 'finishing',
          estimatedCompletion: '2024-06-15'
        },
        {
          projectId: 'proj_2', 
          projectName: 'Office Complex',
          projectType: 'commercial',
          area: 5000,
          completionPercentage: 25,
          currentPhase: 'structure',
          estimatedCompletion: '2024-12-20'
        }
      ];

      res.json({ success: true, projects });
    } catch (error: any) {
      console.error("Error fetching project journeys:", error);
      res.status(500).json({ message: "Failed to fetch project journeys" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
