"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
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
  };
}

function validate(f: ReturnType<typeof readFields>): string | null {
  if (!f.slug) return "Slug is required.";
  if (!SLUG.test(f.slug))
    return "Slug may only contain lowercase letters, numbers and single hyphens (e.g. bayan-ul-quran).";
  if (!f.titleUr) return "Urdu title is required.";
  if (!f.titleEn) return "English title is required.";
  if (!f.author) return "Author is required.";
  if (!/^\d+$/.test(f.price)) return "Price must be a whole number of rupees.";
  if (!f.description) return "Description is required.";
  return null;
}

// Postgres unique_violation; drizzle may wrap the pg error in `cause`
function isUniqueViolation(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

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
    await db.insert(products).values({
      ...fields,
      price: Number(fields.price),
      image: imageUrl,
    });
  } catch (err) {
    await deleteImage(imageUrl);
    if (isUniqueViolation(err))
      return { error: `The slug "${fields.slug}" is already used by another book.` };
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
    await db
      .update(products)
      .set({ ...fields, price: Number(fields.price), image: imageUrl })
      .where(eq(products.id, id));
  } catch (err) {
    if (image) await deleteImage(imageUrl);
    if (isUniqueViolation(err))
      return { error: `The slug "${fields.slug}" is already used by another book.` };
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
