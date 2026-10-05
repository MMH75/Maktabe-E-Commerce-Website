import { redirect } from "next/navigation";
import BookListing from "@/components/BookListing";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { toSort } from "@/lib/sorts";

export const dynamic = "force-dynamic";

export default async function AllBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; sort?: string | string[] }>;
}) {
  const { category, sort: sortParam } = await searchParams;
  // Old filter links (/all-books?category=tafseer) now live at /category/tafseer
  if (typeof category === "string" && category) redirect(`/category/${encodeURIComponent(category)}`);

  const sort = toSort(sortParam);
  const [products, categories, topics] = await Promise.all([
    getProducts({ sort }),
    getCategories("category"),
    getCategories("topic"),
  ]);

  return (
    <BookListing
      title="All Books"
      products={products}
      sort={sort}
      categories={categories}
      topics={topics}
      empty="No books are available right now."
    />
  );
}
