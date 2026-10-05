import { notFound } from "next/navigation";
import AddressForm from "@/components/account/AddressForm";
import { getAddress } from "@/lib/addresses";
import { requireCustomer } from "@/lib/customer-auth";
import { saveAddress } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await requireCustomer("/account/addresses");
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();
  const address = await getAddress(customer.id, numericId);
  if (!address) notFound();

  return (
    <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 font-heading text-xl font-bold text-navy">Edit address</h2>
      <AddressForm action={saveAddress.bind(null, address.id)} address={address} />
    </section>
  );
}
