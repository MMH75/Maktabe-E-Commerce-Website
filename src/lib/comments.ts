import { db } from "@/db";
import { comments, products, type Comment } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const MAX_COMMENT = 1000;

/** Visible comments under a book, newest first. */
export async function getProductComments(productId: number): Promise<Comment[]> {
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.productId, productId), eq(comments.isHidden, false)))
    .orderBy(desc(comments.createdAt), desc(comments.id));
}

/** Every comment on the site, newest first, with its book — for the admin. */
export async function getAllComments(show: "all" | "visible" | "hidden" = "all") {
  return db
    .select({ comment: comments, bookTitle: products.titleEn })
    .from(comments)
    .innerJoin(products, eq(products.id, comments.productId))
    .where(show === "all" ? undefined : eq(comments.isHidden, show === "hidden"))
    .orderBy(desc(comments.createdAt), desc(comments.id));
}
