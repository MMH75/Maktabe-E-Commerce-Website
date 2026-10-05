import { db } from "@/db";
import { categories, productCategories, type Category } from "@/db/schema";
import { and, asc, count, eq } from "drizzle-orm";

/** A category groups books by type (e.g. Tafseer); a topic by subject (topical division). */
export type CategoryKind = "category" | "topic";

export const KIND_LABEL: Record<CategoryKind, { one: string; many: string; path: string }> = {
  category: { one: "Category", many: "Categories", path: "category" },
  topic: { one: "Topic", many: "Topics", path: "topic" },
};

export function isCategoryKind(value: string): value is CategoryKind {
  return value === "category" || value === "topic";
}

/** Categories and/or topics, in the order they were added. No `kind` = both. */
export async function getCategories(kind?: CategoryKind): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .where(kind ? eq(categories.kind, kind) : undefined)
    .orderBy(asc(categories.id));
}

export async function getCategoryBySlug(slug: string, kind: CategoryKind): Promise<Category | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.kind, kind)));
  return rows[0] ?? null;
}

export async function getCategory(id: number): Promise<Category | null> {
  const rows = await db.select().from(categories).where(eq(categories.id, id));
  return rows[0] ?? null;
}

/** Number of books in each category, keyed by category ID (empty categories are absent). */
export async function getCategoryBookCounts(): Promise<Map<number, number>> {
  const rows = await db
    .select({ categoryId: productCategories.categoryId, books: count() })
    .from(productCategories)
    .groupBy(productCategories.categoryId);
  return new Map(rows.map((r) => [r.categoryId, r.books]));
}

/** IDs of the books in a category — for the admin "Books in category" page. */
export async function getCategoryProductIds(categoryId: number): Promise<number[]> {
  const rows = await db
    .select({ id: productCategories.productId })
    .from(productCategories)
    .where(eq(productCategories.categoryId, categoryId));
  return rows.map((r) => r.id);
}
