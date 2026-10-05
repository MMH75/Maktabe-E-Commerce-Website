import { db } from "@/db";
import { customers, orderItems, orders, type Order } from "@/db/schema";
import { and, desc, eq, gte, lt, sql, type SQL } from "drizzle-orm";

// Order statuses — PROVISIONAL until the client confirms them (requirements §6).
// To change them, edit this list only; `status` is stored as plain text.
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", badge: "bg-gold/15 text-gold" },
  { value: "confirmed", label: "Confirmed", badge: "bg-navy/10 text-navy" },
  { value: "shipped", label: "Shipped", badge: "bg-sky-100 text-sky-800" },
  { value: "delivered", label: "Delivered", badge: "bg-emerald-100 text-emerald-800" },
  { value: "cancelled", label: "Cancelled", badge: "bg-crimson/10 text-crimson" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.some((s) => s.value === value);
}

export function statusInfo(value: string) {
  return (
    ORDER_STATUSES.find((s) => s.value === value) ?? {
      value,
      label: value,
      badge: "bg-muted/10 text-muted",
    }
  );
}

/** 42 → "MK-00042" */
export function orderNumber(id: number): string {
  return `MK-${String(id).padStart(5, "0")}`;
}

// The shop is in Pakistan (UTC+5, no daylight saving): dates are Karachi dates.
const PK_OFFSET = "+05:00";

/** "2026-10-03" → the instant that day starts in Pakistan. */
export function pkDayStart(date: string): Date {
  return new Date(`${date}T00:00:00${PK_OFFSET}`);
}

/** Today's date in Pakistan as "YYYY-MM-DD". */
export function pkToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type OrderFilters = { status?: string; from?: string; to?: string };

/** Orders, newest first, with the number of copies in each. */
export async function getOrders(filters: OrderFilters = {}) {
  const conditions: SQL[] = [];
  if (filters.status && isOrderStatus(filters.status))
    conditions.push(eq(orders.status, filters.status));
  if (filters.from && ISO_DATE.test(filters.from))
    conditions.push(gte(orders.createdAt, pkDayStart(filters.from)));
  if (filters.to && ISO_DATE.test(filters.to)) {
    // up to the end of the "to" day
    const end = pkDayStart(filters.to);
    end.setUTCDate(end.getUTCDate() + 1);
    conditions.push(lt(orders.createdAt, end));
  }

  return db
    .select({
      order: orders,
      copies: sql<number>`coalesce((select sum(${orderItems.quantity}) from ${orderItems} where ${orderItems.orderId} = ${orders.id}), 0)`.mapWith(Number),
    })
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt), desc(orders.id));
}

export async function getOrder(id: number): Promise<Order | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, id));
  return rows[0] ?? null;
}

export async function getOrderItems(orderId: number) {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(orderItems.id);
}

export async function getCustomerOrders(customerId: number): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

/** Numbers for the admin dashboard. Cancelled orders do not count as revenue. */
export async function getDashboardStats() {
  const todayStart = pkDayStart(pkToday());
  const [today] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      revenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'cancelled'), 0)`.mapWith(Number),
    })
    .from(orders)
    .where(gte(orders.createdAt, todayStart));
  const [pending] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const [customerCount] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(customers);
  const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);

  return {
    todayOrders: today.count,
    todayRevenue: today.revenue,
    pendingOrders: pending.count,
    customers: customerCount.count,
    recent,
  };
}
