-- Days 9, 14, 15, 19: topics, customer addresses, saved wishlist, checkout token
BEGIN;

-- Day 9: topics share the categories table; kind = 'category' or 'topic'
ALTER TABLE categories ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'category';

-- Day 14: saved delivery addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
  id          serial PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label       text,
  full_name   text NOT NULL,
  phone       text NOT NULL,
  address     text NOT NULL,
  city        text NOT NULL,
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Day 15: wishlist saved to the customer's account
CREATE TABLE IF NOT EXISTS wishlist_items (
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id  integer NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, product_id)
);

-- Days 19 & 22: one checkout = one order, even after a double-click
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_token text;
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_checkout_token_unique UNIQUE (checkout_token);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

COMMIT;
