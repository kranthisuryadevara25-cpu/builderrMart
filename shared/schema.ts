import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, numeric, jsonb, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("vendor"), // owner_admin, vendor_manager, vendor
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  parentId: uuid("parent_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  description: text("description"),
  specs: jsonb("specs"), // { "grade": "43", "size": "10mm" }
  basePrice: numeric("base_price").notNull(),
  quantitySlabs: jsonb("quantity_slabs"), // [{"min_qty": 1, "max_qty": 10, "price_per_unit": 10}]
  dynamicCharges: jsonb("dynamic_charges"), // {"hamali": {"rate": 2, "unit": "bag", "description": "Loading fee"}}
  bulkDiscountSlabs: jsonb("bulk_discount_slabs"), // [{"min_qty": 100, "discount_percent": 5}]
  deliveryDiscountSlabs: jsonb("delivery_discount_slabs"), // [{"location": "local", "discount_percent": 2}]
  brand: text("brand"),
  company: text("company"),
  gstRate: numeric("gst_rate").default(sql`18`), // GST percentage
  imageUrl: text("image_url"),
  vendorId: uuid("vendor_id").notNull().references(() => users.id),
  stockQuantity: integer("stock_quantity").default(0),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Discounts table
export const discounts = pgTable("discounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed_amount, buy_x_get_y
  discountValue: numeric("discount_value").notNull(),
  minOrderAmount: numeric("min_order_amount").default(sql`0`),
  maxDiscountAmount: numeric("max_discount_amount"),
  applicableProducts: jsonb("applicable_products"), // Product IDs array or "all"
  applicableCategories: jsonb("applicable_categories"), // Category IDs array or "all"
  validFrom: timestamp("valid_from").default(sql`now()`),
  validUntil: timestamp("valid_until"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Quotes table  
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: text("quote_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  projectType: text("project_type"), // residential, commercial, industrial
  projectLocation: text("project_location"),
  requirements: jsonb("requirements"), // Detailed project requirements
  items: jsonb("items"), // Quote items with quantities and prices
  subtotal: numeric("subtotal").notNull(),
  taxAmount: numeric("tax_amount").default(sql`0`),
  discountAmount: numeric("discount_amount").default(sql`0`),
  totalAmount: numeric("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, expired
  validUntil: timestamp("valid_until"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingNumber: text("booking_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  serviceType: text("service_type").notNull(), // delivery, installation, consultation
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time"), // time slot
  location: text("location").notNull(),
  requirements: jsonb("requirements"), // Service-specific requirements
  estimatedDuration: integer("estimated_duration"), // in minutes
  cost: numeric("cost"),
  status: text("status").notNull().default("pending"), // pending, confirmed, in_progress, completed, cancelled
  notes: text("notes"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountSchema = createInsertSchema(discounts).omit({
  id: true,
  usageCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  quoteNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingNumber: true,
  createdAt: true,
  updatedAt: true,
});

// Update schemas
export const updateUserSchema = insertUserSchema.partial();
export const updateCategorySchema = insertCategorySchema.partial();
export const updateProductSchema = insertProductSchema.partial();
export const updateDiscountSchema = insertDiscountSchema.partial();
export const updateQuoteSchema = insertQuoteSchema.partial();
export const updateBookingSchema = insertBookingSchema.partial();

// Loyalty/Rewards tables
export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  pointsPerRupee: numeric("points_per_rupee").default(sql`1`), // How many points per rupee spent
  redemptionRate: numeric("redemption_rate").default(sql`1`), // How many rupees per point
  minimumRedemptionPoints: integer("minimum_redemption_points").default(100),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const customerLoyalty = pgTable("customer_loyalty", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerEmail: text("customer_email").notNull(),
  programId: uuid("program_id").references(() => loyaltyPrograms.id),
  totalPoints: integer("total_points").default(0),
  availablePoints: integer("available_points").default(0),
  totalSpent: numeric("total_spent").default(sql`0`),
  tier: text("tier").default("bronze"), // bronze, silver, gold, platinum
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const rewardRedemptions = pgTable("reward_redemptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerEmail: text("customer_email").notNull(),
  pointsRedeemed: integer("points_redeemed").notNull(),
  rewardAmount: numeric("reward_amount").notNull(),
  orderReference: text("order_reference"),
  status: text("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type UpdateDiscount = z.infer<typeof updateDiscountSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type UpdateQuote = z.infer<typeof updateQuoteSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;

export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type CustomerLoyalty = typeof customerLoyalty.$inferSelect;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerLoyaltySchema = createInsertSchema(customerLoyalty).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardRedemptionSchema = createInsertSchema(rewardRedemptions).omit({
  id: true,
  createdAt: true,
});
