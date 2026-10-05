"use server";

import { and, asc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import type { FormState } from "@/app/account/actions";
import { validateAddress } from "@/lib/addresses";
import { requireCustomer } from "@/lib/customer-auth";

function readAddress(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    label: text("label"),
    fullName: text("fullName"),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    isDefault: formData.get("isDefault") === "on",
  };
}

type AddressFields = ReturnType<typeof readAddress>;

function toValues(f: AddressFields): Record<string, string> {
  return { ...f, isDefault: f.isDefault ? "on" : "" };
}

export async function saveAddress(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const customer = await requireCustomer("/account/addresses");
  const f = readAddress(formData);
  if (f.label.length > 30) return { error: "Label must be 30 characters or fewer.", values: toValues(f) };
  const invalid = validateAddress(f);
  if (invalid) return { error: invalid, values: toValues(f) };

  const row = { label: f.label || null, fullName: f.fullName, phone: f.phone, address: f.address, city: f.city };

  const saved = await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: customerAddresses.id })
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customer.id));
    // The first address is always the default
    const makeDefault = f.isDefault || existing.length === 0 || (existing.length === 1 && existing[0].id === id);

    let addressId: number;
    if (id === null) {
      const [created] = await tx
        .insert(customerAddresses)
        .values({ ...row, customerId: customer.id, isDefault: false })
        .returning({ id: customerAddresses.id });
      addressId = created.id;
    } else {
      const updated = await tx
        .update(customerAddresses)
        .set(row)
        .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)))
        .returning({ id: customerAddresses.id });
      if (updated.length === 0) return null;
      addressId = id;
    }
    if (makeDefault) await setDefaultIn(tx, customer.id, addressId);
    return addressId;
  });
  if (saved === null) return { error: "This address no longer exists.", values: toValues(f) };

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function setDefaultIn(tx: Tx, customerId: number, addressId: number) {
  await tx
    .update(customerAddresses)
    .set({ isDefault: false })
    .where(and(eq(customerAddresses.customerId, customerId), ne(customerAddresses.id, addressId)));
  await tx
    .update(customerAddresses)
    .set({ isDefault: true })
    .where(and(eq(customerAddresses.customerId, customerId), eq(customerAddresses.id, addressId)));
}

export async function setDefaultAddress(id: number): Promise<void> {
  const customer = await requireCustomer("/account/addresses");
  await db.transaction((tx) => setDefaultIn(tx, customer.id, id));
  revalidatePath("/account/addresses");
}

export async function deleteAddress(id: number): Promise<void> {
  const customer = await requireCustomer("/account/addresses");
  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(customerAddresses)
      .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)))
      .returning();
    // If the default was deleted, the oldest remaining address becomes the default
    if (deleted?.isDefault) {
      const [next] = await tx
        .select({ id: customerAddresses.id })
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customer.id))
        .orderBy(asc(customerAddresses.id))
        .limit(1);
      if (next) await setDefaultIn(tx, customer.id, next.id);
    }
  });
  revalidatePath("/account/addresses");
}
