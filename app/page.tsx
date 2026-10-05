import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { getActivePosters } from "@/lib/posters";
import { toProductInfo } from "@/lib/pricing";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const BIO = `Dr. Israr Ahmed (26 April 1932 – 14 April 2010) was a highly influential Pakistani Islamic scholar, theologian, and philosopher who dedicated his life to the revival of Islamic thought and the study of the Quran. Originally trained as a medical doctor, he graduated with an MBBS from King Edward Medical College in 1954 before shifting his complete focus toward Islamic studies and earning a Master's degree from the University of Karachi in 1965. He is best known for founding the Islamic organization Tanzeem-e-Islami in 1975 and for his monumental Urdu audio-visual commentary series, Bayan al-Quran, which turned him into a household name and remains one of the most widely watched Quranic commentary series in the South Asian Muslim world and diaspora. Renowned for his unwavering, Quran-centric approach, Dr. Israr staunchly critiqued Western secular liberalism while advocating for individual spiritual purification and the peaceful establishment of Islamic governance.`;

export default async function HomePage() {
  const [products, posters] = await Promise.all([
    getProducts(),
    getActivePosters(),
  ]);

  return (
    <>
      <HeroCarousel
        slides={posters.map((p) => ({
          id: p.id,
          src: p.imageUrl,
          alt: p.altText,
          href: p.linkUrl,
        }))}
      />

      {/* ===== Popular Books ===== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 text-center">
          <p className="eyebrow text-gold">Official Book Store</p>
          <h2 className="mt-1 font-heading text-3xl font-bold text-crimson sm:text-4xl">
            Popular Books
          </h2>
          <p className="mt-2 text-sm text-muted">
            The most loved works from our press — free home delivery across
            Pakistan
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={toProductInfo(p)}
            />
          ))}
        </div>
      </section>

      {/* ===== About Dr Israr Ahmed (RA) ===== */}
      <section id="about-dr-israr" className="border-t border-cream-deep bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          {/* Portrait — circular frame: white inner ring, gold outer ring */}
          <div className="mx-auto mb-6 w-fit rounded-full bg-gold p-1 shadow-lg">
            <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white sm:h-44 sm:w-44">
              <Image
                src="/drisrar.png"
                alt="Dr Israr Ahmed (RA)"
                fill
                sizes="176px"
                className="object-cover"
              />
            </div>
          </div>
          <p className="eyebrow text-center text-navy-soft">The Founder</p>
          <h2 className="mt-1 mb-8 text-center font-heading text-3xl font-bold text-crimson sm:text-4xl">
            About Dr Israr Ahmed (RA)
          </h2>
          <p className="text-justify text-base leading-8 text-ink/90 first-letter:float-left first-letter:mr-2 first-letter:font-heading first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-crimson">
            {BIO}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-cream-deep bg-surface p-5 text-center">
              <p className="font-heading text-2xl font-bold text-navy">1975</p>
              <p className="mt-1 text-xs text-muted">Founded Tanzeem-e-Islami</p>
            </div>
            <div className="rounded-xl border border-cream-deep bg-surface p-5 text-center">
              <p className="font-heading text-2xl font-bold text-navy">
                Bayan al-Quran
              </p>
              <p className="mt-1 text-xs text-muted">
                Monumental Urdu commentary series
              </p>
            </div>
            <div className="rounded-xl border border-cream-deep bg-surface p-5 text-center">
              <p className="font-heading text-2xl font-bold text-navy">78 Years</p>
              <p className="mt-1 text-xs text-muted">
                A life devoted to the Quran (1932–2010)
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
