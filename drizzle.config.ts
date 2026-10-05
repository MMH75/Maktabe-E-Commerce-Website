import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Uses the same database as the website (DATABASE_URL in .env), so no
// credentials are stored in this file. Schema changes are applied as SQL —
// see the numbered files in sql/.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
