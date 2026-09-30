import Image from "next/image";
import Link from "next/link";
import ActionButton from "@/components/admin/ActionButton";
import AdminHeading from "@/components/admin/AdminHeading";
import { getProducts } from "@/lib/products";
import { deleteProduct } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <>
      <AdminHeading
        title="Books"
        subtitle={`${products.length} book${products.length === 1 ? "" : "s"} in the store`}
        action={{ href: "/admin/products/new", label: "Add book" }}
      />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-surface p-10 text-center text-muted">
          No books yet. Click “Add book” to add the first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-deep bg-surface shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-cream-deep bg-cream text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Book</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-deep">
              {products.map((p) => (
                <tr key={p.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-cream">
                        <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{p.titleEn}</p>
                        <p dir="rtl" lang="ur" className="font-urdu text-sm leading-8 text-ink/80">
                          {p.titleUr}
                        </p>
                        <p className="text-xs text-muted">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td dir="auto" className="px-4 py-3 text-ink/80">{p.author}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-navy">
                    Rs {p.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Link
                        href={`/products/${p.id}`}
                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:text-navy"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy hover:bg-navy hover:text-white"
                      >
                        Edit
                      </Link>
                      <ActionButton
                        action={deleteProduct.bind(null, p.id)}
                        confirmMessage={`Delete “${p.titleEn}”? This cannot be undone.`}
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
