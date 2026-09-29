import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getProducts();
    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/products failed", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
