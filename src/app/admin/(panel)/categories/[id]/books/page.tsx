import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/admin/ActionForm";
import AdminHeading from "@/components/admin/AdminHeading";
import { getCategory, getCategoryProductIds } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { setCategoryBooks } from "../../actions";

export const dynamic = "force-dynamic";

export default async function CategoryBooksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const category = await getCategory(numericId);
  if (!category) notFound();
  const [books, selectedIds] = await Promise.all([
    getProducts(),
    getCategoryProductIds(category.id),
  ]);
  const selected = new Set(selectedIds);

  return (
    <>
      <AdminHeading
        title={`Books in “${category.name}”`}
        subtitle="Tick every book that belongs in this category, then save. A book can be in several categories."
      />

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          There are no books yet.{" "}
          <Link href="/admin/products/new" className="font-semibold text-navy underline hover:text-gold">
            Add a book
          </Link>{" "}
          first.
        </div>
      ) : (
        <div className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-8">
          <ActionForm
            action={setCategoryBooks.bind(null, category.id)}
            submitLabel="Save books"
            cancelHref="/admin/categories"
          >
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((b) => (
                <li key={b.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-cream-deep p-3 transition hover:border-gold has-[:checked]:border-gold has-[:checked]:bg-gold/10">
                    <input
                      type="checkbox"
                      name="productIds"
                      value={b.id}
                      defaultChecked={selected.has(b.id)}
                      className="h-5 w-5 shrink-0 accent-[var(--mk-gold)]"
                    />
                    <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-cream">
                      <Image src={b.image} alt="" fill sizes="48px" className="object-contain p-0.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-navy">{b.titleEn}</span>
                      <span dir="rtl" lang="ur" className="block truncate font-urdu text-sm leading-8 text-ink/80">
                        {b.titleUr}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </ActionForm>
        </div>
      )}
    </>
  );
}
