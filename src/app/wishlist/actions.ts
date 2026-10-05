"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, wishlistItems } from "@/db/schema";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { toProductInfo } from "@/lib/pricing";
import { getProductsByIds } from "@/lib/products";
import type { ProductInfo } from "@/lib/store";

function cleanIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 200);
}

/**
 * Brings the browser's wishlist up to date.
 * - Logged in: books saved in the browser are added to the account, and the
 *   account's full wishlist is returned.
 * - Guest: the same books are returned with current prices and stock.
 * Deleted books are dropped either way.
 */
export async function syncWishlist(localIds: number[]): Promise<{ items: ProductInfo[]; loggedIn: boolean }> {
  const ids = cleanIds(localIds);
  const customer = await getCurrentCustomer();

  if (!customer) {
    const found = await getProductsByIds(ids);
    const byId = new Map(found.map((p) => [p.id, p]));
    return { items: ids.flatMap((id) => (byId.has(id) ? [toProductInfo(byId.get(id)!)] : [])), loggedIn: false };
  }

  if (ids.length > 0) {
    const existing = await getProductsByIds(ids);
    if (existing.length > 0) {
      await db
        .insert(wishlistItems)
        .values(existing.map((p) => ({ customerId: customer.id, productId: p.id })))
        .onConflictDoNothing();
    }
  }

  const rows = await db
    .select({ product: products })
    .from(wishlistItems)
    .innerJoin(products, eq(products.id, wishlistItems.productId))
    .where(eq(wishlistItems.customerId, customer.id))
    .orderBy(asc(wishlistItems.createdAt));
  return { items: rows.map((r) => toProductInfo(r.product)), loggedIn: true };
}

/** Saves a wishlist change to the account (does nothing for guests). */
export async function setWishlisted(productId: number, wished: boolean): Promise<void> {
  const customer = await getCurrentCustomer();
  if (!customer || !Number.isInteger(productId) || productId <= 0) return;

  if (wished) {
    const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId));
    if (!exists) return;
    await db.insert(wishlistItems).values({ customerId: customer.id, productId }).onConflictDoNothing();
  } else {
    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.customerId, customer.id), inArray(wishlistItems.productId, [productId])));
  }
}
