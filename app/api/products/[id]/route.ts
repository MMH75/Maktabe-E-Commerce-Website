import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }
    const product = await getProduct(numericId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error("GET /api/products/[id] failed", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
