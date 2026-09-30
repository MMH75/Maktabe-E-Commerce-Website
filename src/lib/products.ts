import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getProducts(): Promise<Product[]> {
  return db.select().from(products).orderBy(asc(products.id));
}

export async function getProduct(id: number): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}
