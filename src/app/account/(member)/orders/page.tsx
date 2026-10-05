import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireCustomer } from "@/lib/customer-auth";
import { formatDateTime, getCustomerOrders, orderNumber } from "@/lib/orders";

export const metadata: Metadata = { title: "My orders — Maktaba Khuddam-ul-Quran" };
export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const customer = await requireCustomer("/account/orders");
  const orders = await getCustomerOrders(customer.id);

  return (
    <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 font-heading text-xl font-bold text-navy">My orders</h2>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-muted/40 p-8 text-center text-sm text-muted">
          You have not placed any orders yet.{" "}
          <Link href="/all-books" className="font-semibold text-navy underline hover:text-gold">
            Browse books
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-cream-deep">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-cream/60"
              >
                <span>
                  <span className="block font-semibold text-navy">{orderNumber(o.id)}</span>
                  <span className="block text-xs text-muted">{formatDateTime(o.createdAt)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-navy">Rs {o.total.toLocaleString()}</span>
                  <StatusBadge status={o.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
