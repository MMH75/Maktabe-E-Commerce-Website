import AddressForm from "@/components/account/AddressForm";
import { requireCustomer } from "@/lib/customer-auth";
import { saveAddress } from "../actions";

export default async function NewAddressPage() {
  await requireCustomer("/account/addresses/new");
  return (
    <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 font-heading text-xl font-bold text-navy">Add an address</h2>
      <AddressForm action={saveAddress.bind(null, null)} />
    </section>
  );
}
