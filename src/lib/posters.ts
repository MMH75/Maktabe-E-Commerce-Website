import { db } from "@/db";
import { posters, type Poster } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

/** Active hero-section posters, in display order. */
export async function getActivePosters(): Promise<Poster[]> {
  return db
    .select()
    .from(posters)
    .where(eq(posters.isActive, true))
    .orderBy(asc(posters.sortOrder), asc(posters.id));
}

/** Every poster, including hidden ones, in display order — for the admin panel. */
export async function getAllPosters(): Promise<Poster[]> {
  return db.select().from(posters).orderBy(asc(posters.sortOrder), asc(posters.id));
}

export async function getPoster(id: number): Promise<Poster | null> {
  const rows = await db.select().from(posters).where(eq(posters.id, id));
  return rows[0] ?? null;
}
