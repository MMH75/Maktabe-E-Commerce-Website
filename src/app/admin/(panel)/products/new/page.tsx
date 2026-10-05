import AdminHeading from "@/components/admin/AdminHeading";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/categories";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <>
      <AdminHeading title="Add a book" />
      <ProductForm action={createProduct} categories={categories} />
    </>
  );
}
