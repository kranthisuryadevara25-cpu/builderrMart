import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { users, categories, products, discounts, quotes, bookings, type User, type InsertUser, type UpdateUser, type Category, type InsertCategory, type UpdateCategory, type Product, type InsertProduct, type UpdateProduct, type Discount, type InsertDiscount, type UpdateDiscount, type Quote, type InsertQuote, type UpdateQuote, type Booking, type InsertBooking, type UpdateBooking } from "@shared/schema";

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
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Product methods
  getProducts(vendorId?: string, categoryId?: string, search?: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getTrendingProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProductsByVendor(vendorId: string): Promise<Product[]>;

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

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
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
    )).orderBy(desc(products.createdAt));
  }

  async getTrendingProducts(): Promise<Product[]> {
    return await db.select().from(products).where(and(
      eq(products.isTrending, true),
      eq(products.isActive, true)
    )).orderBy(desc(products.createdAt));
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
}

export const storage = new DatabaseStorage();
