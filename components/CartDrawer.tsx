"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, cartTotal } =
    useStore();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!cartOpen}
      >
        <div className="flex items-center justify-between border-b border-gold/30 bg-navy px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-cream">
            Your Cart
          </h2>
          <button
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            className="rounded-full p-1.5 text-cream transition hover:bg-navy-soft"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.5 2M7 13h10l3-8H5.5M7 13 5.5 5M7 13l-1.2 4.8h13.4M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
              </svg>
              <p className="text-sm text-muted">Your cart is empty.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-cream bg-cream/50 p-3"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-surface">
                    <Image
                      src={item.image}
                      alt={item.titleEn}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="font-urdu text-base leading-8 text-ink" dir="rtl">
                      {item.titleUr}
                    </p>
                    <p className="text-xs text-muted">{item.titleEn}</p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <div className="flex items-center rounded border border-muted/30 bg-surface">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="px-2 py-0.5 text-sm text-navy hover:bg-cream"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">{item.qty}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="px-2 py-0.5 text-sm text-navy hover:bg-cream"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-navy">
                        Rs {(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    aria-label="Remove item"
                    onClick={() => removeFromCart(item.id)}
                    className="self-start p-1 text-muted transition hover:text-ink"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gold/30 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-heading text-lg font-bold text-navy">
                Rs {cartTotal.toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full rounded-md bg-navy py-3 text-center text-sm font-semibold tracking-wide text-cream transition hover:bg-navy-soft"
            >
              Proceed to Checkout
            </Link>
            <p className="mt-2 text-center text-[11px] text-muted">
              Free home delivery in Pakistan · Cash on delivery
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
