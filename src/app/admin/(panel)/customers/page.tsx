import Link from "next/link";
import AdminHeading from "@/components/admin/AdminHeading";
import { inputClass } from "@/components/admin/Field";
import { getCustomers } from "@/lib/customers";
import { formatDate } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rows = await getCustomers(q);

  return (
    <>
      <AdminHeading
        title="Customers"
        subtitle={`${rows.length} customer${rows.length === 1 ? "" : "s"}${q ? ` matching “${q}”` : ""}`}
      />

      <form className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, email or phone"
          className={`${inputClass} max-w-sm`}
        />
        <button
          type="submit"
          className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-gold"
        >
          Search
        </button>
        {q && (
          <Link href="/admin/customers" className="text-sm font-semibold text-muted hover:text-navy">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          {q
            ? "No customers match this search."
            : "No customers yet. They will appear here once customer sign-up is added."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-deep bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-cream-deep bg-cream text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Orders</th>
                <th className="px-4 py-3 text-right font-semibold">Spent</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-deep">
              {rows.map(({ customer: c, orderCount, spent }) => (
                <tr key={c.id} className="align-middle">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{c.name}</p>
                    <p className="text-xs text-muted">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{c.phone ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/80">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right text-ink/80">{orderCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-navy">
                    Rs {spent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-crimson/10 px-2.5 py-0.5 text-xs font-semibold text-crimson">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
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
