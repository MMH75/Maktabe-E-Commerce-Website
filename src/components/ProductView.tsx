"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/db/schema";
import { discountPercent, effectivePrice, formatWeight, isOnSale, LOW_STOCK } from "@/lib/pricing";
import { useStore } from "@/lib/store";

const URDU_SCRIPT = /[؀-ۿ]/;

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

  const onSale = isOnSale(product);
  const inStock = product.stock > 0;
  const maxQty = Math.max(1, product.stock);

  const info = {
    id: product.id,
    titleUr: product.titleUr,
    titleEn: product.titleEn,
    price: effectivePrice(product),
    image: product.image,
  };

  // Only rows the admin has filled in are shown
  const specs = [
    { label: "Author", value: product.author, urdu: URDU_SCRIPT.test(product.author) },
    { label: "Pages", value: product.pages ? product.pages.toLocaleString("en-US") : null },
    { label: "Paper quality", value: product.paperQuality },
    { label: "Weight", value: product.weight ? formatWeight(product.weight) : null },
  ].filter((row) => row.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
        <Link href="/" className="hover:text-navy">Home</Link>
        <span className="mx-2 text-gold">/</span>
        <Link href="/all-books" className="hover:text-navy">Books</Link>
        <span className="mx-2 text-gold">/</span>
        <span className="text-ink" aria-current="page">{product.titleEn}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        {/* ===== Image with zoom ===== */}
        <div>
          <div
            ref={frameRef}
            className="relative aspect-[4/5] w-full touch-none select-none overflow-hidden rounded-xl border border-ink/5 bg-surface shadow-sm"
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
              <span className="absolute bottom-3 right-3 rounded-full bg-navy/70 px-3 py-1 text-[11px] text-cream backdrop-blur">
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
            className="font-urdu text-3xl leading-[4.5rem] text-ink sm:text-4xl sm:leading-[5.5rem]"
          >
            {product.titleUr}
          </h1>
          <p className="mt-1 font-heading text-lg text-muted">
            {product.titleEn}
          </p>
          <p dir="rtl" lang="ur" className="mt-2 font-urdu text-sm text-muted">
            {product.author}
          </p>

          <div className="my-5 h-px w-full bg-gold/40" />

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-heading text-3xl font-bold text-navy">
              Rs {effectivePrice(product).toLocaleString("en-US")}
            </p>
            {onSale && (
              <>
                <p className="font-heading text-xl text-muted line-through">
                  Rs {product.price.toLocaleString("en-US")}
                </p>
                <span className="rounded-full bg-crimson px-2.5 py-0.5 text-xs font-bold text-white">
                  {discountPercent(product)}% OFF
                </span>
              </>
            )}
          </div>
          <p
            className={`mt-2 text-sm font-semibold ${
              !inStock ? "text-crimson" : product.stock <= LOW_STOCK ? "text-gold" : "text-emerald-700"
            }`}
          >
            {!inStock
              ? "Out of stock"
              : product.stock <= LOW_STOCK
                ? `Only ${product.stock} left in stock`
                : "In stock"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Free home delivery in Pakistan · Cash on delivery available
          </p>

          {/* Quantity + Add to cart */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-ink/20 bg-surface">
              <button
                aria-label="Decrease quantity"
                disabled={!inStock}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-lg text-navy transition hover:bg-cream"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={qty}
                disabled={!inStock}
                onChange={(e) =>
                  setQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-14 border-x border-ink/10 py-3 text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                aria-label="Increase quantity"
                disabled={!inStock}
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="px-4 py-3 text-lg text-navy transition hover:bg-cream"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(info, qty)}
              disabled={!inStock}
              className="flex-1 rounded-md bg-navy px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted/50 sm:flex-none sm:px-10"
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          <button
            onClick={() => toggleWishlist(info)}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition sm:w-fit sm:px-10 ${
              wished
                ? "border-gold bg-gold/10 text-navy"
                : "border-ink/20 text-ink hover:border-navy-soft hover:text-navy-soft"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={wished ? "var(--color-accent)" : "none"}
              stroke={wished ? "var(--color-accent)" : "currentColor"}
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

          {/* Specifications */}
          {specs.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-xl border border-cream-deep bg-surface">
              <h2 className="border-b border-cream-deep bg-cream px-5 py-3 font-heading text-lg font-semibold text-navy">
                Book details
              </h2>
              <dl className="divide-y divide-cream-deep text-sm">
                {specs.map((row) => (
                  <div key={row.label} className="grid grid-cols-[9rem_1fr] gap-4 px-5 py-2.5">
                    <dt className="text-muted">{row.label}</dt>
                    <dd
                      className={`font-semibold text-ink ${row.urdu ? "font-urdu font-normal leading-8" : ""}`}
                      dir={row.urdu ? "rtl" : undefined}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Description */}
          <div className="mt-6 rounded-xl bg-surface p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-navy">
              About this book
            </h2>
            <div className="my-3 h-px w-16 bg-gold" />
            {/* Urdu descriptions get the Nastaliq font (as on About Us); English ones keep the body font */}
            {URDU_SCRIPT.test(product.description) ? (
              <p
                dir="rtl"
                lang="ur"
                className="font-urdu text-[0.95rem] leading-[2.4rem] tracking-[0.02em] text-ink/90"
              >
                {product.description}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-ink/90">
                {product.description}
              </p>
            )}
            <ul className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted sm:grid-cols-2">
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
