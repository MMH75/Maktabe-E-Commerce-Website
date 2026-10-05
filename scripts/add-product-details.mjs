// Adds the book-detail columns to the `products` table.
//
//   npm run db:add-product-details
//
// Adds sale_price, pages, paper_quality, weight and stock to the database in
// DATABASE_URL (.env). Safe to run more than once: columns that already exist
// are skipped. Books that existed before `stock` was added get a starting
// stock of STARTING_STOCK, so they do not all show as "Out of stock".

import "dotenv/config";
import pg from "pg";

const STARTING_STOCK = 10;

const COLUMNS = [
  { name: "sale_price", type: "integer" }, // discounted price in Rs; NULL = no sale
  { name: "pages", type: "integer" },
  { name: "paper_quality", type: "text" },
  { name: "weight", type: "integer" }, // grams
  { name: "stock", type: "integer NOT NULL DEFAULT 0" },
];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing from .env. Nothing was changed.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = 'products'`,
  );
  if (rows.length === 0) throw new Error('The "products" table was not found in this database.');

  const existing = new Set(rows.map((r) => r.column_name));
  const missing = COLUMNS.filter((c) => !existing.has(c.name));

  if (missing.length === 0) {
    console.log("All columns already exist. Nothing to do.");
  } else {
    // All or nothing: if any step fails, the table is left unchanged
    await client.query("BEGIN");
    for (const c of missing) {
      await client.query(`ALTER TABLE products ADD COLUMN ${c.name} ${c.type}`);
      console.log(`  + added column ${c.name}`);
    }
    if (missing.some((c) => c.name === "stock")) {
      const { rowCount } = await client.query("UPDATE products SET stock = $1", [STARTING_STOCK]);
      console.log(`  + set stock to ${STARTING_STOCK} for ${rowCount} existing book(s)`);
    }
    await client.query("COMMIT");
    console.log("Done. The products table is up to date.");
  }
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(`Failed: ${err.message}\nNothing was changed.`);
  process.exitCode = 1;
} finally {
  await client.end();
}
