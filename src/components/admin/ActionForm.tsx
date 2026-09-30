"use client";

import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { FormResult } from "@/lib/admin-form";

/**
 * Submits a form to a server action and shows its error message.
 * The action is called from onSubmit (not <form action>) so React does not
 * reset the fields when the server rejects the input.
 */
export default function ActionForm({
  action,
  submitLabel,
  cancelHref,
  children,
}: {
  action: (formData: FormData) => Promise<FormResult>;
  submitLabel: string;
  cancelHref: string;
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result?.error) setError(result.error);
      } catch (err) {
        unstable_rethrow(err); // let redirects (e.g. to the login page) through
        // Uploads larger than the server's body limit end up here
        console.error(err);
        setError("Something went wrong while saving. If you chose a large image, try a smaller one.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {children}

      {error && (
        <p role="alert" className="rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="text-sm font-semibold text-muted hover:text-navy">
          Cancel
        </Link>
      </div>
    </form>
  );
}
