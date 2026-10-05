import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/admin/ActionForm";
import AdminHeading from "@/components/admin/AdminHeading";
import Field, { inputClass } from "@/components/admin/Field";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  formatDateTime,
  getOrder,
  getOrderItems,
  ORDER_STATUSES,
  orderNumber,
} from "@/lib/orders";
import { updateOrder } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const order = await getOrder(numericId);
  if (!order) notFound();
  const items = await getOrderItems(order.id);

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-block text-sm font-semibold text-muted hover:text-navy">
        ← All orders
      </Link>
      <AdminHeading
        title={`Order ${orderNumber(order.id)}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)} · Cash on Delivery`}
      />

      {saved && (
        <p role="status" className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Order updated.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* Items */}
          <section className="overflow-hidden rounded-2xl border border-cream-deep bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream-deep bg-cream text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Book</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      {item.productId ? (
                        <Link
                          href={`/admin/products/${item.productId}/edit`}
                          className="font-semibold text-navy hover:text-gold"
                        >
                          {item.titleEn}
                        </Link>
                      ) : (
                        <span className="font-semibold text-navy">
                          {item.titleEn} <span className="text-xs font-normal text-muted">(book deleted)</span>
                        </span>
                      )}
                      <p dir="rtl" lang="ur" className="font-urdu text-sm leading-8 text-ink/80">
                        {item.titleUr}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-ink/80">
                      Rs {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-ink/80">{item.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-navy">
                      Rs {(item.unitPrice * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-cream-deep text-sm">
                <tr>
                  <td colSpan={3} className="px-4 pt-3 text-right text-muted">Subtotal</td>
                  <td className="px-4 pt-3 text-right text-ink">Rs {order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 text-right text-muted">Delivery</td>
                  <td className="px-4 text-right text-ink">
                    {order.deliveryCharge === 0 ? "Free" : `Rs ${order.deliveryCharge.toLocaleString()}`}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 pb-3 text-right font-semibold text-navy">Total (cash on delivery)</td>
                  <td className="px-4 pb-3 text-right font-heading text-lg font-bold text-navy">
                    Rs {order.total.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Customer & delivery */}
          <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
            <h2 className="mb-3 font-heading text-xl font-bold text-navy">Customer &amp; delivery</h2>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="text-muted">Name</dt>
              <dd className="font-semibold text-ink">
                {order.customerName}
                {order.customerId && (
                  <Link
                    href={`/admin/customers/${order.customerId}`}
                    className="ml-2 text-xs font-semibold text-gold hover:underline"
                  >
                    View customer →
                  </Link>
                )}
                {!order.customerId && <span className="ml-2 text-xs font-normal text-muted">(guest)</span>}
              </dd>
              <dt className="text-muted">Phone</dt>
              <dd>
                <a href={`tel:${order.phone}`} className="font-semibold text-navy hover:text-gold">
                  {order.phone}
                </a>
              </dd>
              {order.email && (
                <>
                  <dt className="text-muted">Email</dt>
                  <dd>
                    <a href={`mailto:${order.email}`} className="text-navy hover:text-gold">
                      {order.email}
                    </a>
                  </dd>
                </>
              )}
              <dt className="text-muted">Address</dt>
              <dd dir="auto" className="whitespace-pre-line text-ink">
                {order.address}
                {"\n"}
                {order.city}
              </dd>
              {order.notes && (
                <>
                  <dt className="text-muted">Notes</dt>
                  <dd dir="auto" className="whitespace-pre-line text-ink">{order.notes}</dd>
                </>
              )}
            </dl>
          </section>
        </div>

        {/* Status, courier & tracking */}
        <section className="h-fit rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-navy">Status &amp; tracking</h2>
            <StatusBadge status={order.status} />
          </div>
          <ActionForm
            action={updateOrder.bind(null, order.id)}
            submitLabel="Save"
            cancelHref="/admin/orders"
          >
            <Field label="Status" htmlFor="status">
              <select id="status" name="status" defaultValue={order.status} className={inputClass}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Courier" htmlFor="courier" hint="e.g. TCS, Leopards, Pakistan Post">
              <input
                id="courier"
                name="courier"
                maxLength={80}
                defaultValue={order.courier ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Tracking number" htmlFor="trackingNumber">
              <input
                id="trackingNumber"
                name="trackingNumber"
                maxLength={80}
                defaultValue={order.trackingNumber ?? ""}
                className={inputClass}
              />
            </Field>
          </ActionForm>
          <p className="mt-4 text-xs text-muted">Last updated {formatDateTime(order.updatedAt)}</p>
        </section>
      </div>
    </>
  );
}
