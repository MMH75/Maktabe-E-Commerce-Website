import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type { Category, Product } from "@/db/schema";
import { toProductInfo } from "@/lib/pricing";
import type { SortValue } from "@/lib/sorts";
import ProductCard from "./ProductCard";
import SortSelect from "./SortSelect";

const pill = (selected: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
    selected
      ? "border-gold bg-gold text-white"
      : "border-cream-deep bg-surface text-navy hover:border-gold hover:text-gold"
  }`;

/**
 * Shared layout for All Books, category pages, topic pages and search results:
 * heading, category/topic filter, sort menu and the book grid.
 */
export default function BookListing({
  title,
  titleUr,
  eyebrow,
  products,
  sort,
  categories,
  topics,
  activeId,
  empty,
  extra,
}: {
  title: string;
  titleUr?: string | null;
  eyebrow?: string;
  products: Product[];
  sort: SortValue;
  categories: Category[];
  topics: Category[];
  activeId?: number; // highlighted category/topic pill
  empty: ReactNode;
  extra?: ReactNode; // e.g. the search box on the search page
}) {
  const allActive = activeId === undefined && !extra; // not highlighted on the search page

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6 text-center">
        {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
        <h1 className="mt-1 font-heading text-3xl font-bold text-crimson sm:text-4xl">{title}</h1>
        {titleUr && (
          <p dir="rtl" lang="ur" className="font-urdu text-xl leading-[3rem] text-navy-soft">
            {titleUr}
          </p>
        )}
      </div>

      {extra}

      {/* Category & topic filters */}
      {categories.length > 0 && (
        <nav aria-label="Categories" className="mb-3 flex flex-wrap justify-center gap-2">
          <Link href="/all-books" aria-current={allActive ? "page" : undefined} className={pill(allActive)}>
            All books
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              aria-current={activeId === c.id ? "page" : undefined}
              className={pill(activeId === c.id)}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}
      {topics.length > 0 && (
        <nav aria-label="Topics" className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <span className="eyebrow text-muted">Topics</span>
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/topic/${t.slug}`}
              aria-current={activeId === t.id ? "page" : undefined}
              className={pill(activeId === t.id)}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-cream-deep pt-4">
        <p className="text-sm text-muted">
          {products.length} title{products.length === 1 ? "" : "s"}
        </p>
        {products.length > 1 && (
          <Suspense>
            <SortSelect value={sort} />
          </Suspense>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-cream p-8 text-center text-muted">
          {empty}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={toProductInfo(product)} />
          ))}
        </div>
      )}
    </section>
  );
}
