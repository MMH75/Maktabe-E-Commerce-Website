import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AllBooksPage() {
  const products = await getProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-crimson sm:text-4xl">
          All Books
        </h1>
        <p className="mt-3 text-sm text-muted">
          {products.length} title{products.length === 1 ? "" : "s"} available
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-cream p-8 text-center text-muted">
          No books are available right now.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                titleUr: product.titleUr,
                titleEn: product.titleEn,
                price: product.price,
                image: product.image,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
