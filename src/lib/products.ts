import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

const SEED: Omit<Product, "id">[] = [
  {
    slug: "mukhtasar-bayan-ul-quran",
    titleUr: "مختصر بیان القرآن",
    titleEn: "Mukhtasar Bayan-ul-Quran (Single Volume)",
    author: "ڈاکٹر اسرار احمد ؒ",
    price: 1250,
    image: "/product (1).jpg",
    description:
      "A concise single-volume edition of the renowned Urdu translation and selected annotations of the Holy Quran, drawn from Dr. Israr Ahmed's celebrated Dora-e-Tarjuma-e-Quran. Comprising 1,248 pages on premium 65-gram matte paper, this edition presents the complete translation with carefully selected footnotes — an ideal companion for daily study and reflection.",
  },
  {
    slug: "bayan-ul-quran-4-volumes",
    titleUr: "بیان القرآن (چار جلدیں)",
    titleEn: "Bayan-ul-Quran (4-Volume Set)",
    author: "ڈاکٹر اسرار احمد ؒ",
    price: 4000,
    image: "/product (2).jpg",
    description:
      "The complete four-volume Bayan-ul-Quran, based on Dr. Israr Ahmed's world-famous Dora-e-Tarjuma-e-Quran. Spanning over 2,560 pages, this beautifully bound set offers a deep, Quran-centric commentary in accessible Urdu — one of the most widely studied Quranic commentary works in the South Asian Muslim world.",
  },
  {
    slug: "lughat-o-airab-e-quran",
    titleUr: "لغات و اعراب قرآن کی روشنی میں",
    titleEn: "Lughat-o-Airab-e-Quran ki Roshni Mein",
    author: "شعبہ علوم اسلامیہ، پنجاب یونیورسٹی",
    price: 950,
    image: "/product (3).jpg",
    description:
      "A scholarly study of the lexical and grammatical foundations of Quranic translation. This classic academic work illuminates the vocabulary (lughaat) and grammatical inflection (airaab) of the Quranic text, making it an essential reference for students of translation and tafseer.",
  },
  {
    slug: "muntakhabat-bayan-ul-quran",
    titleUr: "منتخبات بیان القرآن",
    titleEn: "Muntakhabat Bayan-ul-Quran",
    author: "ڈاکٹر اسرار احمد ؒ",
    price: 800,
    image: "/product (4).jpg",
    description:
      "A curated selection of passages from Bayan-ul-Quran, compiled by Markazi Anjuman Khuddam-ul-Quran Lahore. This elegant volume gathers the most essential guidance, admonition and reflection from Dr. Israr Ahmed's commentary in a single accessible book.",
  },
];

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length === 0) {
    await db.insert(products).values(SEED).onConflictDoNothing();
  }
  seeded = true;
}

export async function getProducts(): Promise<Product[]> {
  await ensureSeeded();
  return db.select().from(products).orderBy(asc(products.id));
}

export async function getProduct(id: number): Promise<Product | null> {
  await ensureSeeded();
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}
