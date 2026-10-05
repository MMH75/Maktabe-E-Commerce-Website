import AdminHeading from "@/components/admin/AdminHeading";
import CategoryForm from "@/components/admin/CategoryForm";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <>
      <AdminHeading title="Add a category" />
      <CategoryForm action={createCategory} />
    </>
  );
}
