"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/account/actions";
import type { CustomerAddress } from "@/db/schema";
import { FieldRow, FormMessage, inputClass, SubmitButton } from "./ui";

export default function AddressForm({
  action,
  address,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  address?: CustomerAddress;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = state?.values ?? {
    label: address?.label ?? "",
    fullName: address?.fullName ?? "",
    phone: address?.phone ?? "",
    address: address?.address ?? "",
    city: address?.city ?? "",
    isDefault: address?.isDefault ? "on" : "",
  };

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Label" htmlFor="label" optional hint="e.g. Home, Office">
          <input id="label" name="label" maxLength={30} defaultValue={v.label} className={inputClass} />
        </FieldRow>
        <FieldRow label="Full name" htmlFor="fullName">
          <input id="fullName" name="fullName" required maxLength={80} autoComplete="name" defaultValue={v.fullName} className={inputClass} />
        </FieldRow>
        <FieldRow label="Phone" htmlFor="phone">
          <input id="phone" name="phone" type="tel" required autoComplete="tel" defaultValue={v.phone} className={inputClass} />
        </FieldRow>
        <FieldRow label="City" htmlFor="city">
          <input id="city" name="city" required maxLength={60} autoComplete="address-level2" defaultValue={v.city} className={inputClass} />
        </FieldRow>
      </div>
      <FieldRow label="Address" htmlFor="address" hint="House number, street, area / town">
        <textarea
          id="address"
          name="address"
          required
          rows={3}
          minLength={8}
          maxLength={300}
          autoComplete="street-address"
          defaultValue={v.address}
          className={inputClass}
        />
      </FieldRow>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="isDefault" defaultChecked={v.isDefault === "on"} className="h-4 w-4 accent-[var(--mk-gold)]" />
        Use as my default delivery address
      </label>
      <FormMessage error={state?.error} />
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending} pendingText="Saving…">Save address</SubmitButton>
        <Link href="/account/addresses" className="text-sm font-semibold text-muted hover:text-navy">
          Cancel
        </Link>
      </div>
    </form>
  );
}
