import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireCustomer } from "@/lib/customer-auth";
import { formatDateTime, getOrder, getOrderItems, ORDER_STATUSES, orderNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

// The normal journey of an order; "cancelled" is shown separately
const STEPS = ORDER_STATUSES.filter((s) => s.value !== "cancelled");

export default async function MyOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await requireCustomer("/account/orders");
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const order = await getOrder(numericId);
  // Customers can only open their own orders
  if (!order || order.customerId !== customer.id) notFound();
  const items = await getOrderItems(order.id);
  const cancelled = order.status === "cancelled";
  const reached = STEPS.findIndex((s) => s.value === order.status);

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="text-sm font-semibold text-muted hover:text-navy">
        ← My orders
      </Link>

      <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold text-navy">Order {orderNumber(order.id)}</h2>
            <p className="text-xs text-muted">Placed {formatDateTime(order.createdAt)} · Cash on Delivery</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Status timeline */}
        {cancelled ? (
          <p className="rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
            This order was cancelled. Please contact us if you have any questions.
          </p>
        ) : (
          <ol className="grid grid-cols-4 gap-1">
            {STEPS.map((step, i) => {
              const done = i <= reached;
              return (
                <li key={step.value} className="text-center">
                  <div className={`h-1.5 rounded-full ${done ? "bg-gold" : "bg-cream-deep"}`} />
                  <p className={`mt-2 text-xs font-semibold ${done ? "text-navy" : "text-muted"}`}>
                    {step.value === "pending" ? "Placed" : step.label}
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        {(order.courier || order.trackingNumber) && (
          <div className="mt-5 rounded-lg bg-cream p-3 text-sm">
            <span className="font-semibold text-navy">Shipped with {order.courier ?? "courier"}</span>
            {order.trackingNumber && (
              <span className="text-ink/80">
                {" "}
                · Tracking number <span className="font-mono font-semibold">{order.trackingNumber}</span>
              </span>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="mb-2 font-heading text-lg font-bold text-navy">Books</h3>
        <ul className="divide-y divide-cream-deep text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2.5">
              <span className="text-ink">
                {item.productId ? (
                  <Link href={`/products/${item.productId}`} className="hover:text-gold">
                    {item.titleEn}
                  </Link>
                ) : (
                  item.titleEn
                )}{" "}
                <span className="text-muted">
                  × {item.quantity} @ Rs {item.unitPrice.toLocaleString()}
                </span>
              </span>
              <span className="whitespace-nowrap font-semibold text-navy">
                Rs {(item.unitPrice * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-1 border-t border-cream-deep pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd>{order.deliveryCharge === 0 ? "Free" : `Rs ${order.deliveryCharge.toLocaleString()}`}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-semibold text-navy">Total</dt>
            <dd className="font-heading text-xl font-bold text-navy">Rs {order.total.toLocaleString()}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-lg bg-cream p-3 text-sm">
          <p className="font-semibold text-navy">Delivering to</p>
          <p dir="auto" className="whitespace-pre-line text-ink/80">
            {order.customerName} · {order.phone}
            {"\n"}
            {order.address}, {order.city}
          </p>
        </div>
      </section>
    </div>
  );
}
