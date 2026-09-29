import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleUr: text("title_ur").notNull(),
  titleEn: text("title_en").notNull(),
  author: text("author").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
});

export type Product = typeof products.$inferSelect;
