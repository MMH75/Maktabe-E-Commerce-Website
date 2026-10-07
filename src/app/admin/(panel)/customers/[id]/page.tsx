import Link from "next/link";
import { notFound } from "next/navigation";
import ActionButton from "@/components/admin/ActionButton";
import AdminHeading from "@/components/admin/AdminHeading";
import StatusBadge from "@/components/admin/StatusBadge";
import { getCustomer } from "@/lib/customers";
import { formatDate, formatDateTime, getCustomerOrders, orderNumber } from "@/lib/orders";
import { setCustomerActive } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const customer = await getCustomer(numericId);
  if (!customer) notFound();
  const orders = await getCustomerOrders(customer.id);
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <Link href="/admin/customers" className="mb-3 inline-block text-sm font-semibold text-muted hover:text-navy">
        ← All customers
      </Link>
      <AdminHeading title={customer.name} subtitle={`Customer since ${formatDate(customer.createdAt)}`} />

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Profile */}
        <section className="h-fit rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd>
                <a href={`mailto:${customer.email}`} className="font-semibold text-navy hover:text-gold">
                  {customer.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="font-semibold text-ink">
                {customer.phone ? (
                  <a href={`tel:${customer.phone}`} className="text-navy hover:text-gold">
                    {customer.phone}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Orders</dt>
              <dd className="font-semibold text-ink">
                {orders.length} · Rs {spent.toLocaleString("en-US")} spent
              </dd>
            </div>
            <div>
              <dt className="text-muted">Account</dt>
              <dd className="font-semibold">
                {customer.isActive ? (
                  <span className="text-emerald-700">Active</span>
                ) : (
                  <span className="text-crimson">Disabled — cannot log in</span>
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-cream-deep pt-4">
            {customer.isActive ? (
              <ActionButton
                action={setCustomerActive.bind(null, customer.id, false)}
                confirmMessage={`Disable ${customer.name}'s account? They will not be able to log in. Their past orders are kept.`}
                className="w-full rounded-full border border-crimson/30 px-4 py-2 text-sm font-semibold text-crimson hover:bg-crimson hover:text-white"
              >
                Disable account
              </ActionButton>
            ) : (
              <ActionButton
                action={setCustomerActive.bind(null, customer.id, true)}
                className="w-full rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-gold"
              >
                Enable account
              </ActionButton>
            )}
          </div>
        </section>

        {/* Orders */}
        <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-heading text-xl font-bold text-navy">Orders</h2>
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">This customer has not placed any orders yet.</p>
          ) : (
            <ul className="divide-y divide-cream-deep">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-cream/60"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-navy">{orderNumber(o.id)}</span>
                      <span className="block text-xs text-muted">{formatDateTime(o.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-navy">Rs {o.total.toLocaleString("en-US")}</span>
                      <StatusBadge status={o.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
