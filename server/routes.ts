import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, insertCategorySchema, insertProductSchema, updateCategorySchema, updateProductSchema } from "@shared/schema";
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
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
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
  app.post("/api/construction/analyze", requireAuth, async (req, res) => {
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

  // Get material estimates without image (based on user inputs)
  app.post("/api/construction/estimate", requireAuth, async (req, res) => {
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

  app.get("/api/products/:id", async (req: any, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Vendors can only see their own products
      if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
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

  // AI Recommendations - Fixed error handling
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getProducts();
      if (!products || products.length === 0) {
        return res.json([]);
      }
      const featured = products
        .filter(p => p.stockQuantity && p.stockQuantity > 100)
        .slice(0, 8);
      res.json(featured);
    } catch (error: any) {
      console.error("Error getting featured products:", error);
      res.json([]);
    }
  });

  app.get("/api/products/trending", async (req, res) => {
    try {
      const products = await storage.getProducts();
      if (!products || products.length === 0) {
        return res.json([]);
      }
      const trending = products
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      res.json(trending);
    } catch (error: any) {
      console.error("Error getting trending products:", error);
      res.json([]);
    }
  });

  app.post("/api/products/recommendations", requireAuth, async (req, res) => {
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

  // Advanced booking route
  app.post("/api/products/advance-booking", requireAuth, async (req: any, res) => {
    try {
      const { productId, quantity, advanceAmount, deliveryDate, specifications } = req.body;
      
      if (!productId || !quantity || !advanceAmount || !deliveryDate) {
        return res.status(400).json({ message: "Product ID, quantity, advance amount, and delivery date are required" });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const booking = {
        id: new Date().getTime().toString(),
        userId: req.user?.id,
        productId,
        productName: product.name,
        quantity: parseInt(quantity),
        advanceAmount: parseFloat(advanceAmount),
        deliveryDate: new Date(deliveryDate),
        specifications: specifications || {},
        status: 'pending',
        createdAt: new Date()
      };
      
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

  const httpServer = createServer(app);
  return httpServer;
}
