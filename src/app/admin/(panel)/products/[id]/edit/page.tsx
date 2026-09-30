import { notFound } from "next/navigation";
import AdminHeading from "@/components/admin/AdminHeading";
import ProductForm from "@/components/admin/ProductForm";
import { getProduct } from "@/lib/products";
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

  return (
    <>
      <AdminHeading title="Edit book" subtitle={product.titleEn} />
      <ProductForm action={updateProduct.bind(null, product.id)} product={product} />
    </>
  );
}
