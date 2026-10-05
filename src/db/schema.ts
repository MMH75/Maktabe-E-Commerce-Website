import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleUr: text("title_ur").notNull(),
  titleEn: text("title_en").notNull(),
  author: text("author").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  salePrice: integer("sale_price"), // null = not on sale
  pages: integer("pages"),
  paperQuality: text("paper_quality"),
  weight: integer("weight"), // grams
  stock: integer("stock").notNull().default(0),
});

export type Product = typeof products.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameUr: text("name_ur"), // optional Urdu name
  // "category" (e.g. Tafseer) or "topic" (topical division, e.g. Prayer, Family)
  kind: text("kind").notNull().default("category"),
  slug: text("slug").notNull().unique(), // used in URLs, e.g. /category/tafseer
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;

// Which books are in which categories (a book can be in several).
// Deleting a book or a category removes its links automatically.
export const productCategories = pgTable(
  "product_categories",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })],
);

export const posters = pgTable("posters", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull().default(""),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Poster = typeof posters.$inferSelect;

// ===== Customers & orders =====
// The admin side (dashboard, orders, customers) is built on these tables now;
// checkout and customer sign-up (plan days 11–23) will write to them.

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash"), // filled in by customer sign-up later
  isActive: boolean("is_active").notNull().default(true), // false = disabled by admin
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Customer = typeof customers.$inferSelect;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  // null for guest orders; kept (set null) if the customer account is removed
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  // Contact & delivery details are copied onto the order so it never changes afterwards
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // see ORDER_STATUSES in src/lib/orders.ts
  subtotal: integer("subtotal").notNull(), // Rs
  deliveryCharge: integer("delivery_charge").notNull().default(0), // Rs
  total: integer("total").notNull(), // Rs
  courier: text("courier"),
  trackingNumber: text("tracking_number"),
  // Random token from the checkout page: stops double-clicks creating two orders,
  // and lets a guest open their own confirmation page
  checkoutToken: text("checkout_token").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // null if the book is later deleted; the title and price below are kept
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  titleEn: text("title_en").notNull(),
  titleUr: text("title_ur").notNull(),
  unitPrice: integer("unit_price").notNull(), // Rs, price paid per copy
  quantity: integer("quantity").notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

export const customerAddresses = pgTable("customer_addresses", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  label: text("label"), // e.g. Home, Office
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CustomerAddress = typeof customerAddresses.$inferSelect;

// Wishlist of logged-in customers (guests keep theirs in the browser)
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.customerId, t.productId] })],
);

// Comments under each book. Written by logged-in customers; the admin can hide or delete them.
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  // kept (set null) if the customer account is removed; the name below stays
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false), // hidden by the admin
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("comments_product_id_idx").on(t.productId, t.createdAt.desc())]);

export type Comment = typeof comments.$inferSelect;
