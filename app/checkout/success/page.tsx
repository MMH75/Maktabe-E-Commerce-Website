import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { formatDateTime, getOrder, getOrderItems, orderNumber } from "@/lib/orders";

export const metadata: Metadata = { title: "Order placed — Maktaba Khuddam-ul-Quran" };
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; t?: string }>;
}) {
  const { order: orderParam, t } = await searchParams;
  const id = Number(orderParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const order = await getOrder(id);
  const customer = await getCurrentCustomer();
  // Only the person who placed it may see it: the secret checkout token, or the owner's login
  const allowed =
    order && ((t && order.checkoutToken === t) || (customer && order.customerId === customer.id));
  if (!order || !allowed) notFound();
  const items = await getOrderItems(order.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
        </div>
        <p className="eyebrow mt-4 text-gold">JazakAllah khair</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-crimson sm:text-4xl">Your order is placed</h1>
        <p className="mt-2 text-sm text-muted">
          Order number <span className="font-bold text-navy">{orderNumber(order.id)}</span> ·{" "}
          {formatDateTime(order.createdAt)}
        </p>
        <p className="mt-3 text-sm text-ink">
          We will call you on <span className="font-semibold">{order.phone}</span> to confirm. Please keep{" "}
          <span className="font-semibold">Rs {order.total.toLocaleString()}</span> ready in cash for the delivery.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
        <ul className="divide-y divide-cream-deep text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2.5">
              <span className="text-ink">
                {item.titleEn} <span className="text-muted">× {item.quantity}</span>
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
            <dt className="font-semibold text-navy">Total (cash on delivery)</dt>
            <dd className="font-heading text-xl font-bold text-navy">Rs {order.total.toLocaleString()}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-lg bg-cream p-3 text-sm">
          <p className="font-semibold text-navy">Delivering to</p>
          <p dir="auto" className="whitespace-pre-line text-ink/80">
            {order.customerName}
            {"\n"}
            {order.address}, {order.city}
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {customer && order.customerId === customer.id ? (
          <Link href={`/account/orders/${order.id}`} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-gold">
            Track this order
          </Link>
        ) : (
          <p className="w-full text-center text-xs text-muted">
            Save this page, or note your order number, to ask us about your order.
          </p>
        )}
        <Link href="/all-books" className="rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy hover:border-navy">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
