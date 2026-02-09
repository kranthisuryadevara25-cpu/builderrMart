/**
 * Single API layer for the app when using Firebase backend.
 * Import this instead of calling fetch("/api/...") or apiRequest().
 */
import {
  getCategories,
  getCategoriesHierarchy,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProduct,
  getFeaturedProducts,
  getTrendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductFeatured,
  getUsers,
  getUser,
  updateUser,
  getOrder,
  getOrders,
  createOrder,
  updateOrder,
  getQuotes,
  createQuote,
  updateQuote,
  getBookings,
  createBooking,
  updateBooking,
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getMarketingMaterials,
  createMarketingMaterial,
  deleteMarketingMaterial,
  getContractors,
  createContractor,
  deleteContractor,
  getAdvances,
  getPricingRules,
  createPricingRule,
} from "./firebase/firestore-services";
import { getUserProfile } from "./firebase/auth";
import type {
  FirestoreCategory,
  FirestoreProduct,
  FirestoreUser,
  FirestoreOrder,
  FirestoreQuote,
  FirestoreBooking,
  FirestoreDiscount,
  FirestoreMarketingMaterial,
  FirestoreContractor,
  FirestoreAdvance,
  FirestorePricingRule,
} from "./firebase/types";

// Re-export types as app-facing types (compatible with @shared/schema usage in components)
export type Category = FirestoreCategory;
export type Product = FirestoreProduct;
export type User = FirestoreUser;
export type Order = FirestoreOrder;
export type Quote = FirestoreQuote;
export type Booking = FirestoreBooking;
export type Discount = FirestoreDiscount;

export const firebaseApi = {
  // Categories
  getCategories,
  getCategoriesHierarchy,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,

  // Products
  getProducts,
  getProduct,
  getFeaturedProducts,
  getTrendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductFeatured,

  // Users (admin)
  getUsers,
  getUser,
  updateUser,

  // Current user profile (by uid)
  async getUserProfile(uid: string) {
    return getUserProfile(uid);
  },

  // Orders
  getOrder,
  getOrders,
  createOrder,
  updateOrder,

  // Quotes
  getQuotes,
  createQuote,
  updateQuote,

  // Bookings
  getBookings,
  createBooking,
  updateBooking,

  // Discounts
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,

  // Marketing materials
  getMarketingMaterials,
  createMarketingMaterial,
  deleteMarketingMaterial,

  // Contractors
  getContractors,
  createContractor,
  deleteContractor,

  // Advances & pricing
  getAdvances,
  getPricingRules,
  createPricingRule,
};
