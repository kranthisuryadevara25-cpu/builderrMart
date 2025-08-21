import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

if (!import.meta.env.VITE_DATABASE_URL) {
  throw new Error("VITE_DATABASE_URL environment variable is required");
}

const sql = neon(import.meta.env.VITE_DATABASE_URL);
export const db = drizzle(sql);
