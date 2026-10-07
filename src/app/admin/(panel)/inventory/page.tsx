import Image from "next/image";
import Link from "next/link";
import AdminHeading from "@/components/admin/AdminHeading";
import StockEditor from "@/components/admin/StockEditor";
import { LOW_STOCK } from "@/lib/inventory";
import { getProducts } from "@/lib/products";
import { setStock } from "./actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "all", label: "All books" },
  { value: "low", label: `Low stock (${LOW_STOCK} or fewer)` },
  { value: "out", label: "Out of stock" },
] as const;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const filter = FILTERS.some((f) => f.value === show) ? show : "all";
  const all = await getProducts();
  const books = all.filter((p) =>
    filter === "out" ? p.stock === 0 : filter === "low" ? p.stock <= LOW_STOCK : true,
  );
  const totalCopies = all.reduce((sum, p) => sum + p.stock, 0);
  const outCount = all.filter((p) => p.stock === 0).length;
  const lowCount = all.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK).length;

  return (
    <>
      <AdminHeading
        title="Inventory"
        subtitle={`${totalCopies.toLocaleString("en-US")} copies across ${all.length} books · ${lowCount} low · ${outCount} out of stock`}
      />

      <nav aria-label="Filter books" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/inventory" : `/admin/inventory?show=${f.value}`}
            aria-current={filter === f.value ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.value
                ? "border-gold bg-gold text-white"
                : "border-cream-deep bg-surface text-navy hover:border-gold hover:text-gold"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          {filter === "all" ? "No books yet." : "No books match this filter — well stocked!"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-deep bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-cream-deep bg-cream text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Book</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-deep">
              {books.map((p) => {
                const tone =
                  p.stock === 0 ? "bg-crimson/5" : p.stock <= LOW_STOCK ? "bg-gold/5" : "";
                return (
                  <tr key={p.id} className={`align-middle ${tone}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-cream">
                          <Image src={p.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-navy">{p.titleEn}</span>
                          <span dir="rtl" lang="ur" className="block font-urdu text-sm leading-8 text-ink/80">
                            {p.titleUr}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.stock === 0 ? (
                        <span className="font-semibold text-crimson">Out of stock</span>
                      ) : p.stock <= LOW_STOCK ? (
                        <span className="font-semibold text-gold">Low stock</span>
                      ) : (
                        <span className="text-emerald-700">In stock</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockEditor initial={p.stock} save={setStock.bind(null, p.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
