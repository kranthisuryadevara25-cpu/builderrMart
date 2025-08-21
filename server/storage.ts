import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, ilike, or, gte, lte } from "drizzle-orm";
import { 
  users, categories, products, discounts, quotes, bookings, marketingMaterials, contractors, advances, orders, pricingRules,
  type User, type InsertUser, type UpdateUser, 
  type Category, type InsertCategory, type UpdateCategory, 
  type Product, type InsertProduct, type UpdateProduct, 
  type Discount, type InsertDiscount, type UpdateDiscount, 
  type Quote, type InsertQuote, type UpdateQuote, 
  type Booking, type InsertBooking, type UpdateBooking,
  type MarketingMaterial, type InsertMarketingMaterial,
  type Contractor, type InsertContractor,
  type Advance, type InsertAdvance,
  type Order, type InsertOrder,
  type PricingRule, type InsertPricingRule
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: UpdateUser): Promise<User | undefined>;
  updateUserStatus(id: string, isActive: boolean): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsersForExport(): Promise<User[]>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  bulkCreateCategories(csvData: any[]): Promise<{ count: number; data: Category[] }>;

  // Product methods
  getProducts(vendorId?: string, categoryId?: string, search?: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getTrendingProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: UpdateProduct): Promise<Product | undefined>;
  updateProductFeatured(id: string, isFeatured: boolean): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProductsByVendor(vendorId: string): Promise<Product[]>;
  getProductsForExport(): Promise<Product[]>;
  bulkCreateProducts(csvData: any[]): Promise<{ count: number; data: Product[] }>;

  // Discount methods
  getDiscounts(): Promise<Discount[]>;
  getDiscount(id: string): Promise<Discount | undefined>;
  getDiscountByCode(code: string): Promise<Discount | undefined>;
  createDiscount(discount: InsertDiscount): Promise<Discount>;
  updateDiscount(id: string, discount: UpdateDiscount): Promise<Discount | undefined>;
  deleteDiscount(id: string): Promise<boolean>;

  // Quote methods
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, quote: UpdateQuote): Promise<Quote | undefined>;
  deleteQuote(id: string): Promise<boolean>;

  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: UpdateBooking): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;

  // Marketing Materials
  getMarketingMaterials(): Promise<MarketingMaterial[]>;
  getMarketingMaterial(id: string): Promise<MarketingMaterial | undefined>;
  createMarketingMaterial(material: InsertMarketingMaterial): Promise<MarketingMaterial>;
  updateMarketingMaterial(id: string, material: Partial<InsertMarketingMaterial>): Promise<MarketingMaterial>;
  deleteMarketingMaterial(id: string): Promise<boolean>;
  getMarketingMaterialsForExport(): Promise<MarketingMaterial[]>;
  bulkCreateMarketingMaterials(csvData: any[]): Promise<{ count: number; data: MarketingMaterial[] }>;
  
  // Contractors
  getContractors(): Promise<Contractor[]>;
  getContractor(id: string): Promise<Contractor | undefined>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractor(id: string, contractor: Partial<InsertContractor>): Promise<Contractor>;
  deleteContractor(id: string): Promise<boolean>;
  getContractorsForExport(): Promise<Contractor[]>;
  bulkCreateContractors(csvData: any[]): Promise<{ count: number; data: Contractor[] }>;
  
  // Advances
  getAdvances(): Promise<Advance[]>;
  getAdvance(id: string): Promise<Advance | undefined>;
  createAdvance(advance: InsertAdvance): Promise<Advance>;
  updateAdvance(id: string, advance: Partial<InsertAdvance>): Promise<Advance>;
  deleteAdvance(id: string): Promise<boolean>;
  getAdvancesForExport(startDate?: string, endDate?: string): Promise<Advance[]>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;
  getOrdersForExport(startDate?: string, endDate?: string): Promise<Order[]>;
  
  // User Profile
  getUserProfile(id: string): Promise<User | undefined>;
  updateUserProfile(id: string, profileData: Partial<User>): Promise<User | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  reorderFromOrder(orderId: string, userId: string): Promise<Order>;
  
  // Pricing Rules
  getPricingRules(): Promise<PricingRule[]>;
  getPricingRule(id: string): Promise<PricingRule | undefined>;
  createPricingRule(rule: InsertPricingRule): Promise<PricingRule>;
  updatePricingRule(id: string, rule: Partial<InsertPricingRule>): Promise<PricingRule>;
  deletePricingRule(id: string): Promise<boolean>;
  
  // Data Export Functions
  getExportData(type: string, startDate?: string, endDate?: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: UpdateUser): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
    const result = await db.update(users).set({ isActive }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getUsersForExport(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // User profile operations
  async getUserProfile(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(profileData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.createdBy, userId)).orderBy(desc(orders.createdAt));
  }

  async reorderFromOrder(orderId: string, userId: string): Promise<Order> {
    // Get the original order
    const originalOrder = await this.getOrder(orderId);
    if (!originalOrder) {
      throw new Error('Original order not found');
    }

    // Create a new order with the same items
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
    const newOrderData = {
      orderNumber,
      customerName: originalOrder.customerName,
      customerEmail: originalOrder.customerEmail,
      customerPhone: originalOrder.customerPhone,
      customerAddress: originalOrder.customerAddress,
      items: originalOrder.items,
      subtotal: originalOrder.subtotal,
      transportationCharges: originalOrder.transportationCharges,
      hamaliCharges: originalOrder.hamaliCharges,
      otherCharges: originalOrder.otherCharges,
      taxAmount: originalOrder.taxAmount,
      discountAmount: originalOrder.discountAmount,
      totalAmount: originalOrder.totalAmount,
      paidAmount: '0',
      balanceAmount: originalOrder.totalAmount,
      status: 'pending',
      deliveryAddress: originalOrder.deliveryAddress,
      specialInstructions: 'Repeat order from order #' + originalOrder.orderNumber,
      createdBy: userId,
    };

    const result = await db.insert(orders).values(newOrderData).returning();
    return result[0];
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(desc(categories.createdAt));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: UpdateCategory): Promise<Category | undefined> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Product methods
  async getProducts(vendorId?: string, categoryId?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));

    const conditions = [eq(products.isActive, true)];

    if (vendorId) {
      conditions.push(eq(products.vendorId, vendorId));
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )!
      );
    }

    return await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: UpdateProduct): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async updateProductFeatured(id: string, isFeatured: boolean): Promise<Product | undefined> {
    const result = await db.update(products).set({ isFeatured }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async getProductsForExport(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async bulkCreateProducts(csvData: any[]): Promise<{ count: number; data: Product[] }> {
    const products = await db.insert(products).values(csvData).returning();
    return { count: products.length, data: products };
  }

  async bulkCreateCategories(csvData: any[]): Promise<{ count: number; data: Category[] }> {
    const categories = await db.insert(categories).values(csvData).returning();
    return { count: categories.length, data: categories };
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return await db.select().from(products).where(and(eq(products.vendorId, vendorId), eq(products.isActive, true))).orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(and(
      eq(products.isFeatured, true),
      eq(products.isActive, true)
    )).orderBy(desc(products.createdAt)).limit(6);
  }

  async getTrendingProducts(): Promise<Product[]> {
    return await db.select().from(products).where(and(
      eq(products.isTrending, true),
      eq(products.isActive, true)
    )).orderBy(desc(products.createdAt)).limit(6);
  }

  // Discount methods
  async getDiscounts(): Promise<Discount[]> {
    return await db.select().from(discounts).where(eq(discounts.isActive, true)).orderBy(desc(discounts.createdAt));
  }

  async getDiscount(id: string): Promise<Discount | undefined> {
    const result = await db.select().from(discounts).where(eq(discounts.id, id)).limit(1);
    return result[0];
  }

  async getDiscountByCode(code: string): Promise<Discount | undefined> {
    const result = await db.select().from(discounts).where(eq(discounts.code, code)).limit(1);
    return result[0];
  }

  async createDiscount(discount: InsertDiscount): Promise<Discount> {
    const result = await db.insert(discounts).values(discount).returning();
    return result[0];
  }

  async updateDiscount(id: string, discount: UpdateDiscount): Promise<Discount | undefined> {
    const result = await db.update(discounts).set(discount).where(eq(discounts.id, id)).returning();
    return result[0];
  }

  async deleteDiscount(id: string): Promise<boolean> {
    const result = await db.delete(discounts).where(eq(discounts.id, id));
    return result.rowCount > 0;
  }

  // Quote methods  
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    return result[0];
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const quoteNumber = `QT${Date.now().toString().slice(-8)}`;
    const result = await db.insert(quotes).values({ ...quote, quoteNumber }).returning();
    return result[0];
  }

  async updateQuote(id: string, quote: UpdateQuote): Promise<Quote | undefined> {
    const result = await db.update(quotes).set(quote).where(eq(quotes.id, id)).returning();
    return result[0];
  }

  async deleteQuote(id: string): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return result.rowCount > 0;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result[0];
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const bookingNumber = `BK${Date.now().toString().slice(-8)}`;
    const result = await db.insert(bookings).values({ ...booking, bookingNumber }).returning();
    return result[0];
  }

  async updateBooking(id: string, booking: UpdateBooking): Promise<Booking | undefined> {
    const result = await db.update(bookings).set(booking).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount > 0;
  }

  // Marketing Materials Implementation
  async getMarketingMaterials(): Promise<MarketingMaterial[]> {
    return await db.select().from(marketingMaterials).orderBy(desc(marketingMaterials.createdAt));
  }
  
  async getMarketingMaterial(id: string): Promise<MarketingMaterial | undefined> {
    const result = await db.select().from(marketingMaterials).where(eq(marketingMaterials.id, id)).limit(1);
    return result[0];
  }
  
  async createMarketingMaterial(material: InsertMarketingMaterial): Promise<MarketingMaterial> {
    const result = await db.insert(marketingMaterials).values(material).returning();
    return result[0];
  }
  
  async updateMarketingMaterial(id: string, material: Partial<InsertMarketingMaterial>): Promise<MarketingMaterial> {
    const result = await db
      .update(marketingMaterials)
      .set(material)
      .where(eq(marketingMaterials.id, id))
      .returning();
    return result[0];
  }
  
  async deleteMarketingMaterial(id: string): Promise<boolean> {
    const result = await db.delete(marketingMaterials).where(eq(marketingMaterials.id, id));
    return result.rowCount > 0;
  }
  
  // Contractors Implementation
  async getContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors).orderBy(desc(contractors.createdAt));
  }
  
  async getContractor(id: string): Promise<Contractor | undefined> {
    const result = await db.select().from(contractors).where(eq(contractors.id, id)).limit(1);
    return result[0];
  }
  
  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const result = await db.insert(contractors).values(contractor).returning();
    return result[0];
  }
  
  async updateContractor(id: string, contractor: Partial<InsertContractor>): Promise<Contractor> {
    const result = await db
      .update(contractors)
      .set(contractor)
      .where(eq(contractors.id, id))
      .returning();
    return result[0];
  }
  
  async deleteContractor(id: string): Promise<boolean> {
    const result = await db.delete(contractors).where(eq(contractors.id, id));
    return result.rowCount > 0;
  }
  
  // Advances Implementation
  async getAdvances(): Promise<Advance[]> {
    return await db.select().from(advances).orderBy(desc(advances.createdAt));
  }
  
  async getAdvance(id: string): Promise<Advance | undefined> {
    const result = await db.select().from(advances).where(eq(advances.id, id)).limit(1);
    return result[0];
  }
  
  async createAdvance(advance: InsertAdvance): Promise<Advance> {
    const advanceNumber = `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const result = await db.insert(advances).values({ ...advance, advanceNumber }).returning();
    return result[0];
  }
  
  async updateAdvance(id: string, advance: Partial<InsertAdvance>): Promise<Advance> {
    const result = await db
      .update(advances)
      .set(advance)
      .where(eq(advances.id, id))
      .returning();
    return result[0];
  }
  
  async deleteAdvance(id: string): Promise<boolean> {
    const result = await db.delete(advances).where(eq(advances.id, id));
    return result.rowCount > 0;
  }
  
  // Orders Implementation
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const result = await db.insert(orders).values({ ...order, orderNumber }).returning();
    return result[0];
  }
  
  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const result = await db
      .update(orders)
      .set(order)
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }
  
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.rowCount > 0;
  }

  // Export methods for comprehensive admin
  async getOrdersForExport(startDate?: string, endDate?: string): Promise<Order[]> {
    let query = db.select().from(orders);
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(orders.createdAt, new Date(startDate)),
          lte(orders.createdAt, new Date(endDate))
        )
      );
    }
    
    return await query.orderBy(desc(orders.createdAt));
  }

  async getAdvancesForExport(startDate?: string, endDate?: string): Promise<Advance[]> {
    let query = db.select().from(advances);
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(advances.createdAt, new Date(startDate)),
          lte(advances.createdAt, new Date(endDate))
        )
      );
    }
    
    return await query.orderBy(desc(advances.createdAt));
  }

  async getMarketingMaterialsForExport(): Promise<MarketingMaterial[]> {
    return await db.select().from(marketingMaterials).orderBy(desc(marketingMaterials.createdAt));
  }

  async getContractorsForExport(): Promise<Contractor[]> {
    return await db.select().from(contractors).orderBy(desc(contractors.createdAt));
  }

  // Bulk create methods for CSV upload
  async bulkCreateMarketingMaterials(csvData: any[]): Promise<{ count: number; data: MarketingMaterial[] }> {
    const materials = await db.insert(marketingMaterials).values(csvData).returning();
    return { count: materials.length, data: materials };
  }

  async bulkCreateContractors(csvData: any[]): Promise<{ count: number; data: Contractor[] }> {
    const contractorsList = await db.insert(contractors).values(csvData).returning();
    return { count: contractorsList.length, data: contractorsList };
  }
  
  // Pricing Rules Implementation
  async getPricingRules(): Promise<PricingRule[]> {
    return await db.select().from(pricingRules).orderBy(desc(pricingRules.createdAt));
  }
  
  async getPricingRule(id: string): Promise<PricingRule | undefined> {
    const result = await db.select().from(pricingRules).where(eq(pricingRules.id, id)).limit(1);
    return result[0];
  }
  
  async createPricingRule(rule: InsertPricingRule): Promise<PricingRule> {
    const result = await db.insert(pricingRules).values(rule).returning();
    return result[0];
  }
  
  async updatePricingRule(id: string, rule: Partial<InsertPricingRule>): Promise<PricingRule> {
    const result = await db
      .update(pricingRules)
      .set(rule)
      .where(eq(pricingRules.id, id))
      .returning();
    return result[0];
  }
  
  async deletePricingRule(id: string): Promise<boolean> {
    const result = await db.delete(pricingRules).where(eq(pricingRules.id, id));
    return result.rowCount > 0;
  }
  
  // Data Export Implementation
  async getExportData(type: string, startDate?: string, endDate?: string): Promise<any[]> {
    let query;
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    
    switch (type) {
      case 'orders':
        query = db.select().from(orders).where(and(
          gte(orders.createdAt, start),
          lte(orders.createdAt, end)
        ));
        break;
      case 'advances':
        query = db.select().from(advances).where(and(
          gte(advances.createdAt, start),
          lte(advances.createdAt, end)
        ));
        break;
      case 'quotes':
        query = db.select().from(quotes).where(and(
          gte(quotes.createdAt, start),
          lte(quotes.createdAt, end)
        ));
        break;
      case 'contractors':
        query = db.select().from(contractors).where(and(
          gte(contractors.createdAt, start),
          lte(contractors.createdAt, end)
        ));
        break;
      case 'users':
        query = db.select().from(users).where(and(
          gte(users.createdAt, start),
          lte(users.createdAt, end)
        ));
        break;
      default:
        return [];
    }
    
    return await query;
  }
}


export const storage = new DatabaseStorage();
