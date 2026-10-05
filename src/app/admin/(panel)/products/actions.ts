"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { productCategories, products } from "@/db/schema";
import { getUploadedImage, type FormResult } from "@/lib/admin-form";
import { requireAdmin } from "@/lib/auth";
import { deleteImage, saveImage, validateImage } from "@/lib/storage";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readFields(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    slug: text("slug").toLowerCase(),
    titleUr: text("titleUr"),
    titleEn: text("titleEn"),
    author: text("author"),
    price: text("price"),
    description: text("description"),
    salePrice: text("salePrice"),
    pages: text("pages"),
    paperQuality: text("paperQuality"),
    weight: text("weight"),
    stock: text("stock"),
  };
}

const WHOLE_NUMBER = /^\d+$/;

/** Empty optional number fields are stored as NULL. */
const optionalNumber = (value: string) => (value === "" ? null : Number(value));

/** The row to write to the database (only call after validate() passed). */
function toRow(f: ReturnType<typeof readFields>) {
  return {
    slug: f.slug,
    titleUr: f.titleUr,
    titleEn: f.titleEn,
    author: f.author,
    description: f.description,
    price: Number(f.price),
    salePrice: optionalNumber(f.salePrice),
    pages: optionalNumber(f.pages),
    paperQuality: f.paperQuality || null,
    weight: optionalNumber(f.weight),
    stock: Number(f.stock),
  };
}

function validate(f: ReturnType<typeof readFields>): string | null {
  if (!f.slug) return "Slug is required.";
  if (!SLUG.test(f.slug))
    return "Slug may only contain lowercase letters, numbers and single hyphens (e.g. bayan-ul-quran).";
  if (!f.titleUr) return "Urdu title is required.";
  if (!f.titleEn) return "English title is required.";
  if (!f.author) return "Author is required.";
  if (!WHOLE_NUMBER.test(f.price)) return "Price must be a whole number of rupees.";
  if (f.salePrice) {
    if (!WHOLE_NUMBER.test(f.salePrice)) return "Sale price must be a whole number of rupees.";
    if (Number(f.salePrice) >= Number(f.price))
      return "Sale price must be lower than the regular price (leave it empty for no sale).";
  }
  if (!WHOLE_NUMBER.test(f.stock)) return "Stock must be a whole number (0 or more).";
  if (f.pages && (!WHOLE_NUMBER.test(f.pages) || Number(f.pages) === 0))
    return "Pages must be a whole number greater than 0.";
  if (f.weight && (!WHOLE_NUMBER.test(f.weight) || Number(f.weight) === 0))
    return "Weight must be a whole number of grams greater than 0.";
  if (f.paperQuality.length > 100) return "Paper quality must be 100 characters or fewer.";
  if (!f.description) return "Description is required.";
  return null;
}

// Postgres unique_violation; drizzle may wrap the pg error in `cause`
function isUniqueViolation(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

/** Ticked category checkboxes, as unique positive IDs. */
function readCategoryIds(formData: FormData): number[] {
  const ids = formData
    .getAll("categoryIds")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)];
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Replaces a book's category links with exactly `categoryIds`. */
async function setCategories(tx: Tx, productId: number, categoryIds: number[]) {
  await tx.delete(productCategories).where(eq(productCategories.productId, productId));
  if (categoryIds.length > 0) {
    await tx
      .insert(productCategories)
      .values(categoryIds.map((categoryId) => ({ productId, categoryId })));
  }
}

// Postgres foreign_key_violation: a ticked category was deleted meanwhile
function isMissingCategory(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23503" || e?.cause?.code === "23503";
}

const MISSING_CATEGORY =
  "One of the ticked categories no longer exists. Please reload the page and try again.";

function refreshStorefront(id?: number) {
  revalidatePath("/");
  revalidatePath("/all-books");
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/products/${id}`);
}

export async function createProduct(formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const fields = readFields(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const image = getUploadedImage(formData);
  if (!image) return { error: "Please choose a picture for the book." };
  const badImage = validateImage(image);
  if (badImage) return { error: badImage };

  const imageUrl = await saveImage(image);
  try {
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({ ...toRow(fields), image: imageUrl })
        .returning({ id: products.id });
      await setCategories(tx, created.id, readCategoryIds(formData));
    });
  } catch (err) {
    await deleteImage(imageUrl);
    if (isUniqueViolation(err))
      return { error: `The slug "${fields.slug}" is already used by another book.` };
    if (isMissingCategory(err)) return { error: MISSING_CATEGORY };
    console.error("createProduct failed", err);
    return { error: "Could not save the book. Please try again." };
  }

  refreshStorefront();
  redirect("/admin/products");
}

export async function updateProduct(id: number, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const fields = readFields(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) return { error: "This book no longer exists." };

  const image = getUploadedImage(formData);
  let imageUrl = existing.image;
  if (image) {
    const badImage = validateImage(image);
    if (badImage) return { error: badImage };
    imageUrl = await saveImage(image);
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({ ...toRow(fields), image: imageUrl })
        .where(eq(products.id, id));
      await setCategories(tx, id, readCategoryIds(formData));
    });
  } catch (err) {
    if (image) await deleteImage(imageUrl);
    if (isUniqueViolation(err))
      return { error: `The slug "${fields.slug}" is already used by another book.` };
    if (isMissingCategory(err)) return { error: MISSING_CATEGORY };
    console.error("updateProduct failed", err);
    return { error: "Could not save the book. Please try again." };
  }

  // The old picture is only removed once the new one is safely saved
  if (image) await deleteImage(existing.image);
  refreshStorefront(id);
  redirect("/admin/products");
}

export async function deleteProduct(id: number): Promise<void> {
  await requireAdmin();
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
  if (deleted) await deleteImage(deleted.image);
  refreshStorefront(id);
}
