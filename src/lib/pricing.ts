// Price helpers shared by server pages and client components (no db imports here).

import type { Product } from "@/db/schema";
import type { ProductInfo } from "@/lib/store";

type Priced = { price: number; salePrice: number | null };

/** A sale only counts when it is actually cheaper than the regular price. */
export function isOnSale(p: Priced): boolean {
  return p.salePrice !== null && p.salePrice < p.price;
}

/** The price the customer pays. */
export function effectivePrice(p: Priced): number {
  return isOnSale(p) ? (p.salePrice as number) : p.price;
}

export function discountPercent(p: Priced): number {
  return isOnSale(p) ? Math.round((1 - (p.salePrice as number) / p.price) * 100) : 0;
}

/** The slice of a product that cards, the cart and the wishlist need. */
export function toProductInfo(p: Product): ProductInfo {
  return {
    id: p.id,
    titleUr: p.titleUr,
    titleEn: p.titleEn,
    price: effectivePrice(p),
    image: p.image,
    originalPrice: isOnSale(p) ? p.price : undefined,
    inStock: p.stock > 0,
  };
}

/** 850 → "850 g", 1800 → "1.8 kg" */
export function formatWeight(grams: number): string {
  return grams >= 1000 ? `${Number((grams / 1000).toFixed(2))} kg` : `${grams} g`;
}

/** At or below this many copies a book counts as "low stock". */
export const LOW_STOCK = 5;

/**
 * Delivery charge added to every order, in Rs. The site advertises free home
 * delivery in Pakistan; change this once the client confirms courier rates.
 */
export const DELIVERY_CHARGE = 0;
