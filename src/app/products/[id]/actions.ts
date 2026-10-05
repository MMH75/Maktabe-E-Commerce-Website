"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { comments, products } from "@/db/schema";
import { MAX_COMMENT } from "@/lib/comments";
import { getCurrentCustomer } from "@/lib/customer-auth";

export type CommentState = { error?: string; success?: string; body?: string } | undefined;

const MIN_GAP_MS = 30 * 1000; // one comment per 30 seconds per customer (stops spam)

export async function postComment(productId: number, _prev: CommentState, formData: FormData): Promise<CommentState> {
  const customer = await getCurrentCustomer();
  if (!customer) return { error: "Please log in to comment." };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2) return { error: "Please write a comment.", body };
  if (body.length > MAX_COMMENT) return { error: `Comments can be up to ${MAX_COMMENT} characters.`, body };

  const [book] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId));
  if (!book) return { error: "This book no longer exists." };

  const [last] = await db
    .select({ createdAt: comments.createdAt })
    .from(comments)
    .where(eq(comments.customerId, customer.id))
    .orderBy(desc(comments.createdAt))
    .limit(1);
  if (last && Date.now() - last.createdAt.getTime() < MIN_GAP_MS)
    return { error: "Please wait a few seconds before posting another comment.", body };

  await db.insert(comments).values({
    productId,
    customerId: customer.id,
    authorName: customer.name,
    body,
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/admin/comments");
  return { success: "Thank you — your comment has been posted." };
}

/** Customers can delete their own comments. */
export async function deleteOwnComment(commentId: number): Promise<void> {
  const customer = await getCurrentCustomer();
  if (!customer) return;
  const [deleted] = await db
    .delete(comments)
    .where(and(eq(comments.id, commentId), eq(comments.customerId, customer.id)))
    .returning({ productId: comments.productId });
  if (deleted) {
    revalidatePath(`/products/${deleted.productId}`);
    revalidatePath("/admin/comments");
  }
}
