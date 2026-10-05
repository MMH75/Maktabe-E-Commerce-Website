import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookListing from "@/components/BookListing";
import { getCategories, getCategoryBySlug, isCategoryKind, KIND_LABEL } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { toSort } from "@/lib/sorts";

export type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string | string[] }>;
};

/** Shared by /category/[slug] and /topic/[slug]. */
export async function renderCategoryPage(kind: string, { params, searchParams }: CategoryPageProps) {
  if (!isCategoryKind(kind)) notFound();
  const { slug } = await params;
  const { sort: sortParam } = await searchParams;
  const current = await getCategoryBySlug(slug, kind);
  if (!current) notFound();

  const sort = toSort(sortParam);
  const [products, categories, topics] = await Promise.all([
    getProducts({ categoryId: current.id, sort }),
    getCategories("category"),
    getCategories("topic"),
  ]);

  return (
    <BookListing
      eyebrow={KIND_LABEL[kind].one}
      title={current.name}
      titleUr={current.nameUr}
      products={products}
      sort={sort}
      categories={categories}
      topics={topics}
      activeId={current.id}
      empty={
        <>
          No books in this {KIND_LABEL[kind].one.toLowerCase()} yet.{" "}
          <Link href="/all-books" className="font-semibold text-navy underline hover:text-gold">
            See all books
          </Link>
        </>
      }
    />
  );
}

export async function categoryMetadata(kind: string, params: CategoryPageProps["params"]): Promise<Metadata> {
  if (!isCategoryKind(kind)) return {};
  const { slug } = await params;
  const current = await getCategoryBySlug(slug, kind);
  return current ? { title: `${current.name} — Maktaba Khuddam-ul-Quran` } : {};
}
