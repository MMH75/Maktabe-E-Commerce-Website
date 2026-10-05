import type { ReactNode } from "react";

// Small building blocks shared by the account, address and checkout forms.

export const inputClass =
  "w-full rounded-lg border border-cream-deep bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export function FieldRow({
  label,
  htmlFor,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-navy">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error)
    return (
      <p role="alert" className="rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
        {error}
      </p>
    );
  if (success)
    return (
      <p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {success}
      </p>
    );
  return null;
}

export function SubmitButton({ pending, children, pendingText = "Please wait…" }: {
  pending: boolean;
  children: ReactNode;
  pendingText?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {pending ? pendingText : children}
    </button>
  );
}

/** Centred card used by the login and sign-up pages. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-cream-deep bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-3xl font-bold text-crimson">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
