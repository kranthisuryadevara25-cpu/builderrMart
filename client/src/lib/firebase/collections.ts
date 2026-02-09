import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseDb } from "./app";

export const COLLECTIONS = {
  users: "users",
  categories: "categories",
  products: "products",
  orders: "orders",
  quotes: "quotes",
  bookings: "bookings",
  discounts: "discounts",
  marketingMaterials: "marketing_materials",
  contractors: "contractors",
  advances: "advances",
  pricingRules: "pricing_rules",
} as const;

function docToObject<T extends { id?: string }>(id: string, data: DocumentData): T {
  const out = { ...data, id } as T;
  // Firestore Timestamps: convert to ISO string if present
  (Object.keys(out) as (keyof T)[]).forEach((k) => {
    const v = out[k];
    if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
      (out as Record<keyof T, unknown>)[k] = (v as { toDate: () => Date }).toDate().toISOString();
    }
  });
  return out;
}

export async function getDocById<T>(col: string, id: string): Promise<T | null> {
  const db = getFirebaseDb();
  const ref = doc(db, col, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return docToObject<T>(snap.id, snap.data());
}

export async function getCollection<T>(
  col: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const db = getFirebaseDb();
  const ref = collection(db, col);
  const q = constraints.length ? query(ref, ...constraints) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToObject<T>(d.id, d.data()));
}

export async function addDocument(col: string, data: DocumentData): Promise<string> {
  const db = getFirebaseDb();
  const ref = collection(db, col);
  const docRef = await addDoc(ref, { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  return docRef.id;
}

export async function setDocument(col: string, id: string, data: DocumentData): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, col, id);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function updateDocument(col: string, id: string, data: Partial<DocumentData>): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, col, id);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteDocument(col: string, id: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, col, id);
  await deleteDoc(ref);
}

export function collectionRef(col: string) {
  return collection(getFirebaseDb(), col);
}

export function docRef(col: string, id: string) {
  return doc(getFirebaseDb(), col, id);
}

export { docToObject };
