"use client";

import { useActionState } from "react";
import type { CommentState } from "@/app/products/[id]/actions";
import { FormMessage, inputClass } from "./account/ui";

const MAX = 1000;

export default function CommentForm({
  action,
}: {
  action: (prev: CommentState, formData: FormData) => Promise<CommentState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    // React empties the form after each post; after an error, defaultValue puts the text back
    <form action={formAction} className="space-y-3">
      <label htmlFor="comment-body" className="sr-only">
        Your comment
      </label>
      <textarea
        id="comment-body"
        name="body"
        required
        rows={3}
        maxLength={MAX}
        dir="auto"
        defaultValue={state?.error ? state.body : ""}
        placeholder="Share your thoughts about this book (English or Urdu)…"
        className={inputClass}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted">Up to {MAX} characters</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post comment"}
        </button>
      </div>
      <FormMessage error={state?.error} success={state?.success} />
    </form>
  );
}
