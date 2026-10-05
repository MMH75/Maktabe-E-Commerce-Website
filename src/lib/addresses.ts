import { db } from "@/db";
import { customerAddresses, type CustomerAddress } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { validPhone } from "@/lib/customer-auth";

/** A customer's saved addresses, default first. */
export async function getAddresses(customerId: number): Promise<CustomerAddress[]> {
  return db
    .select()
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, customerId))
    .orderBy(desc(customerAddresses.isDefault), asc(customerAddresses.id));
}

/** One address — only if it belongs to this customer. */
export async function getAddress(customerId: number, id: number): Promise<CustomerAddress | null> {
  const rows = await db
    .select()
    .from(customerAddresses)
    .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customerId)));
  return rows[0] ?? null;
}

/** Shared by the address book and checkout. Returns an error message, or null. */
export function validateAddress(f: { fullName: string; phone: string; address: string; city: string }): string | null {
  if (!f.fullName || f.fullName.length > 80) return "Please enter the full name (up to 80 characters).";
  if (!validPhone(f.phone)) return "Please enter a valid phone number, e.g. 0300 1234567.";
  if (f.address.length < 8 || f.address.length > 300)
    return "Please enter the full address: house, street and area (8–300 characters).";
  if (!f.city || f.city.length > 60) return "Please enter the city.";
  return null;
}
