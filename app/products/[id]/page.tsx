import { notFound } from "next/navigation";
import ProductComments from "@/components/ProductComments";
import ProductView from "@/components/ProductView";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({
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
      <ProductView product={product} />
      <ProductComments productId={product.id} />
    </>
  );
}
