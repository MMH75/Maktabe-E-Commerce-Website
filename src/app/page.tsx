import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const BIO = `Dr. Israr Ahmed (26 April 1932 – 14 April 2010) was a highly influential Pakistani Islamic scholar, theologian, and philosopher who dedicated his life to the revival of Islamic thought and the study of the Quran. Originally trained as a medical doctor, he graduated with an MBBS from King Edward Medical College in 1954 before shifting his complete focus toward Islamic studies and earning a Master's degree from the University of Karachi in 1965. He is best known for founding the Islamic organization Tanzeem-e-Islami in 1975 and for his monumental Urdu audio-visual commentary series, Bayan al-Quran, which turned him into a household name and remains one of the most widely watched Quranic commentary series in the South Asian Muslim world and diaspora. Renowned for his unwavering, Quran-centric approach, Dr. Israr staunchly critiqued Western secular liberalism while advocating for individual spiritual purification and the peaceful establishment of Islamic governance.`;

export default async function HomePage() {
  const products = await getProducts();
  // Only 4 unique products exist today — loop the array to fill 8 card slots.
  const cardSlots = [...products, ...products].slice(0, 8);

  return (
    <>
      <HeroCarousel />

      {/* ===== Popular Books ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-emerald-deep sm:text-4xl">
            Popular Books
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-gold" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-14 bg-gold" />
          </div>
          <p className="mt-3 text-sm text-softgray">
            The most loved works from our press — free home delivery across
            Pakistan
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cardSlots.map((p, i) => (
            <ProductCard
              key={`${p.id}-${i}`}
              product={{
                id: p.id,
                titleUr: p.titleUr,
                titleEn: p.titleEn,
                price: p.price,
                image: p.image,
              }}
            />
          ))}
        </div>
      </section>

      {/* ===== About Dr Israr Ahmed (RA) ===== */}
      <section id="about-dr-israr" className="bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="text-center font-heading text-3xl font-bold text-emerald-deep sm:text-4xl">
            About Dr Israr Ahmed (RA)
          </h2>
          <div className="mt-4 mb-8 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-gold" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-14 bg-gold" />
          </div>
          <p className="text-justify text-[15px] leading-8 text-charcoal/90 first-letter:float-left first-letter:mr-2 first-letter:font-heading first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-emerald-deep">
            {BIO}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gold/30 bg-cream p-5 text-center">
              <p className="font-heading text-2xl font-bold text-emerald-deep">1975</p>
              <p className="mt-1 text-xs text-softgray">Founded Tanzeem-e-Islami</p>
            </div>
            <div className="rounded-lg border border-gold/30 bg-cream p-5 text-center">
              <p className="font-heading text-2xl font-bold text-emerald-deep">
                Bayan al-Quran
              </p>
              <p className="mt-1 text-xs text-softgray">
                Monumental Urdu commentary series
              </p>
            </div>
            <div className="rounded-lg border border-gold/30 bg-cream p-5 text-center">
              <p className="font-heading text-2xl font-bold text-emerald-deep">78 Years</p>
              <p className="mt-1 text-xs text-softgray">
                A life devoted to the Quran (1932–2010)
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
