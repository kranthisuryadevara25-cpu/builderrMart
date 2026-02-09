import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit as firestoreLimit,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "./app";
import {
  getDocById,
  getCollection,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  docToObject,
  COLLECTIONS,
} from "./collections";
import type {
  FirestoreUser,
  FirestoreCategory,
  FirestoreProduct,
  FirestoreDiscount,
  FirestoreQuote,
  FirestoreBooking,
  FirestoreOrder,
  FirestoreMarketingMaterial,
  FirestoreContractor,
  FirestoreAdvance,
  FirestorePricingRule,
  FirestoreVendorRating,
} from "./types";

const db = () => getFirebaseDb();

// ---------- Categories ----------
export async function getCategories(): Promise<FirestoreCategory[]> {
  const list = await getCollection<FirestoreCategory>(COLLECTIONS.categories, [
    orderBy("name"),
  ]);
  return list.filter((c) => c.isActive !== false);
}

export async function getCategory(id: string): Promise<FirestoreCategory | null> {
  return getDocById<FirestoreCategory>(COLLECTIONS.categories, id);
}

export async function getCategoriesHierarchy(): Promise<FirestoreCategory[]> {
  return getCategories();
}

/** Seed India-ready categories (idempotent: skips existing by name/parent). */
export async function seedIndiaCategories(): Promise<{ created: number; skipped: number }> {
  const { INDIA_SEED_CATEGORIES } = await import("./seed-india-categories");
  const existing = await getCategories();
  const byName = new Map<string, FirestoreCategory>();
  const byParentAndName = new Map<string, FirestoreCategory>();
  for (const c of existing) {
    byName.set(c.name, c);
    const key = (c.parentId || "") + "\0" + c.name;
    byParentAndName.set(key, c);
  }
  let created = 0;
  let skipped = 0;
  for (const seed of INDIA_SEED_CATEGORIES) {
    const parentId = seed.parentName ? byName.get(seed.parentName)?.id : null;
    const key = (parentId || "") + "\0" + seed.name;
    if (byParentAndName.has(key)) {
      skipped++;
      continue;
    }
    const newCat = await createCategory({
      name: seed.name,
      description: seed.description,
      parentId: parentId ?? null,
      isActive: true,
    });
    byName.set(newCat.name, newCat);
    byParentAndName.set(key, newCat);
    created++;
  }
  return { created, skipped };
}

export async function createCategory(data: Omit<FirestoreCategory, "id" | "createdAt" | "updatedAt">): Promise<FirestoreCategory> {
  const id = await addDocument(COLLECTIONS.categories, {
    ...data,
    isActive: data.isActive ?? true,
  });
  const created = await getCategory(id);
  if (!created) throw new Error("Failed to load created category");
  return created;
}

export async function updateCategory(id: string, data: Partial<FirestoreCategory>): Promise<void> {
  await updateDocument(COLLECTIONS.categories, id, data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.categories, id);
}

// ---------- Products ----------
export async function getProducts(filters?: {
  vendorId?: string;
  categoryId?: string;
  search?: string;
}): Promise<FirestoreProduct[]> {
  const ref = collection(db(), COLLECTIONS.products);
  const constraints: ReturnType<typeof where>[] = [];
  if (filters?.vendorId) constraints.push(where("vendorId", "==", filters.vendorId));
  if (filters?.categoryId) constraints.push(where("categoryId", "==", filters.categoryId));
  if (constraints.length === 0) {
    const snap = await getDocs(ref);
    let list = snap.docs.map((d) => docToObject<FirestoreProduct>(d.id, d.data()));
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s))
      );
    }
    return list.filter((p) => p.isActive !== false);
  }
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  let list = snap.docs.map((d) => docToObject<FirestoreProduct>(d.id, d.data()));
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s))
    );
  }
  return list.filter((p) => p.isActive !== false);
}

export async function getProduct(id: string): Promise<FirestoreProduct | null> {
  return getDocById<FirestoreProduct>(COLLECTIONS.products, id);
}

export async function getFeaturedProducts(): Promise<FirestoreProduct[]> {
  const ref = collection(db(), COLLECTIONS.products);
  const q = query(ref, where("isFeatured", "==", true), where("isActive", "==", true), firestoreLimit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToObject<FirestoreProduct>(d.id, d.data()));
}

export async function getTrendingProducts(): Promise<FirestoreProduct[]> {
  const ref = collection(db(), COLLECTIONS.products);
  const q = query(ref, where("isTrending", "==", true), where("isActive", "==", true), firestoreLimit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToObject<FirestoreProduct>(d.id, d.data()));
}

export async function createProduct(data: Omit<FirestoreProduct, "id" | "createdAt" | "updatedAt">): Promise<FirestoreProduct> {
  const id = await addDocument(COLLECTIONS.products, {
    ...data,
    stockQuantity: data.stockQuantity ?? 0,
    isFeatured: data.isFeatured ?? false,
    isTrending: data.isTrending ?? false,
    isActive: data.isActive ?? true,
  });
  const created = await getProduct(id);
  if (!created) throw new Error("Failed to load created product");
  return created;
}

export async function updateProduct(id: string, data: Partial<FirestoreProduct>): Promise<void> {
  await updateDocument(COLLECTIONS.products, id, data);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.products, id);
}

export async function setProductFeatured(id: string, isFeatured: boolean): Promise<void> {
  await updateDocument(COLLECTIONS.products, id, { isFeatured });
}

// ---------- Users (admin) ----------
export async function getUsers(): Promise<FirestoreUser[]> {
  return getCollection<FirestoreUser>(COLLECTIONS.users);
}

export async function getUser(id: string): Promise<FirestoreUser | null> {
  return getDocById<FirestoreUser>(COLLECTIONS.users, id);
}

export async function updateUser(id: string, data: Partial<FirestoreUser>): Promise<void> {
  await updateDocument(COLLECTIONS.users, id, data);
}

// ---------- Vendor ratings ----------
export async function getVendorRatings(vendorId: string): Promise<FirestoreVendorRating[]> {
  const ref = collection(db(), COLLECTIONS.vendorRatings);
  const q = query(
    ref,
    where("vendorId", "==", vendorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToObject<FirestoreVendorRating>(d.id, d.data()));
}

export async function submitVendorRating(
  vendorId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<FirestoreVendorRating> {
  const ref = collection(db(), COLLECTIONS.vendorRatings);
  const q = query(
    ref,
    where("vendorId", "==", vendorId),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const existing = snap.docs[0];
  const payload = {
    vendorId,
    userId,
    rating: Math.min(5, Math.max(1, rating)),
    comment: comment || null,
    updatedAt: new Date().toISOString(),
  };
  if (existing) {
    await updateDocument(COLLECTIONS.vendorRatings, existing.id, payload);
    const updated = await getDocById<FirestoreVendorRating>(COLLECTIONS.vendorRatings, existing.id);
    if (!updated) throw new Error("Failed to load updated rating");
    await recalcVendorRating(vendorId);
    return updated;
  }
  const id = await addDocument(COLLECTIONS.vendorRatings, {
    vendorId,
    userId,
    rating: Math.min(5, Math.max(1, rating)),
    comment: comment ?? null,
  });
  const created = await getDocById<FirestoreVendorRating>(COLLECTIONS.vendorRatings, id);
  if (!created) throw new Error("Failed to load created rating");
  await recalcVendorRating(vendorId);
  return created;
}

async function recalcVendorRating(vendorId: string): Promise<void> {
  const ratings = await getVendorRatings(vendorId);
  if (ratings.length === 0) {
    await updateDocument(COLLECTIONS.users, vendorId, { rating: 0, ratingCount: 0 });
    return;
  }
  const sum = ratings.reduce((a, r) => a + r.rating, 0);
  const avg = Math.round((sum / ratings.length) * 10) / 10;
  await updateDocument(COLLECTIONS.users, vendorId, {
    rating: avg,
    ratingCount: ratings.length,
  });
}

// ---------- Orders ----------
export async function getOrder(id: string): Promise<FirestoreOrder | null> {
  return getDocById<FirestoreOrder>(COLLECTIONS.orders, id);
}

export async function getOrders(filters?: { createdBy?: string }): Promise<FirestoreOrder[]> {
  const ref = collection(db(), COLLECTIONS.orders);
  if (filters?.createdBy) {
    const q = query(ref, where("createdBy", "==", filters.createdBy), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToObject<FirestoreOrder>(d.id, d.data()));
  }
  const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => docToObject<FirestoreOrder>(d.id, d.data()));
}

export async function createOrder(data: Omit<FirestoreOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">): Promise<FirestoreOrder> {
  const orderNumber = "ORD-" + Date.now();
  const id = await addDocument(COLLECTIONS.orders, { ...data, orderNumber });
  const created = await getDocById<FirestoreOrder>(COLLECTIONS.orders, id);
  if (!created) throw new Error("Failed to load created order");
  return created;
}

export async function updateOrder(id: string, data: Partial<FirestoreOrder>): Promise<void> {
  await updateDocument(COLLECTIONS.orders, id, data);
}

// ---------- Quotes ----------
export async function getQuotes(filters?: { createdBy?: string }): Promise<FirestoreQuote[]> {
  const ref = collection(db(), COLLECTIONS.quotes);
  if (filters?.createdBy) {
    const q = query(ref, where("createdBy", "==", filters.createdBy), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToObject<FirestoreQuote>(d.id, d.data()));
  }
  const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => docToObject<FirestoreQuote>(d.id, d.data()));
}

export async function createQuote(data: Omit<FirestoreQuote, "id" | "quoteNumber" | "createdAt" | "updatedAt">): Promise<FirestoreQuote> {
  const quoteNumber = "QT-" + Date.now();
  const id = await addDocument(COLLECTIONS.quotes, { ...data, quoteNumber, status: "pending" });
  const created = await getDocById<FirestoreQuote>(COLLECTIONS.quotes, id);
  if (!created) throw new Error("Failed to load created quote");
  return created;
}

export async function updateQuote(id: string, data: Partial<FirestoreQuote>): Promise<void> {
  await updateDocument(COLLECTIONS.quotes, id, data);
}

// ---------- Bookings ----------
export async function getBookings(): Promise<FirestoreBooking[]> {
  const ref = collection(db(), COLLECTIONS.bookings);
  const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => docToObject<FirestoreBooking>(d.id, d.data()));
}

export async function createBooking(data: Omit<FirestoreBooking, "id" | "bookingNumber" | "createdAt" | "updatedAt">): Promise<FirestoreBooking> {
  const bookingNumber = "BK-" + Date.now();
  const id = await addDocument(COLLECTIONS.bookings, { ...data, bookingNumber, status: "pending" });
  const created = await getDocById<FirestoreBooking>(COLLECTIONS.bookings, id);
  if (!created) throw new Error("Failed to load created booking");
  return created;
}

export async function updateBooking(id: string, data: Partial<FirestoreBooking>): Promise<void> {
  await updateDocument(COLLECTIONS.bookings, id, data);
}

// ---------- Discounts ----------
export async function getDiscounts(): Promise<FirestoreDiscount[]> {
  return getCollection<FirestoreDiscount>(COLLECTIONS.discounts);
}

export async function createDiscount(data: Omit<FirestoreDiscount, "id" | "usageCount" | "createdAt" | "updatedAt">): Promise<FirestoreDiscount> {
  const id = await addDocument(COLLECTIONS.discounts, { ...data, usageCount: 0 });
  const created = await getDocById<FirestoreDiscount>(COLLECTIONS.discounts, id);
  if (!created) throw new Error("Failed to load created discount");
  return created;
}

export async function updateDiscount(id: string, data: Partial<FirestoreDiscount>): Promise<void> {
  await updateDocument(COLLECTIONS.discounts, id, data);
}

export async function deleteDiscount(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.discounts, id);
}

// ---------- Marketing materials ----------
export async function getMarketingMaterials(): Promise<FirestoreMarketingMaterial[]> {
  return getCollection<FirestoreMarketingMaterial>(COLLECTIONS.marketingMaterials);
}

export async function createMarketingMaterial(data: Omit<FirestoreMarketingMaterial, "id" | "createdAt" | "updatedAt">): Promise<FirestoreMarketingMaterial> {
  const id = await addDocument(COLLECTIONS.marketingMaterials, data);
  const created = await getDocById<FirestoreMarketingMaterial>(COLLECTIONS.marketingMaterials, id);
  if (!created) throw new Error("Failed to load created material");
  return created;
}

export async function deleteMarketingMaterial(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.marketingMaterials, id);
}

// ---------- Contractors ----------
export async function getContractors(): Promise<FirestoreContractor[]> {
  return getCollection<FirestoreContractor>(COLLECTIONS.contractors);
}

export async function createContractor(data: Omit<FirestoreContractor, "id" | "createdAt" | "updatedAt">): Promise<FirestoreContractor> {
  const id = await addDocument(COLLECTIONS.contractors, data);
  const created = await getDocById<FirestoreContractor>(COLLECTIONS.contractors, id);
  if (!created) throw new Error("Failed to load created contractor");
  return created;
}

export async function deleteContractor(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.contractors, id);
}

// ---------- Advances ----------
export async function getAdvances(): Promise<FirestoreAdvance[]> {
  return getCollection<FirestoreAdvance>(COLLECTIONS.advances);
}

// ---------- Pricing rules ----------
export async function getPricingRules(): Promise<FirestorePricingRule[]> {
  return getCollection<FirestorePricingRule>(COLLECTIONS.pricingRules);
}

export async function createPricingRule(data: Omit<FirestorePricingRule, "id" | "createdAt" | "updatedAt">): Promise<FirestorePricingRule> {
  const id = await addDocument(COLLECTIONS.pricingRules, data);
  const created = await getDocById<FirestorePricingRule>(COLLECTIONS.pricingRules, id);
  if (!created) throw new Error("Failed to load created rule");
  return created;
}
