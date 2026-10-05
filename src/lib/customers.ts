import { db } from "@/db";
import { customers, orders, type Customer } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

/** Customers, newest first, with how many orders they placed and what they spent. */
export async function getCustomers(search?: string) {
  const q = search?.trim();
  const where = q
    ? or(
        ilike(customers.name, `%${q}%`),
        ilike(customers.email, `%${q}%`),
        ilike(customers.phone, `%${q}%`),
      )
    : undefined;

  return db
    .select({
      customer: customers,
      orderCount: sql<number>`count(${orders.id})`.mapWith(Number),
      // cancelled orders are not counted as spending
      spent: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'cancelled'), 0)`.mapWith(Number),
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(where)
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt), desc(customers.id));
}

export async function getCustomer(id: number): Promise<Customer | null> {
  const rows = await db.select().from(customers).where(eq(customers.id, id));
  return rows[0] ?? null;
}
