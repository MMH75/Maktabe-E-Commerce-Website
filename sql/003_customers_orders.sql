-- Days 24–29: customers and orders (applied)
BEGIN;
CREATE TABLE IF NOT EXISTS customers (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text,
  password_hash text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customers_email_unique UNIQUE (email)
);
CREATE TABLE IF NOT EXISTS orders (
  id              serial PRIMARY KEY,
  customer_id     integer REFERENCES customers(id) ON DELETE SET NULL,
  customer_name   text NOT NULL,
  phone           text NOT NULL,
  email           text,
  address         text NOT NULL,
  city            text NOT NULL,
  notes           text,
  status          text NOT NULL DEFAULT 'pending',
  subtotal        integer NOT NULL,
  delivery_charge integer NOT NULL DEFAULT 0,
  total           integer NOT NULL,
  courier         text,
  tracking_number text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
  id          serial PRIMARY KEY,
  order_id    integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  integer REFERENCES products(id) ON DELETE SET NULL,
  title_en    text NOT NULL,
  title_ur    text NOT NULL,
  unit_price  integer NOT NULL,
  quantity    integer NOT NULL
);
COMMIT;
