"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/login/actions";
import { inputClass } from "./Field";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
