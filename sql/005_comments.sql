-- Comments under each book
BEGIN;
CREATE TABLE IF NOT EXISTS comments (
  id           serial PRIMARY KEY,
  product_id   integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id  integer REFERENCES customers(id) ON DELETE SET NULL,
  author_name  text NOT NULL,
  body         text NOT NULL,
  is_hidden    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_product_id_idx ON comments (product_id, created_at DESC);
COMMIT;
