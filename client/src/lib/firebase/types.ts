/**
 * Firestore document types for BuildMart AI.
 * IDs are strings (Firestore document IDs). Numbers are stored as number type in Firestore.
 */

export type UserRole = "owner_admin" | "vendor_manager" | "vendor" | "user";

export interface FirestoreUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loyaltyPoints?: number;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreProduct {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  specs?: Record<string, unknown>;
  basePrice: number;
  quantitySlabs?: Array<{ min_qty: number; max_qty: number; price_per_unit: number }>;
  dynamicCharges?: Record<string, { rate: number; unit: string; description?: string }>;
  bulkDiscountSlabs?: Array<{ min_qty: number; discount_percent: number }>;
  deliveryDiscountSlabs?: Array<{ location: string; discount_percent: number }>;
  brand?: string;
  company?: string;
  gstRate?: number;
  imageUrl?: string;
  vendorId: string;
  stockQuantity: number;
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreDiscount {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicableProducts?: string[] | "all";
  applicableCategories?: string[] | "all";
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreQuote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  projectType?: string;
  projectLocation?: string;
  requirements?: Record<string, unknown>;
  items: unknown[];
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  status: string;
  validUntil?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime?: string;
  location: string;
  requirements?: Record<string, unknown>;
  estimatedDuration?: number;
  cost?: number;
  status: string;
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  quoteId?: string;
  advanceId?: string;
  items: unknown[];
  subtotal: number;
  transportationCharges?: number;
  hamaliCharges?: number;
  otherCharges?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceAmount: number;
  status: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  assignedContractor?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreMarketingMaterial {
  id: string;
  title: string;
  description?: string;
  type: string;
  content?: Record<string, unknown>;
  targetAudience?: string;
  status?: string;
  validFrom?: string;
  validUntil?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreContractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  licenseNumber?: string;
  specialization?: unknown;
  experienceYears?: number;
  rating?: number;
  totalProjects?: number;
  isVerified: boolean;
  isActive: boolean;
  documents?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreAdvance {
  id: string;
  advanceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderReference?: string;
  quoteReference?: string;
  advanceAmount: number;
  totalOrderAmount: number;
  advancePercentage: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: string;
  balanceAmount: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestorePricingRule {
  id: string;
  name: string;
  type: string;
  calculationMethod: string;
  rules: Record<string, unknown>;
  applicableAreas?: unknown;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
