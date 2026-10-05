"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import { validateAddress } from "@/lib/addresses";
import { cleanCart, placeOrder, quoteCart, type Quote } from "@/lib/checkout";
import { getCurrentCustomer, normaliseEmail, validEmail } from "@/lib/customer-auth";

/** Live prices and stock for the cart shown on the checkout page. */
export async function getQuote(items: { id: number; qty: number }[]): Promise<Quote> {
  return quoteCart(cleanCart(items));
}

export type CheckoutInput = {
  token: string;
  items: { id: number; qty: number }[];
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  saveAddress: boolean;
};

export type CheckoutResult =
  | { ok: true; orderId: number; token: string }
  | { ok: false; error: string; quote?: Quote };

const TOKEN = /^[A-Za-z0-9-]{16,64}$/;

export async function submitOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const token = str(input?.token, 64);
  if (!TOKEN.test(token)) return { ok: false, error: "Please reload the page and try again." };

  const cart = cleanCart(input?.items);
  if (cart.length === 0) return { ok: false, error: "Your cart is empty." };

  const fields = {
    fullName: str(input.fullName, 200),
    phone: str(input.phone, 40),
    address: str(input.address, 400),
    city: str(input.city, 100),
  };
  const invalid = validateAddress(fields);
  if (invalid) return { ok: false, error: invalid };
  const email = normaliseEmail(str(input.email, 200));
  if (email && !validEmail(email)) return { ok: false, error: "Please enter a valid email address, or leave it empty." };
  const notes = str(input.notes, 500);

  const customer = await getCurrentCustomer();
  let result;
  try {
    result = await placeOrder(cart, {
      customerId: customer?.id ?? null,
      customerName: fields.fullName,
      phone: fields.phone,
      email: email || customer?.email || null,
      address: fields.address,
      city: fields.city,
      notes: notes || null,
      checkoutToken: token,
    });
  } catch (err) {
    console.error("submitOrder failed", err);
    return { ok: false, error: "Sorry, we could not place your order. Please try again." };
  }

  if (!result.ok) {
    return {
      ok: false,
      error: "Some books in your cart changed (price or stock). Please review your order below.",
      quote: result.quote,
    };
  }

  // Logged-in customers can save the delivery address for next time
  if (customer && input.saveAddress) {
    const existing = await db
      .select({ id: customerAddresses.id })
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customer.id));
    await db.insert(customerAddresses).values({
      customerId: customer.id,
      fullName: fields.fullName,
      phone: fields.phone,
      address: fields.address,
      city: fields.city,
      isDefault: existing.length === 0,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout"); // stock changed on book pages and cards
  return { ok: true, orderId: result.orderId, token };
}
