"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Product } from "@/db/schema";
import { useStore } from "@/lib/store";

export default function ProductView({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);
  const wished = isWishlisted(product.id);

  // ===== Amazon-style zoom (hover on desktop, touch-move on mobile) =====
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frameRef = useRef<HTMLDivElement>(null);

  const updateOrigin = (clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100);
    const y = Math.min(Math.max(((clientY - rect.top) / rect.height) * 100, 0), 100);
    setOrigin(`${x}% ${y}%`);
  };

  const info = {
    id: product.id,
    titleUr: product.titleUr,
    titleEn: product.titleEn,
    price: product.price,
    image: product.image,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-softgray">
        <span>Home</span>
        <span className="mx-2 text-gold">/</span>
        <span>Books</span>
        <span className="mx-2 text-gold">/</span>
        <span className="text-charcoal">{product.titleEn}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        {/* ===== Image with zoom ===== */}
        <div>
          <div
            ref={frameRef}
            className="relative aspect-[4/5] w-full touch-none select-none overflow-hidden rounded-xl border border-charcoal/5 bg-surface shadow-sm"
            onMouseEnter={() => setZooming(true)}
            onMouseLeave={() => setZooming(false)}
            onMouseMove={(e) => updateOrigin(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              setZooming(true);
              updateOrigin(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              updateOrigin(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={() => setZooming(false)}
            onTouchCancel={() => setZooming(false)}
          >
            <Image
              src={product.image}
              alt={product.titleEn}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-150 ease-out will-change-transform"
              style={{
                transformOrigin: origin,
                transform: zooming ? "scale(2.2)" : "scale(1)",
              }}
            />
            {!zooming && (
              <span className="absolute bottom-3 right-3 rounded-full bg-emerald-deep/70 px-3 py-1 text-[11px] text-cream backdrop-blur">
                Hover / touch &amp; move to zoom
              </span>
            )}
          </div>
        </div>

        {/* ===== Details ===== */}
        <div className="flex flex-col">
          <h1
            dir="rtl"
            lang="ur"
            className="font-urdu text-3xl leading-[4.5rem] text-charcoal sm:text-4xl sm:leading-[5.5rem]"
          >
            {product.titleUr}
          </h1>
          <p className="mt-1 font-heading text-lg text-softgray">
            {product.titleEn}
          </p>
          <p dir="rtl" lang="ur" className="mt-2 font-urdu text-sm text-softgray">
            {product.author}
          </p>

          <div className="my-5 h-px w-full bg-gold/40" />

          <p className="font-heading text-3xl font-bold text-emerald-deep">
            Rs {product.price.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-softgray">
            Free home delivery in Pakistan · Cash on delivery available
          </p>

          {/* Quantity + Add to cart */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-charcoal/20 bg-surface">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-lg text-emerald-deep transition hover:bg-cream"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-14 border-x border-charcoal/10 py-3 text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-3 text-lg text-emerald-deep transition hover:bg-cream"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(info, qty)}
              className="flex-1 rounded-md bg-emerald-deep px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-forest sm:flex-none sm:px-10"
            >
              Add to Cart
            </button>
          </div>

          <button
            onClick={() => toggleWishlist(info)}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition sm:w-fit sm:px-10 ${
              wished
                ? "border-gold bg-gold/10 text-emerald-deep"
                : "border-charcoal/20 text-charcoal hover:border-forest hover:text-forest"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={wished ? "#C9A24D" : "none"}
              stroke={wished ? "#C9A24D" : "currentColor"}
              strokeWidth="1.8"
              className="h-4.5 w-4.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.6c0 5.2-7.7 9.9-9 10.7-1.3-.8-9-5.5-9-10.7A4.9 4.9 0 0 1 7.9 3.7 5.1 5.1 0 0 1 12 5.8a5.1 5.1 0 0 1 4.1-2.1A4.9 4.9 0 0 1 21 8.6Z"
              />
            </svg>
            {wished ? "Saved to Wishlist" : "Add to Wishlist"}
          </button>

          {/* Description */}
          <div className="mt-8 rounded-xl bg-surface p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-emerald-deep">
              About this book
            </h2>
            <div className="my-3 h-px w-16 bg-gold" />
            <p className="text-sm leading-relaxed text-charcoal/90">
              {product.description}
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-xs text-softgray sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Authentic publication — Maktaba Khuddam-ul-Quran
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Premium print &amp; binding
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Free home delivery in Pakistan
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Cash on delivery available
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
