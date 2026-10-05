-- Day 3: categories (applied)
BEGIN;
CREATE TABLE IF NOT EXISTS categories (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  name_ur     text,
  slug        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_unique UNIQUE (name),
  CONSTRAINT categories_slug_unique UNIQUE (slug)
);
CREATE TABLE IF NOT EXISTS product_categories (
  product_id  integer NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);
COMMIT;
