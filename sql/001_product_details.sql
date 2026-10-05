-- Day 2: book details (applied)
BEGIN;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_price    integer,
  ADD COLUMN IF NOT EXISTS pages         integer,
  ADD COLUMN IF NOT EXISTS paper_quality text,
  ADD COLUMN IF NOT EXISTS weight        integer,
  ADD COLUMN IF NOT EXISTS stock         integer NOT NULL DEFAULT 0;
COMMIT;
