"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import ProductCard from "./ProductCard";

export default function WishlistView() {
  const { wishlist, wishlistReady, customer } = useStore();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 text-center">
        <p className="eyebrow text-gold">Saved for later</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-crimson sm:text-4xl">Wishlist</h1>
        <p className="mt-2 text-sm text-muted">
          {customer ? (
            "Saved to your account — it follows you on every device."
          ) : (
            <>
              Saved in this browser only.{" "}
              <Link href="/account/login?next=/wishlist" className="font-semibold text-navy underline hover:text-gold">
                Log in
              </Link>{" "}
              to keep it on every device.
            </>
          )}
        </p>
      </div>

      {!wishlistReady && wishlist.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Loading…</p>
      ) : wishlist.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted/40 bg-cream p-10 text-center text-muted">
          Your wishlist is empty. Tap the ♡ on any book to save it here.{" "}
          <Link href="/all-books" className="font-semibold text-navy underline hover:text-gold">
            Browse books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {wishlist.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
