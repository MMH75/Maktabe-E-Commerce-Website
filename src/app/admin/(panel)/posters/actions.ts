"use server";

import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { posters } from "@/db/schema";
import { getUploadedImage, type FormResult } from "@/lib/admin-form";
import { requireAdmin } from "@/lib/auth";
import { deleteImage, saveImage, validateImage } from "@/lib/storage";

function readFields(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    altText: text("altText"),
    linkUrl: text("linkUrl") || null,
    isActive: formData.get("isActive") === "on",
  };
}

function validate(f: ReturnType<typeof readFields>): string | null {
  if (!f.altText) return "Description (alt text) is required.";
  if (f.linkUrl && !/^(\/|https?:\/\/)/.test(f.linkUrl))
    return "Link must start with / (a page on this site) or https://";
  return null;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/posters");
}

export async function createPoster(formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const fields = readFields(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const image = getUploadedImage(formData);
  if (!image) return { error: "Please choose a poster image." };
  const badImage = validateImage(image);
  if (badImage) return { error: badImage };

  const imageUrl = await saveImage(image);
  try {
    // New posters go to the end of the carousel
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${posters.sortOrder}), 0) + 1` })
      .from(posters);
    await db.insert(posters).values({ ...fields, imageUrl, sortOrder: Number(next) });
  } catch (err) {
    await deleteImage(imageUrl);
    console.error("createPoster failed", err);
    return { error: "Could not save the poster. Please try again." };
  }

  refresh();
  redirect("/admin/posters");
}

export async function updatePoster(id: number, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const fields = readFields(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const [existing] = await db.select().from(posters).where(eq(posters.id, id));
  if (!existing) return { error: "This poster no longer exists." };

  const image = getUploadedImage(formData);
  let imageUrl = existing.imageUrl;
  if (image) {
    const badImage = validateImage(image);
    if (badImage) return { error: badImage };
    imageUrl = await saveImage(image);
  }

  try {
    await db
      .update(posters)
      .set({ ...fields, imageUrl, updatedAt: new Date() })
      .where(eq(posters.id, id));
  } catch (err) {
    if (image) await deleteImage(imageUrl);
    console.error("updatePoster failed", err);
    return { error: "Could not save the poster. Please try again." };
  }

  // The old image is only removed once the new one is safely saved
  if (image) await deleteImage(existing.imageUrl);
  refresh();
  redirect("/admin/posters");
}

export async function deletePoster(id: number): Promise<void> {
  await requireAdmin();
  const [deleted] = await db.delete(posters).where(eq(posters.id, id)).returning();
  if (deleted) await deleteImage(deleted.imageUrl);
  refresh();
}

export async function setPosterActive(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  await db
    .update(posters)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(posters.id, id));
  refresh();
}

/** Swaps a poster with its neighbour, then renumbers every poster 1..n. */
export async function movePoster(id: number, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  await db.transaction(async (tx) => {
    const all = await tx
      .select({ id: posters.id })
      .from(posters)
      .orderBy(asc(posters.sortOrder), asc(posters.id));
    const i = all.findIndex((p) => p.id === id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= all.length) return;
    [all[i], all[j]] = [all[j], all[i]];
    for (const [index, p] of all.entries()) {
      await tx.update(posters).set({ sortOrder: index + 1 }).where(eq(posters.id, p.id));
    }
  });
  refresh();
}
