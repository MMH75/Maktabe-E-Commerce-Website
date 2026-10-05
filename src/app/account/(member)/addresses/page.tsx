import type { Metadata } from "next";
import Link from "next/link";
import ActionButton from "@/components/admin/ActionButton";
import { getAddresses } from "@/lib/addresses";
import { requireCustomer } from "@/lib/customer-auth";
import { deleteAddress, setDefaultAddress } from "./actions";

export const metadata: Metadata = { title: "My addresses — Maktaba Khuddam-ul-Quran" };
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const customer = await requireCustomer("/account/addresses");
  const addresses = await getAddresses(customer.id);

  return (
    <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-navy">Delivery addresses</h2>
        <Link
          href="/account/addresses/new"
          className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-gold"
        >
          + Add address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-muted/40 p-8 text-center text-sm text-muted">
          No saved addresses yet. Add one to check out faster.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className={`flex flex-col rounded-xl border p-4 ${a.isDefault ? "border-gold bg-gold/5" : "border-cream-deep"}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-navy">{a.label || "Address"}</span>
                {a.isDefault && (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-white">Default</span>
                )}
              </div>
              <p className="text-sm text-ink">{a.fullName}</p>
              <p className="text-sm text-ink/80">{a.phone}</p>
              <p dir="auto" className="whitespace-pre-line text-sm text-ink/80">
                {a.address}
                {"\n"}
                {a.city}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/account/addresses/${a.id}/edit`}
                  className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy hover:bg-navy hover:text-white"
                >
                  Edit
                </Link>
                {!a.isDefault && (
                  <ActionButton
                    action={setDefaultAddress.bind(null, a.id)}
                    className="rounded-full border border-gold/50 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold hover:text-white"
                  >
                    Make default
                  </ActionButton>
                )}
                <ActionButton
                  action={deleteAddress.bind(null, a.id)}
                  confirmMessage="Delete this address?"
                  className="rounded-full border border-crimson/30 px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson hover:text-white"
                >
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
