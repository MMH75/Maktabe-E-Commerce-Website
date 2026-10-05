import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { DELIVERY_CHARGE, effectivePrice } from "@/lib/pricing";

export const MAX_QTY_PER_BOOK = 50;

export type CartRequest = { id: number; qty: number }[];

/** One cart line, priced from the database (never from the browser). */
export type QuoteLine = {
  id: number;
  titleEn: string;
  titleUr: string;
  image: string;
  unitPrice: number;
  qty: number;
  stock: number;
  /** removed = book no longer sold; out = no stock; short = fewer copies than asked */
  problem: "removed" | "out" | "short" | null;
};

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  delivery: number;
  total: number;
  ok: boolean; // every line can be ordered as is
};

/** Cleans what the browser sent: whole positive quantities, one line per book. */
export function cleanCart(items: unknown): CartRequest {
  if (!Array.isArray(items)) return [];
  const merged = new Map<number, number>();
  for (const raw of items.slice(0, 100)) {
    const id = Number((raw as { id?: unknown })?.id);
    const qty = Number((raw as { qty?: unknown })?.qty);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(qty) || qty <= 0) continue;
    merged.set(id, Math.min(MAX_QTY_PER_BOOK, (merged.get(id) ?? 0) + qty));
  }
  return [...merged].map(([id, qty]) => ({ id, qty }));
}

function buildQuote(cart: CartRequest, found: (typeof products.$inferSelect)[]): Quote {
  const byId = new Map(found.map((p) => [p.id, p]));
  const lines: QuoteLine[] = cart.map(({ id, qty }) => {
    const p = byId.get(id);
    if (!p)
      return { id, titleEn: "This book is no longer available", titleUr: "", image: "", unitPrice: 0, qty, stock: 0, problem: "removed" };
    return {
      id,
      titleEn: p.titleEn,
      titleUr: p.titleUr,
      image: p.image,
      unitPrice: effectivePrice(p),
      qty,
      stock: p.stock,
      problem: p.stock === 0 ? "out" : p.stock < qty ? "short" : null,
    };
  });
  const subtotal = lines
    .filter((l) => l.problem === null)
    .reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const delivery = subtotal > 0 ? DELIVERY_CHARGE : 0;
  return {
    lines,
    subtotal,
    delivery,
    total: subtotal + delivery,
    ok: lines.length > 0 && lines.every((l) => l.problem === null),
  };
}

/** Current prices and stock for the cart — shown on the checkout page. */
export async function quoteCart(cart: CartRequest): Promise<Quote> {
  if (cart.length === 0) return buildQuote([], []);
  const found = await db.select().from(products).where(inArray(products.id, cart.map((c) => c.id)));
  return buildQuote(cart, found);
}

export type OrderDetails = {
  customerId: number | null;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  notes: string | null;
  checkoutToken: string;
};

export type PlaceResult =
  | { ok: true; orderId: number }
  | { ok: false; quote: Quote }; // stock or prices changed: nothing was ordered

/**
 * Creates a Cash on Delivery order. In one transaction:
 * locks the books, re-checks stock and prices, reduces stock, saves the order.
 * If the same checkout token was already used (double-click / retry), returns that order.
 */
export async function placeOrder(cart: CartRequest, details: OrderDetails): Promise<PlaceResult> {
  const previous = await findOrderByToken(details.checkoutToken);
  if (previous) return { ok: true, orderId: previous };

  try {
    return await db.transaction(async (tx) => {
      // Lock these books until the order is saved, so two customers cannot buy the last copy
      const found = await tx
        .select()
        .from(products)
        .where(inArray(products.id, cart.map((c) => c.id)))
        .orderBy(products.id)
        .for("update");
      const quote = buildQuote(cart, found);
      if (!quote.ok) return { ok: false as const, quote };

      for (const line of quote.lines) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.qty}` })
          .where(eq(products.id, line.id));
      }

      const [order] = await tx
        .insert(orders)
        .values({
          ...details,
          status: "pending",
          subtotal: quote.subtotal,
          deliveryCharge: quote.delivery,
          total: quote.total,
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        quote.lines.map((l) => ({
          orderId: order.id,
          productId: l.id,
          titleEn: l.titleEn,
          titleUr: l.titleUr,
          unitPrice: l.unitPrice,
          quantity: l.qty,
        })),
      );
      return { ok: true as const, orderId: order.id };
    });
  } catch (err) {
    // Two requests with the same token raced: the other one created the order
    const e = err as { code?: string; cause?: { code?: string } };
    if (e?.code === "23505" || e?.cause?.code === "23505") {
      const existing = await findOrderByToken(details.checkoutToken);
      if (existing) return { ok: true, orderId: existing };
    }
    throw err;
  }
}

async function findOrderByToken(token: string): Promise<number | null> {
  const [row] = await db.select({ id: orders.id }).from(orders).where(eq(orders.checkoutToken, token));
  return row?.id ?? null;
}
