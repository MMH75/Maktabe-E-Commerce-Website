"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

function refresh(productId: number) {
  revalidatePath("/admin/comments");
  revalidatePath(`/products/${productId}`);
}

/** Hidden comments stay in the database but are not shown on the book page. */
export async function setCommentHidden(id: number, isHidden: boolean): Promise<void> {
  await requireAdmin();
  const [row] = await db
    .update(comments)
    .set({ isHidden })
    .where(eq(comments.id, id))
    .returning({ productId: comments.productId });
  if (row) refresh(row.productId);
}

export async function deleteComment(id: number): Promise<void> {
  await requireAdmin();
  const [row] = await db.delete(comments).where(eq(comments.id, id)).returning({ productId: comments.productId });
  if (row) refresh(row.productId);
}
