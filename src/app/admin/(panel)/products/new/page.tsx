import AdminHeading from "@/components/admin/AdminHeading";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <>
      <AdminHeading title="Add a book" />
      <ProductForm action={createProduct} />
    </>
  );
}
