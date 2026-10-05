import type { Metadata } from "next";
import CheckoutView from "@/components/CheckoutView";
import { getAddresses } from "@/lib/addresses";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "Checkout — Maktaba Khuddam-ul-Quran" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();
  const addresses = customer ? await getAddresses(customer.id) : [];

  return (
    <CheckoutView
      customer={customer && { name: customer.name, email: customer.email, phone: customer.phone ?? "" }}
      addresses={addresses.map((a) => ({
        id: a.id,
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        address: a.address,
        city: a.city,
        isDefault: a.isDefault,
      }))}
    />
  );
}
