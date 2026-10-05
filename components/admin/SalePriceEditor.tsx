"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";

/** Inline sale-price editor for one book. Empty = not on sale. */
export default function SalePriceEditor({
  price,
  initial,
  save,
}: {
  price: number;
  initial: number | null;
  save: (salePrice: number | null) => Promise<string | null>;
}) {
  const [value, setValue] = useState(initial === null ? "" : String(initial));
  const [savedValue, setSavedValue] = useState(initial);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const next = value.trim() === "" ? null : Number(value);
  const valid = next === null || (Number.isInteger(next) && next >= 0 && next < price);
  const changed = next !== savedValue;
  const percentOff = next !== null && valid ? Math.round((1 - next / price) * 100) : null;

  function run(salePrice: number | null) {
    setMessage(null);
    startTransition(async () => {
      try {
        const error = await save(salePrice);
        if (error) {
          setMessage({ text: error, error: true });
        } else {
          setSavedValue(salePrice);
          setValue(salePrice === null ? "" : String(salePrice));
          setMessage({ text: salePrice === null ? "Removed" : "Saved", error: false });
        }
      } catch (err) {
        unstable_rethrow(err); // let redirects (e.g. to the login page) through
        console.error(err);
        setMessage({ text: "Could not save. Try again.", error: true });
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) {
          setMessage({ text: `Use a whole number below Rs ${price.toLocaleString()}.`, error: true });
          return;
        }
        run(next);
      }}
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <span className="text-xs text-muted">{percentOff !== null && percentOff > 0 ? `${percentOff}% off` : ""}</span>
      <div className="flex items-center rounded-full border border-cream-deep bg-surface pl-3">
        <span className="text-xs text-muted">Rs</span>
        <input
          type="number"
          min={0}
          max={price - 1}
          step={1}
          inputMode="numeric"
          aria-label="Sale price"
          placeholder="No sale"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setMessage(null);
          }}
          className="w-24 bg-transparent px-2 py-1 text-sm font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
      <button
        type="submit"
        disabled={!changed || pending}
        className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-30"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {savedValue !== null && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(null)}
          className="rounded-full border border-crimson/30 px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson hover:text-white disabled:opacity-30"
        >
          Remove
        </button>
      )}
      <span
        role="status"
        className={`basis-full text-right text-xs font-semibold ${message?.error ? "text-crimson" : "text-emerald-700"}`}
      >
        {message?.text}
      </span>
    </form>
  );
}
