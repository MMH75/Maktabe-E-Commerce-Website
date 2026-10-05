import { notFound } from "next/navigation";
import AdminHeading from "@/components/admin/AdminHeading";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/categories";
import { getProduct, getProductCategoryIds } from "@/lib/products";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const product = await getProduct(numericId);
  if (!product) notFound();
  const [categories, selectedCategoryIds] = await Promise.all([
    getCategories(),
    getProductCategoryIds(product.id),
  ]);

  return (
    <>
      <AdminHeading title="Edit book" subtitle={product.titleEn} />
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        product={product}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
      />
    </>
  );
}
