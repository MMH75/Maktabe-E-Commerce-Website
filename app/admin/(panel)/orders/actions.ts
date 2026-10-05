"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import type { FormResult } from "@/lib/admin-form";
import { requireAdmin } from "@/lib/auth";
import { isOrderStatus } from "@/lib/orders";

class NotEnoughStock extends Error {}

/**
 * Saves an order's status, courier and tracking number.
 * Cancelling puts the books back in stock; un-cancelling takes them out again.
 */
export async function updateOrder(id: number, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const status = text("status");
  const courier = text("courier");
  const trackingNumber = text("trackingNumber");

  if (!isOrderStatus(status)) return { error: "Please choose a valid status." };
  if (courier.length > 80) return { error: "Courier name must be 80 characters or fewer." };
  if (trackingNumber.length > 80) return { error: "Tracking number must be 80 characters or fewer." };

  try {
    const found = await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
      if (!order) return false;

      const wasCancelled = order.status === "cancelled";
      const nowCancelled = status === "cancelled";
      if (wasCancelled !== nowCancelled) {
        const items = await tx
          .select({ productId: orderItems.productId, quantity: orderItems.quantity })
          .from(orderItems)
          .where(eq(orderItems.orderId, id));
        const live = items.filter((i): i is { productId: number; quantity: number } => i.productId !== null);

        if (!nowCancelled && live.length > 0) {
          // Re-opening a cancelled order: the copies must still be available
          const stock = await tx
            .select({ id: products.id, stock: products.stock, title: products.titleEn })
            .from(products)
            .where(inArray(products.id, live.map((i) => i.productId)))
            .for("update");
          for (const item of live) {
            const p = stock.find((s) => s.id === item.productId);
            if (p && p.stock < item.quantity)
              throw new NotEnoughStock(`Only ${p.stock} of “${p.title}” left in stock — not enough to re-open this order.`);
          }
        }
        for (const item of live) {
          const change = nowCancelled ? item.quantity : -item.quantity;
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${change}` })
            .where(eq(products.id, item.productId));
        }
      }

      await tx
        .update(orders)
        .set({ status, courier: courier || null, trackingNumber: trackingNumber || null, updatedAt: new Date() })
        .where(eq(orders.id, id));
      return true;
    });
    if (!found) return { error: "This order no longer exists." };
  } catch (err) {
    if (err instanceof NotEnoughStock) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/", "layout");
  redirect(`/admin/orders/${id}?saved=1`);
}
