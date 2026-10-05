"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

/** Quick stock edit from the inventory table. Returns an error message, or null. */
export async function setStock(id: number, stock: number): Promise<string | null> {
  await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000)
    return "Stock must be a whole number from 0 to 1,000,000.";

  const updated = await db
    .update(products)
    .set({ stock })
    .where(eq(products.id, id))
    .returning({ id: products.id });
  if (updated.length === 0) return "This book no longer exists.";

  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/all-books");
  revalidatePath(`/products/${id}`);
  return null;
}
