"use client";

import { unstable_rethrow } from "next/navigation";
import { useTransition, type ReactNode } from "react";

/** Runs a server action on click, optionally after a confirmation prompt. */
export default function ActionButton({
  action,
  confirmMessage,
  className,
  title,
  disabled,
  children,
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  className?: string;
  title?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled || pending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await action();
          } catch (err) {
            unstable_rethrow(err); // let redirects (e.g. to the login page) through
            console.error(err);
            window.alert("Something went wrong. Please try again.");
          }
        });
      }}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}
