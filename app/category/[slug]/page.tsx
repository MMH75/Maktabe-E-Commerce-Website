import { categoryMetadata, renderCategoryPage, type CategoryPageProps } from "@/components/CategoryListingPage";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: CategoryPageProps) {
  return categoryMetadata("category", params);
}

export default function CategoryPage(props: CategoryPageProps) {
  return renderCategoryPage("category", props);
}
