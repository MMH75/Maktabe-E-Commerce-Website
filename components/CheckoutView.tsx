"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { getQuote, submitOrder } from "@/app/checkout/actions";
import type { Quote } from "@/lib/checkout";
import { useStore } from "@/lib/store";
import { FieldRow, FormMessage, inputClass } from "./account/ui";

type SavedAddress = {
  id: number;
  label: string | null;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
};

/** Random token for this checkout: one token = at most one order (stops double orders). */
function newToken(): string {
  // randomUUID needs HTTPS (or localhost); fall back to random bytes elsewhere
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b: number) => b.toString(16).padStart(2, "0")).join("");
}

const PROBLEM_TEXT = {
  removed: "No longer available — please remove it.",
  out: "Out of stock — please remove it.",
  short: "Not enough copies in stock.",
} as const;

export default function CheckoutView({
  customer,
  addresses,
}: {
  customer: { name: string; email: string; phone: string } | null;
  addresses: SavedAddress[];
}) {
  const router = useRouter();
  const { cart, cartReady, setQty, removeFromCart, clearCart } = useStore();
  const [token] = useState(newToken);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState<number | "new">(defaultAddress?.id ?? "new");
  const [form, setForm] = useState({
    fullName: defaultAddress?.fullName ?? customer?.name ?? "",
    phone: defaultAddress?.phone ?? customer?.phone ?? "",
    email: customer?.email ?? "",
    address: defaultAddress?.address ?? "",
    city: defaultAddress?.city ?? "",
    notes: "",
  });
  const [saveAddress, setSaveAddress] = useState(addresses.length === 0);

  const cartKey = useMemo(() => JSON.stringify(cart.map((c) => [c.id, c.qty])), [cart]);

  // Re-price the cart from the server whenever it changes
  useEffect(() => {
    if (!cartReady) return;
    let cancelled = false;
    const items = (JSON.parse(cartKey) as [number, number][]).map(([id, qty]) => ({ id, qty }));
    getQuote(items)
      .then((q) => !cancelled && (setQuote(q), setQuoteError(false)))
      .catch(() => !cancelled && setQuoteError(true));
    return () => {
      cancelled = true;
    };
  }, [cartKey, cartReady]);

  const set = (name: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [name]: e.target.value }));

  function chooseAddress(id: number | "new") {
    setAddressId(id);
    const a = addresses.find((x) => x.id === id);
    setForm((f) =>
      a
        ? { ...f, fullName: a.fullName, phone: a.phone, address: a.address, city: a.city }
        : { ...f, fullName: customer?.name ?? "", phone: customer?.phone ?? "", address: "", city: "" },
    );
  }

  /** Makes the cart match what can actually be ordered. */
  function fixCart(q: Quote) {
    for (const line of q.lines) {
      if (line.problem === "removed" || line.problem === "out") removeFromCart(line.id);
      else if (line.problem === "short") setQty(line.id, line.stock);
    }
    setError(null);
  }

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return; // a second click while the first is still running
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitOrder({
          token,
          items: cart.map((c) => ({ id: c.id, qty: c.qty })),
          ...form,
          saveAddress: Boolean(customer) && addressId === "new" && saveAddress,
        });
        if (result.ok) {
          clearCart();
          router.replace(`/checkout/success?order=${result.orderId}&t=${encodeURIComponent(result.token)}`);
          return;
        }
        setError(result.error);
        if (result.quote) setQuote(result.quote);
      } catch {
        setError("We could not reach the server. Check your connection and try again.");
      }
    });
  }

  // ---- Empty / loading states ----
  if (!cartReady) return <p className="py-24 text-center text-sm text-muted">Loading your cart…</p>;
  if (cart.length === 0)
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl font-bold text-crimson">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">Add some books to your cart, then come back here to place your order.</p>
        <Link href="/all-books" className="mt-6 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-gold">
          Browse books
        </Link>
      </div>
    );

  const hasProblems = quote ? !quote.ok : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow text-gold">Cash on delivery</p>
      <h1 className="mb-6 mt-1 font-heading text-3xl font-bold text-crimson sm:text-4xl">Checkout</h1>

      <form onSubmit={placeOrder} className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        {/* ---- Delivery details ---- */}
        <section className="space-y-5 rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-xl font-bold text-navy">Delivery details</h2>
            {!customer && (
              <p className="text-sm text-muted">
                Have an account?{" "}
                <Link href="/account/login?next=/checkout" className="font-semibold text-navy hover:text-gold">
                  Log in
                </Link>{" "}
                to use saved addresses.
              </p>
            )}
          </div>

          {addresses.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-semibold text-navy">Deliver to</legend>
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-cream-deep p-3 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/5"
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={addressId === a.id}
                    onChange={() => chooseAddress(a.id)}
                    className="mt-1 accent-[var(--mk-gold)]"
                  />
                  <span>
                    <span className="font-semibold text-navy">{a.label || a.fullName}</span>
                    {a.isDefault && <span className="ml-2 text-xs font-semibold text-gold">Default</span>}
                    <span dir="auto" className="block text-ink/80">
                      {a.address}, {a.city} · {a.phone}
                    </span>
                  </span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-cream-deep p-3 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                <input
                  type="radio"
                  name="savedAddress"
                  checked={addressId === "new"}
                  onChange={() => chooseAddress("new")}
                  className="accent-[var(--mk-gold)]"
                />
                <span className="font-semibold text-navy">A different address</span>
              </label>
            </fieldset>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Full name" htmlFor="fullName">
              <input id="fullName" required maxLength={80} autoComplete="name" value={form.fullName} onChange={set("fullName")} className={inputClass} />
            </FieldRow>
            <FieldRow label="Phone" htmlFor="phone" hint="We call to confirm before delivery">
              <input id="phone" type="tel" required autoComplete="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
            </FieldRow>
          </div>
          <FieldRow label="Address" htmlFor="address" hint="House number, street, area / town">
            <textarea
              id="address"
              required
              rows={3}
              minLength={8}
              maxLength={300}
              autoComplete="street-address"
              value={form.address}
              onChange={set("address")}
              className={inputClass}
            />
          </FieldRow>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="City" htmlFor="city">
              <input id="city" required maxLength={60} autoComplete="address-level2" value={form.city} onChange={set("city")} className={inputClass} />
            </FieldRow>
            <FieldRow label="Email" htmlFor="email" optional hint="For your order confirmation">
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
            </FieldRow>
          </div>
          <FieldRow label="Order notes" htmlFor="notes" optional>
            <textarea id="notes" rows={2} maxLength={500} value={form.notes} onChange={set("notes")} className={inputClass} placeholder="e.g. Please call before coming" />
          </FieldRow>
          {customer && addressId === "new" && (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-[var(--mk-gold)]" />
              Save this address to my account
            </label>
          )}
        </section>

        {/* ---- Order summary ---- */}
        <aside className="h-fit space-y-4 rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-heading text-xl font-bold text-navy">Your order</h2>

          {quoteError ? (
            <FormMessage error="Could not load current prices. Please refresh the page." />
          ) : !quote ? (
            <p className="text-sm text-muted">Checking prices and stock…</p>
          ) : (
            <>
              <ul className="divide-y divide-cream-deep">
                {quote.lines.map((l) => (
                  <li key={l.id} className="flex gap-3 py-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-cream">
                      {l.image && <Image src={l.image} alt="" fill sizes="48px" className="object-contain p-0.5" />}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold text-navy">{l.titleEn}</p>
                      <p className="text-muted">
                        {l.qty} × Rs {l.unitPrice.toLocaleString()}
                      </p>
                      {l.problem && (
                        <p className="text-xs font-semibold text-crimson">
                          {l.problem === "short" ? `Only ${l.stock} left in stock.` : PROBLEM_TEXT[l.problem]}
                        </p>
                      )}
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold text-navy">
                      Rs {(l.unitPrice * l.qty).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>

              {hasProblems && (
                <div className="rounded-lg border border-crimson/30 bg-crimson/5 p-3 text-sm text-crimson">
                  Some books can&apos;t be ordered as they are.
                  <button
                    type="button"
                    onClick={() => fixCart(quote)}
                    className="mt-2 block w-full rounded-full bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90"
                  >
                    Update my cart to what&apos;s available
                  </button>
                </div>
              )}

              <dl className="space-y-1 border-t border-cream-deep pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="text-ink">Rs {quote.subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="text-ink">{quote.delivery === 0 ? "Free" : `Rs ${quote.delivery.toLocaleString()}`}</dd>
                </div>
                <div className="flex justify-between border-t border-cream-deep pt-2 text-base">
                  <dt className="font-semibold text-navy">Total</dt>
                  <dd className="font-heading text-xl font-bold text-navy">Rs {quote.total.toLocaleString()}</dd>
                </div>
              </dl>
            </>
          )}

          <div className="rounded-lg bg-cream p-3 text-xs text-ink/80">
            <span className="font-semibold text-navy">Payment: Cash on Delivery.</span> Pay in cash when your books arrive.
          </div>

          <FormMessage error={error ?? undefined} />

          <button
            type="submit"
            disabled={pending || !quote || hasProblems}
            className="w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Placing your order…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
