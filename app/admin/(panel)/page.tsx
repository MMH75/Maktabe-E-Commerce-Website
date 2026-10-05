import Image from "next/image";
import Link from "next/link";
import AdminHeading from "@/components/admin/AdminHeading";
import StatusBadge from "@/components/admin/StatusBadge";
import { getLowStockProducts, LOW_STOCK } from "@/lib/inventory";
import { formatDateTime, getDashboardStats, orderNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  href,
  tone = "navy",
}: {
  label: string;
  value: string;
  href: string;
  tone?: "navy" | "gold" | "crimson";
}) {
  const color = { navy: "text-navy", gold: "text-gold", crimson: "text-crimson" }[tone];
  return (
    <Link
      href={href}
      className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm transition hover:border-gold hover:shadow-md"
    >
      <p className="eyebrow text-muted">{label}</p>
      <p className={`mt-2 font-heading text-3xl font-bold ${color}`}>{value}</p>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [stats, lowStock] = await Promise.all([getDashboardStats(), getLowStockProducts()]);
  const outOfStock = lowStock.filter((p) => p.stock === 0).length;

  return (
    <>
      <AdminHeading title="Dashboard" subtitle="Today's activity at a glance (times are Pakistan time)." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's orders" value={String(stats.todayOrders)} href="/admin/orders" />
        <StatCard
          label="Today's sales"
          value={`Rs ${stats.todayRevenue.toLocaleString()}`}
          href="/admin/orders"
        />
        <StatCard
          label="Pending orders"
          value={String(stats.pendingOrders)}
          href="/admin/orders?status=pending"
          tone={stats.pendingOrders > 0 ? "gold" : "navy"}
        />
        <StatCard
          label="Low-stock books"
          value={String(lowStock.length)}
          href="/admin/inventory?show=low"
          tone={outOfStock > 0 ? "crimson" : lowStock.length > 0 ? "gold" : "navy"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-navy">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-muted hover:text-navy">
              All orders →
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No orders yet. They will appear here once customers can check out.
            </p>
          ) : (
            <ul className="divide-y divide-cream-deep">
              {stats.recent.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-cream/60"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-navy">
                        {orderNumber(o.id)} · {o.customerName}
                      </span>
                      <span className="block text-xs text-muted">{formatDateTime(o.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-navy">Rs {o.total.toLocaleString()}</span>
                      <StatusBadge status={o.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-navy">Low stock</h2>
            <Link href="/admin/inventory" className="text-sm font-semibold text-muted hover:text-navy">
              Inventory →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Every book has more than {LOW_STOCK} copies in stock.
            </p>
          ) : (
            <ul className="divide-y divide-cream-deep">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2">
                  <span className="relative h-11 w-9 shrink-0 overflow-hidden rounded bg-cream">
                    <Image src={p.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{p.titleEn}</span>
                  <span
                    className={`shrink-0 text-sm font-bold ${p.stock === 0 ? "text-crimson" : "text-gold"}`}
                  >
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
