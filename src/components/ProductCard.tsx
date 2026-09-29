"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore, type ProductInfo } from "@/lib/store";

export default function ProductCard({ product }: { product: ProductInfo }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);

  return (
    <article
      onClick={() => router.push(`/products/${product.id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-charcoal/5 bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        <Image
          src={product.image}
          alt={product.titleEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Wishlist toggle overlay */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute right-3 top-3 rounded-full bg-surface/90 p-2 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            fill={wished ? "#C9A24D" : "none"}
            stroke={wished ? "#C9A24D" : "#123C35"}
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.6c0 5.2-7.7 9.9-9 10.7-1.3-.8-9-5.5-9-10.7A4.9 4.9 0 0 1 7.9 3.7 5.1 5.1 0 0 1 12 5.8a5.1 5.1 0 0 1 4.1-2.1A4.9 4.9 0 0 1 21 8.6Z"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          dir="rtl"
          lang="ur"
          className="font-urdu text-lg leading-10 text-charcoal"
          title={product.titleEn}
        >
          {product.titleUr}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-softgray">
          {product.titleEn}
        </p>
        <p className="mt-2 font-heading text-lg font-bold text-emerald-deep">
          Rs {product.price.toLocaleString()}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="flex-1 rounded-md bg-emerald-deep px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-cream transition hover:bg-forest"
          >
            Add to Cart
          </button>
          <button
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`rounded-md border p-2.5 transition ${
              wished
                ? "border-gold bg-gold/10"
                : "border-charcoal/15 hover:border-forest"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={wished ? "#C9A24D" : "none"}
              stroke={wished ? "#C9A24D" : "#123C35"}
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.6c0 5.2-7.7 9.9-9 10.7-1.3-.8-9-5.5-9-10.7A4.9 4.9 0 0 1 7.9 3.7 5.1 5.1 0 0 1 12 5.8a5.1 5.1 0 0 1 4.1-2.1A4.9 4.9 0 0 1 21 8.6Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
