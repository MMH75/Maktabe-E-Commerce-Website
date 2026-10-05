"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

/**
 * Enables or disables a customer account. A disabled customer will not be able
 * to log in (enforced by customer login, plan day 12); past orders are kept.
 */
export async function setCustomerActive(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  await db.update(customers).set({ isActive }).where(eq(customers.id, id));
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
}
