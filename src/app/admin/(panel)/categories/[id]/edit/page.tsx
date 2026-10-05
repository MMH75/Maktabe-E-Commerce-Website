import { notFound } from "next/navigation";
import AdminHeading from "@/components/admin/AdminHeading";
import CategoryForm from "@/components/admin/CategoryForm";
import { getCategory } from "@/lib/categories";
import { updateCategory } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const category = await getCategory(numericId);
  if (!category) notFound();

  return (
    <>
      <AdminHeading title="Edit category" subtitle={category.name} />
      <CategoryForm action={updateCategory.bind(null, category.id)} category={category} />
    </>
  );
}
