"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore, type ProductInfo } from "@/lib/store";

export default function ProductCard({ product }: { product: ProductInfo }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);
  const href = `/products/${product.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-cream-deep bg-surface transition duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square w-full bg-cream">
        <Link href={href} aria-label={product.titleEn} className="absolute inset-0">
          <Image
            src={product.image}
            alt={product.titleEn}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-contain p-3 transition duration-500 group-hover:scale-105"
          />
        </Link>
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product)}
          className={`absolute right-2 top-2 rounded-full bg-white p-1.5 shadow-sm transition hover:scale-110 ${
            wished ? "text-gold" : "text-navy"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
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

      {/* Body */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-1">
        <Link href={href} title={product.titleEn}>
          <h3
            dir="rtl"
            lang="ur"
            className="truncate font-urdu text-base leading-[2.6rem] text-ink transition group-hover:text-navy-soft"
          >
            {product.titleUr}
          </h3>
          <p className="truncate text-xs text-muted">{product.titleEn}</p>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="whitespace-nowrap font-heading text-base font-bold text-navy sm:text-lg">
            Rs {product.price.toLocaleString()}
          </p>
          <button
            onClick={() => addToCart(product, 1)}
            aria-label={`Add ${product.titleEn} to cart`}
            className="flex items-center gap-1.5 shrink-0 rounded-full bg-navy p-2 text-xs sm:px-3 sm:py-1.5 font-semibold text-white transition hover:bg-gold"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
