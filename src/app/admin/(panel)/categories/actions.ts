"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, productCategories } from "@/db/schema";
import type { FormResult } from "@/lib/admin-form";
import { requireAdmin } from "@/lib/auth";
import { isCategoryKind } from "@/lib/categories";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Booklets (Kitaabche)" → "booklets-kitaabche" */
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readFields(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const name = text("name");
  return {
    name,
    nameUr: text("nameUr") || null,
    // Left empty → made from the English name
    slug: (text("slug") || slugify(name)).toLowerCase(),
    kind: text("kind") || "category",
  };
}

function validate(f: ReturnType<typeof readFields>): string | null {
  if (!isCategoryKind(f.kind)) return "Please choose whether this is a category or a topic.";
  if (!f.name) return "Name is required.";
  if (f.name.length > 80) return "Name must be 80 characters or fewer.";
  if (f.nameUr && f.nameUr.length > 80) return "Urdu name must be 80 characters or fewer.";
  if (!f.slug) return "Please enter a slug (the English name has no letters or numbers to make one from).";
  if (!SLUG.test(f.slug))
    return "Slug may only contain lowercase letters, numbers and single hyphens (e.g. seerat-un-nabi).";
  return null;
}

// Postgres unique_violation; drizzle may wrap the pg error in `cause`
function uniqueViolation(err: unknown): string | null {
  const e = err as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
  const pgErr = e?.code === "23505" ? e : e?.cause?.code === "23505" ? e.cause : null;
  if (!pgErr) return null;
  return pgErr.constraint?.includes("slug") ? "slug" : "name";
}

function duplicateMessage(field: string, f: ReturnType<typeof readFields>) {
  return field === "slug"
    ? `The slug "${f.slug}" is already used by another category.`
    : `A category named "${f.name}" already exists.`;
}

function refresh() {
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout"); // header menu, filters, category and topic pages
}

export async function createCategory(formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const fields = readFields(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  try {
    await db.insert(categories).values(fields);
  } catch (err) {
    const dup = uniqueViolation(err);
    if (dup) return { error: duplicateMessage(dup, fields) };
    console.error("createCategory failed", err);
    return { error: "Could not save the category. Please try again." };
  }

  refresh();
  redirect("/admin/categories");
}

export async function updateCategory(id: number, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const fields = readFields(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  try {
    const updated = await db
      .update(categories)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    if (updated.length === 0) return { error: "This category no longer exists." };
  } catch (err) {
    const dup = uniqueViolation(err);
    if (dup) return { error: duplicateMessage(dup, fields) };
    console.error("updateCategory failed", err);
    return { error: "Could not save the category. Please try again." };
  }

  refresh();
  redirect("/admin/categories");
}

export async function deleteCategory(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, id));
  refresh();
}

/** Replaces the list of books in a category with exactly the ticked books. */
export async function setCategoryBooks(categoryId: number, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const productIds = [
    ...new Set(
      formData
        .getAll("productIds")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  ];

  try {
    await db.transaction(async (tx) => {
      const [category] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, categoryId));
      if (!category) throw new Error("CATEGORY_GONE");

      await tx.delete(productCategories).where(eq(productCategories.categoryId, categoryId));
      if (productIds.length > 0) {
        await tx
          .insert(productCategories)
          .values(productIds.map((productId) => ({ productId, categoryId })));
      }
    });
  } catch (err) {
    if (err instanceof Error && err.message === "CATEGORY_GONE")
      return { error: "This category no longer exists." };
    // Postgres foreign_key_violation: a ticked book was deleted meanwhile
    const e = err as { code?: string; cause?: { code?: string } };
    if (e?.code === "23503" || e?.cause?.code === "23503")
      return { error: "One of the ticked books no longer exists. Please reload the page and try again." };
    console.error("setCategoryBooks failed", err);
    return { error: "Could not save the books for this category. Please try again." };
  }

  refresh();
  revalidatePath("/admin/products");
  redirect("/admin/categories");
}
