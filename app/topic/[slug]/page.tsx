import { categoryMetadata, renderCategoryPage, type CategoryPageProps } from "@/components/CategoryListingPage";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: CategoryPageProps) {
  return categoryMetadata("topic", params);
}

export default function TopicPage(props: CategoryPageProps) {
  return renderCategoryPage("topic", props);
}
