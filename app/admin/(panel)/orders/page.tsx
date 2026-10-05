import Link from "next/link";
import AdminHeading from "@/components/admin/AdminHeading";
import { inputClass } from "@/components/admin/Field";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDateTime, getOrders, ORDER_STATUSES, orderNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

type Search = { status?: string; from?: string; to?: string };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const filters = await searchParams;
  const rows = await getOrders(filters);
  const filtered = Boolean(filters.status || filters.from || filters.to);
  const total = rows
    .filter((r) => r.order.status !== "cancelled")
    .reduce((sum, r) => sum + r.order.total, 0);

  return (
    <>
      <AdminHeading
        title="Orders"
        subtitle={`${rows.length} order${rows.length === 1 ? "" : "s"}${
          filtered ? " match the filters" : ""
        } · Rs ${total.toLocaleString()} (excluding cancelled)`}
      />

      {/* Filters — a plain GET form, so a filtered list has its own shareable address */}
      <form className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-cream-deep bg-surface p-4 shadow-sm">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Status</span>
          <select name="status" defaultValue={filters.status ?? ""} className={`${inputClass} w-44`}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">From</span>
          <input type="date" name="from" defaultValue={filters.from ?? ""} className={`${inputClass} w-44`} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">To</span>
          <input type="date" name="to" defaultValue={filters.to ?? ""} className={`${inputClass} w-44`} />
        </label>
        <button
          type="submit"
          className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-gold"
        >
          Filter
        </button>
        {filtered && (
          <Link href="/admin/orders" className="py-2 text-sm font-semibold text-muted hover:text-navy">
            Clear filters
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          {filtered
            ? "No orders match these filters."
            : "No orders yet. They will appear here once customers can check out."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-deep bg-surface shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-cream-deep bg-cream text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 text-right font-semibold">Copies</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-deep">
              {rows.map(({ order: o, copies }) => (
                <tr key={o.id} className="align-middle">
                  <td className="px-4 py-3 font-semibold text-navy">{orderNumber(o.id)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/80">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{o.customerName}</p>
                    <p className="text-xs text-muted">
                      {o.phone} · {o.city}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-ink/80">{copies}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-navy">
                    Rs {o.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy hover:bg-navy hover:text-white"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
