"use server";

import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { productCategories, products } from "@/db/schema";
import type { FormResult } from "@/lib/admin-form";
import { requireAdmin } from "@/lib/auth";

function refresh() {
  revalidatePath("/admin/discounts");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/all-books");
  revalidatePath("/products/[id]", "page");
}

/** Sets (or with null, removes) one book's sale price. Returns an error message, or null. */
export async function setSalePrice(id: number, salePrice: number | null): Promise<string | null> {
  await requireAdmin();
  const [book] = await db.select({ price: products.price }).from(products).where(eq(products.id, id));
  if (!book) return "This book no longer exists.";
  if (salePrice !== null) {
    if (!Number.isInteger(salePrice) || salePrice < 0) return "Sale price must be a whole number of rupees.";
    if (salePrice >= book.price) return `Must be lower than the price (Rs ${book.price.toLocaleString("en-US")}).`;
  }
  await db.update(products).set({ salePrice }).where(eq(products.id, id));
  refresh();
  return null;
}

/** "all" → every book; otherwise the books in that category. */
function readTarget(formData: FormData) {
  const target = String(formData.get("target") ?? "");
  if (target === "all") return { ok: true as const, where: undefined, label: "all books" };
  const categoryId = Number(target);
  if (!Number.isInteger(categoryId) || categoryId <= 0) return { ok: false as const };
  return {
    ok: true as const,
    where: inArray(
      products.id,
      db
        .select({ id: productCategories.productId })
        .from(productCategories)
        .where(eq(productCategories.categoryId, categoryId)),
    ),
    label: "this category",
  };
}

/** Puts every targeted book on sale at `percent`% off its regular price. */
export async function applyBulkDiscount(formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const target = readTarget(formData);
  if (!target.ok) return { error: "Please choose which books to discount." };
  const percentText = String(formData.get("percent") ?? "").trim();
  const percent = Number(percentText);
  if (!/^\d+$/.test(percentText) || percent < 1 || percent > 90)
    return { error: "Discount must be a whole number from 1 to 90 percent." };

  const discounted = sql<number>`round(${products.price} * (100 - ${percent}) / 100.0)::int`;
  const updated = await db
    .update(products)
    .set({ salePrice: discounted })
    // skip books whose discounted price would not actually be lower (e.g. Rs 0 books)
    .where(and(target.where, gt(products.price, discounted)))
    .returning({ id: products.id });

  if (updated.length === 0) return { error: `No books were found in ${target.label}.` };
  refresh();
  redirect(`/admin/discounts?done=applied&count=${updated.length}&percent=${percent}`);
}

/** Takes every targeted book off sale. */
export async function removeBulkDiscount(formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const target = readTarget(formData);
  if (!target.ok) return { error: "Please choose which books to take off sale." };

  const updated = await db
    .update(products)
    .set({ salePrice: null })
    .where(and(target.where, sql`${products.salePrice} is not null`))
    .returning({ id: products.id });

  if (updated.length === 0) return { error: `No books in ${target.label} are on sale.` };
  refresh();
  redirect(`/admin/discounts?done=removed&count=${updated.length}`);
}
