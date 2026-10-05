import { db } from "@/db";
import { products } from "@/db/schema";
import { asc, lte } from "drizzle-orm";
import { LOW_STOCK } from "@/lib/pricing";

export { LOW_STOCK };

/** Books that are low or out of stock, emptiest first. */
export async function getLowStockProducts() {
  return db
    .select({
      id: products.id,
      titleEn: products.titleEn,
      titleUr: products.titleUr,
      image: products.image,
      stock: products.stock,
    })
    .from(products)
    .where(lte(products.stock, LOW_STOCK))
    .orderBy(asc(products.stock), asc(products.id));
}
