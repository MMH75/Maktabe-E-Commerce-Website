import type { Metadata } from "next";
import Link from "next/link";
import BookListing from "@/components/BookListing";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { toSort } from "@/lib/sorts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search — Maktaba Khuddam-ul-Quran" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>;
}) {
  const { q: qParam, sort: sortParam } = await searchParams;
  const q = (typeof qParam === "string" ? qParam : "").trim().slice(0, 100);
  const sort = toSort(sortParam);
  const [products, categories, topics] = await Promise.all([
    q ? getProducts({ search: q, sort }) : Promise.resolve([]),
    getCategories("category"),
    getCategories("topic"),
  ]);

  return (
    <BookListing
      eyebrow="Search"
      title={q ? `Results for “${q}”` : "Search books"}
      products={products}
      sort={sort}
      categories={categories}
      topics={topics}
      extra={
        <form action="/search" role="search" className="mx-auto mb-6 flex max-w-xl gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Title in English or Urdu, or author"
            aria-label="Search books"
            className="w-full rounded-full border border-cream-deep bg-surface px-5 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <button
            type="submit"
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gold"
          >
            Search
          </button>
        </form>
      }
      empty={
        q ? (
          <>
            No books match “{q}”. Try a shorter word, or{" "}
            <Link href="/all-books" className="font-semibold text-navy underline hover:text-gold">
              browse all books
            </Link>
            .
          </>
        ) : (
          "Type a book title (English or Urdu) or an author's name above."
        )
      }
    />
  );
}
