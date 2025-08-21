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

// Marketing Materials Management
export const marketingMaterials = pgTable("marketing_materials", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // banner, brochure, flyer, video, email_template
  content: jsonb("content"), // Material content/config
  targetAudience: text("target_audience"), // contractors, homeowners, architects
  status: text("status").default("draft"), // draft, active, inactive
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Contractors Management
export const contractors = pgTable("contractors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  licenseNumber: text("license_number"),
  specialization: jsonb("specialization"), // areas of expertise
  experienceYears: integer("experience_years"),
  rating: numeric("rating").default(sql`0`),
  totalProjects: integer("total_projects").default(0),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  documents: jsonb("documents"), // license, certificates
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Advance Payments
export const advances = pgTable("advances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  advanceNumber: text("advance_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  orderReference: text("order_reference"),
  quoteReference: text("quote_reference"),
  advanceAmount: numeric("advance_amount").notNull(),
  totalOrderAmount: numeric("total_order_amount").notNull(),
  advancePercentage: numeric("advance_percentage").notNull(),
  paymentMethod: text("payment_method"), // upi, card, bank_transfer, cash
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed, refunded
  paymentDate: timestamp("payment_date"),
  balanceAmount: numeric("balance_amount").notNull(),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Orders Management 
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  quoteId: uuid("quote_id").references(() => quotes.id),
  advanceId: uuid("advance_id").references(() => advances.id),
  items: jsonb("items").notNull(), // Order items with quantities and prices
  subtotal: numeric("subtotal").notNull(),
  transportationCharges: numeric("transportation_charges").default(sql`0`),
  hamaliCharges: numeric("hamali_charges").default(sql`0`),
  otherCharges: numeric("other_charges").default(sql`0`),
  taxAmount: numeric("tax_amount").default(sql`0`),
  discountAmount: numeric("discount_amount").default(sql`0`),
  totalAmount: numeric("total_amount").notNull(),
  paidAmount: numeric("paid_amount").default(sql`0`),
  balanceAmount: numeric("balance_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled
  deliveryDate: timestamp("delivery_date"),
  deliveryAddress: text("delivery_address"),
  specialInstructions: text("special_instructions"),
  assignedContractor: uuid("assigned_contractor").references(() => contractors.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Pricing Configuration
export const pricingRules = pgTable("pricing_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // transportation, hamali_loading, hamali_unloading
  calculationMethod: text("calculation_method").notNull(), // distance_based, quantity_based, weight_based, fixed
  rules: jsonb("rules").notNull(), // Calculation rules and rates
  applicableAreas: jsonb("applicable_areas"), // Geographic areas
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

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

export const insertMarketingMaterialSchema = createInsertSchema(marketingMaterials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdvanceSchema = createInsertSchema(advances).omit({
  id: true,
  advanceNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Additional Types
export type MarketingMaterial = typeof marketingMaterials.$inferSelect;
export type InsertMarketingMaterial = z.infer<typeof insertMarketingMaterialSchema>;

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;

export type Advance = typeof advances.$inferSelect;
export type InsertAdvance = z.infer<typeof insertAdvanceSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
