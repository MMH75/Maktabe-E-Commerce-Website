import { db } from "@/db";
import { productCategories, products, type Product } from "@/db/schema";
import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import type { SortValue } from "@/lib/sorts";

// What the customer actually pays: the sale price when it is a real discount
const payPrice = sql`case when ${products.salePrice} is not null and ${products.salePrice} < ${products.price} then ${products.salePrice} else ${products.price} end`;

/** Escapes % and _ so a search for "100%" matches literally. */
function likePattern(text: string) {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Books for the storefront.
 * - `categoryId`: only books in that category or topic
 * - `search`: matches the English title, Urdu title or author
 * - `sort`: see SORTS
 */
export async function getProducts(
  options: { categoryId?: number; search?: string; sort?: SortValue } = {},
): Promise<Product[]> {
  const conditions: SQL[] = [];
  if (options.categoryId !== undefined) {
    conditions.push(
      inArray(
        products.id,
        db
          .select({ id: productCategories.productId })
          .from(productCategories)
          .where(eq(productCategories.categoryId, options.categoryId)),
      ),
    );
  }
  const q = options.search?.trim();
  if (q) {
    const pattern = likePattern(q);
    conditions.push(
      or(
        ilike(products.titleEn, pattern),
        ilike(products.titleUr, pattern),
        ilike(products.author, pattern),
      )!,
    );
  }

  const order =
    options.sort === "newest"
      ? [desc(products.id)]
      : options.sort === "price-asc"
        ? [asc(payPrice), asc(products.id)]
        : options.sort === "price-desc"
          ? [desc(payPrice), asc(products.id)]
          : [asc(products.id)];

  return db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...order);
}

export async function getProduct(id: number): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}

/** Books by ID, in no particular order — for the cart, checkout and wishlist. */
export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}

/** IDs of the categories and topics a book belongs to — for the admin book form. */
export async function getProductCategoryIds(productId: number): Promise<number[]> {
  const rows = await db
    .select({ id: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, productId));
  return rows.map((r) => r.id);
}
