import Link from "next/link";
import ActionButton from "@/components/admin/ActionButton";
import AdminHeading from "@/components/admin/AdminHeading";
import { getCategories, getCategoryBookCounts } from "@/lib/categories";
import { deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, bookCounts] = await Promise.all([getCategories(), getCategoryBookCounts()]);

  return (
    <>
      <AdminHeading
        title="Categories & Topics"
        subtitle={`${categories.length} categor${categories.length === 1 ? "y" : "ies"} and topics`}
        action={{ href: "/admin/categories/new", label: "Add category" }}
      />

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          No categories yet. Click “Add category” to add the first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-deep bg-surface shadow-sm">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-cream-deep bg-cream text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Urdu name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 text-right font-semibold">Books</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-deep">
              {categories.map((c) => (
                <tr key={c.id} className="align-middle">
                  <td className="px-4 py-3 font-semibold text-navy">{c.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.kind === "topic" ? "bg-sky-100 text-sky-800" : "bg-navy/10 text-navy"
                      }`}
                    >
                      {c.kind === "topic" ? "Topic" : "Category"}
                    </span>
                  </td>
                  <td dir="rtl" lang="ur" className="px-4 py-3 text-right font-urdu leading-8 text-ink/80">
                    {c.nameUr ?? <span className="font-sans text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">/{c.slug}</td>
                  <td className="px-4 py-3 text-right font-semibold text-navy">
                    {bookCounts.get(c.id) ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Link
                        href={`/admin/categories/${c.id}/books`}
                        className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-gold"
                      >
                        Books
                      </Link>
                      <Link
                        href={`/admin/categories/${c.id}/edit`}
                        className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy hover:bg-navy hover:text-white"
                      >
                        Edit
                      </Link>
                      <ActionButton
                        action={deleteCategory.bind(null, c.id)}
                        confirmMessage={`Delete the category “${c.name}”? Its books are not deleted — they are only removed from this category. This cannot be undone.`}
                        className="rounded-full border border-crimson/30 px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson hover:text-white"
                      >
                        Delete
                      </ActionButton>
                    </div>
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
