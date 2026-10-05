import Image from "next/image";
import ActionForm from "@/components/admin/ActionForm";
import AdminHeading from "@/components/admin/AdminHeading";
import Field, { inputClass } from "@/components/admin/Field";
import SalePriceEditor from "@/components/admin/SalePriceEditor";
import { getCategories } from "@/lib/categories";
import { isOnSale } from "@/lib/pricing";
import { getProducts } from "@/lib/products";
import { applyBulkDiscount, removeBulkDiscount, setSalePrice } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; count?: string; percent?: string }>;
}) {
  const { done, count, percent } = await searchParams;
  const [books, categories] = await Promise.all([getProducts(), getCategories()]);
  const onSale = books.filter(isOnSale).length;

  const targetSelect = (id: string) => (
    <select id={id} name="target" required defaultValue="" className={inputClass}>
      <option value="" disabled>
        Choose…
      </option>
      <option value="all">All books</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.kind === "topic" ? "Topic" : "Category"}: {c.name}
        </option>
      ))}
    </select>
  );

  return (
    <>
      <AdminHeading
        title="Discounts"
        subtitle={`${onSale} of ${books.length} books are on sale. Customers see the sale price, the old price crossed out, and a “% OFF” badge.`}
      />

      {done && (
        <p role="status" className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {done === "applied"
            ? `${count} book(s) are now ${percent}% off.`
            : `${count} book(s) were taken off sale.`}
        </p>
      )}

      {/* Bulk tools */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
          <h2 className="mb-1 font-heading text-xl font-bold text-navy">Bulk discount</h2>
          <p className="mb-4 text-sm text-muted">
            Puts every chosen book on sale at a percentage off its regular price. Replaces any sale price they had.
          </p>
          <ActionForm action={applyBulkDiscount} submitLabel="Apply discount" cancelHref="/admin">
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <Field label="Books" htmlFor="apply-target">
                {targetSelect("apply-target")}
              </Field>
              <Field label="Percent off" htmlFor="percent">
                <input
                  id="percent"
                  name="percent"
                  type="number"
                  min={1}
                  max={90}
                  step={1}
                  required
                  placeholder="e.g. 20"
                  className={inputClass}
                />
              </Field>
            </div>
          </ActionForm>
        </section>

        <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm">
          <h2 className="mb-1 font-heading text-xl font-bold text-navy">End a sale</h2>
          <p className="mb-4 text-sm text-muted">
            Removes the sale price from every chosen book, so they go back to their regular price.
          </p>
          <ActionForm action={removeBulkDiscount} submitLabel="Remove sale prices" cancelHref="/admin">
            <Field label="Books" htmlFor="remove-target">
              {targetSelect("remove-target")}
            </Field>
          </ActionForm>
        </section>
      </div>

      {/* Per-book sale prices */}
      <h2 className="mb-3 font-heading text-xl font-bold text-navy">Sale price per book</h2>
      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          No books yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-deep bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-cream-deep bg-cream text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Book</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 text-right font-semibold">Sale price (empty = no sale)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-deep">
              {books.map((p) => (
                <tr key={p.id} className={`align-middle ${isOnSale(p) ? "bg-gold/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-cream">
                        <Image src={p.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                      </span>
                      <span className="font-semibold text-navy">{p.titleEn}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-ink/80">
                    Rs {p.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <SalePriceEditor
                      price={p.price}
                      initial={isOnSale(p) ? p.salePrice : null}
                      save={setSalePrice.bind(null, p.id)}
                    />
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
