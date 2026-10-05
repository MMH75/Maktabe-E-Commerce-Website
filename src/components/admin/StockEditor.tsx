"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";

/** Inline stock editor for one book: type a number (or use − / +), then Save. */
export default function StockEditor({
  initial,
  save,
}: {
  initial: number;
  save: (stock: number) => Promise<string | null>;
}) {
  const [value, setValue] = useState(String(initial));
  const [savedValue, setSavedValue] = useState(initial);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const parsed = Number(value);
  const valid = value !== "" && Number.isInteger(parsed) && parsed >= 0;
  const changed = valid && parsed !== savedValue;

  function submit() {
    if (!valid) {
      setMessage({ text: "Enter a whole number, 0 or more.", error: true });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      try {
        const error = await save(parsed);
        if (error) {
          setMessage({ text: error, error: true });
        } else {
          setSavedValue(parsed);
          setMessage({ text: "Saved", error: false });
        }
      } catch (err) {
        unstable_rethrow(err); // let redirects (e.g. to the login page) through
        console.error(err);
        setMessage({ text: "Could not save. Try again.", error: true });
      }
    });
  }

  const step = (delta: number) => {
    const base = valid ? parsed : savedValue;
    setValue(String(Math.max(0, base + delta)));
    setMessage(null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center justify-end gap-2"
    >
      <div className="flex items-center rounded-full border border-cream-deep bg-surface">
        <button type="button" onClick={() => step(-1)} aria-label="One less" className="px-2.5 py-1 text-navy hover:text-gold">
          −
        </button>
        <input
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          aria-label="Stock"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setMessage(null);
          }}
          className="w-16 bg-transparent py-1 text-center text-sm font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button type="button" onClick={() => step(1)} aria-label="One more" className="px-2.5 py-1 text-navy hover:text-gold">
          +
        </button>
      </div>
      <button
        type="submit"
        disabled={!changed || pending}
        className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-30"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      <span
        role="status"
        className={`w-24 text-xs font-semibold ${message?.error ? "text-crimson" : "text-emerald-700"}`}
      >
        {message?.text}
      </span>
    </form>
  );
}
