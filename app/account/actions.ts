"use server";

import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { customers } from "@/db/schema";
import {
  endCustomerSession,
  hashPassword,
  MIN_PASSWORD,
  normaliseEmail,
  requireCustomer,
  safeNext,
  startCustomerSession,
  validEmail,
  validPhone,
  verifyPassword,
} from "@/lib/customer-auth";

/** Returned to the form: an error or success message, plus what was typed (so it is not lost). */
export type FormState = { error?: string; success?: string; values?: Record<string, string> } | undefined;

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

function isUniqueViolation(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

// ---- Sign up (day 11) ----

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  const email = normaliseEmail(text(formData, "email"));
  const phone = text(formData, "phone");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const values = { name, email, phone };

  if (!name || name.length > 80) return { error: "Please enter your name (up to 80 characters).", values };
  if (!validEmail(email)) return { error: "Please enter a valid email address.", values };
  if (phone && !validPhone(phone)) return { error: "Please enter a valid phone number, e.g. 0300 1234567.", values };
  if (password.length < MIN_PASSWORD)
    return { error: `Password must be at least ${MIN_PASSWORD} characters.`, values };
  if (password.length > 200) return { error: "Password is too long.", values };
  if (password !== confirm) return { error: "The two passwords do not match.", values };

  const passwordHash = await hashPassword(password);
  let id: number;
  try {
    const [created] = await db
      .insert(customers)
      .values({ name, email, phone: phone || null, passwordHash })
      .returning({ id: customers.id });
    id = created.id;
  } catch (err) {
    if (isUniqueViolation(err))
      return { error: "An account with this email already exists. Please log in instead.", values };
    console.error("register failed", err);
    return { error: "Could not create your account. Please try again.", values };
  }

  await startCustomerSession(id);
  redirect(safeNext(formData.get("next")));
}

// ---- Log in / out (day 12) ----

// Wrong-password attempts per IP, in memory (reset when the server restarts)
const MAX_FAILURES = 8;
const LOCKOUT_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; firstAt: number }>();

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function loginCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normaliseEmail(text(formData, "email"));
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const ip = await clientIp();
  const record = failures.get(ip);
  if (record && Date.now() - record.firstAt > LOCKOUT_MS) failures.delete(ip);
  const current = failures.get(ip);
  if (current && current.count >= MAX_FAILURES)
    return { error: "Too many wrong attempts. Please wait 15 minutes and try again.", values };

  const [customer] = await db.select().from(customers).where(eq(customers.email, email));
  const ok = customer ? await verifyPassword(password, customer.passwordHash) : false;
  if (!customer || !ok) {
    failures.set(ip, { count: (current?.count ?? 0) + 1, firstAt: current?.firstAt ?? Date.now() });
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return { error: "Incorrect email or password.", values };
  }
  if (!customer.isActive)
    return { error: "This account has been disabled. Please contact us for help.", values };

  failures.delete(ip);
  await startCustomerSession(customer.id);
  redirect(safeNext(formData.get("next")));
}

export async function logoutCustomer(): Promise<void> {
  await endCustomerSession();
  redirect("/");
}

// ---- Profile (day 13) ----

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  const name = text(formData, "name");
  const email = normaliseEmail(text(formData, "email"));
  const phone = text(formData, "phone");
  const values = { name, email, phone };

  if (!name || name.length > 80) return { error: "Please enter your name (up to 80 characters).", values };
  if (!validEmail(email)) return { error: "Please enter a valid email address.", values };
  if (phone && !validPhone(phone)) return { error: "Please enter a valid phone number, e.g. 0300 1234567.", values };

  const [taken] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.email, email), ne(customers.id, customer.id)));
  if (taken) return { error: "Another account already uses this email.", values };

  try {
    await db
      .update(customers)
      .set({ name, email, phone: phone || null })
      .where(eq(customers.id, customer.id));
  } catch (err) {
    if (isUniqueViolation(err)) return { error: "Another account already uses this email.", values };
    throw err;
  }
  return { success: "Your details have been saved.", values };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  const currentPassword = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!(await verifyPassword(currentPassword, customer.passwordHash)))
    return { error: "Your current password is not correct." };
  if (password.length < MIN_PASSWORD) return { error: `New password must be at least ${MIN_PASSWORD} characters.` };
  if (password.length > 200) return { error: "Password is too long." };
  if (password !== confirm) return { error: "The two new passwords do not match." };

  await db
    .update(customers)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(customers.id, customer.id));
  return { success: "Your password has been changed." };
}
