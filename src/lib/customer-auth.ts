import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { customers, type Customer } from "@/db/schema";

// Customer accounts. Completely separate from the admin login (src/lib/auth.ts):
// different cookie, different secret, different token role.

const COOKIE = "customer_session";
const SESSION_DAYS = 30;

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const MIN_PASSWORD = 8;

/** "scrypt:<salt hex>:<hash hex>" — same format as the admin password. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  const [scheme, saltHex, hashHex] = (stored ?? "").split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

function getSecret(): Uint8Array {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("CUSTOMER_SESSION_SECRET is missing from .env or shorter than 32 characters");
  return new TextEncoder().encode(secret);
}

export async function startCustomerSession(customerId: number): Promise<void> {
  const token = await new SignJWT({ role: "customer", cid: customerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * The logged-in customer, or null. Re-read from the database on every request,
 * so a customer the admin disables is logged out straight away.
 */
export const getCurrentCustomer = cache(async (): Promise<Customer | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (payload.role !== "customer" || typeof payload.cid !== "number") return null;
    const [customer] = await db.select().from(customers).where(eq(customers.id, payload.cid));
    return customer && customer.isActive ? customer : null;
  } catch {
    return null;
  }
});

/** For account pages and actions: the customer, or a redirect to the login page. */
export async function requireCustomer(returnTo = "/account"): Promise<Customer> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/account/login?next=${encodeURIComponent(returnTo)}`);
  return customer;
}

/**
 * Only allow redirects to pages on this site. Browsers treat "\" like "/", so
 * "/\evil.com" would leave the site; the address is resolved the way a browser
 * would, and anything that ends up on another host is refused.
 */
export function safeNext(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string" || next.length > 500 || !next.startsWith("/")) return fallback;
  if (/[\\\s\x00-\x1f]/.test(next)) return fallback; // backslashes, spaces, control characters
  try {
    const base = "http://same-site.invalid";
    const url = new URL(next, base);
    if (url.origin !== base) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+\-\s()]{7,20}$/;

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validEmail(email: string) {
  return EMAIL.test(email) && email.length <= 120;
}

export function validPhone(phone: string) {
  return PHONE.test(phone);
}
