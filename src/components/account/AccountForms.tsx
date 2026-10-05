"use client";

import { useActionState } from "react";
import {
  changePassword,
  loginCustomer,
  register,
  updateProfile,
} from "@/app/account/actions";
import { FieldRow, FormMessage, inputClass, SubmitButton } from "./ui";

const MIN_PASSWORD = 8;

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  const v = state?.values ?? {};
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <FieldRow label="Full name" htmlFor="name">
        <input id="name" name="name" required maxLength={80} autoComplete="name" defaultValue={v.name} className={inputClass} />
      </FieldRow>
      <FieldRow label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className={inputClass} />
      </FieldRow>
      <FieldRow label="Phone" htmlFor="phone" optional hint="Used for delivery, e.g. 0300 1234567">
        <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className={inputClass} />
      </FieldRow>
      <FieldRow label="Password" htmlFor="password" hint={`At least ${MIN_PASSWORD} characters`}>
        <input id="password" name="password" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputClass} />
      </FieldRow>
      <FieldRow label="Confirm password" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputClass} />
      </FieldRow>
      <FormMessage error={state?.error} />
      <SubmitButton pending={pending} pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginCustomer, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <FieldRow label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.values?.email}
          className={inputClass}
        />
      </FieldRow>
      <FieldRow label="Password" htmlFor="password">
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </FieldRow>
      <FormMessage error={state?.error} />
      <SubmitButton pending={pending} pendingText="Logging in…">Log in</SubmitButton>
    </form>
  );
}

export function ProfileForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const v = state?.values ?? initial;
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Full name" htmlFor="name">
          <input id="name" name="name" required maxLength={80} autoComplete="name" defaultValue={v.name} className={inputClass} />
        </FieldRow>
        <FieldRow label="Phone" htmlFor="phone" optional>
          <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className={inputClass} />
        </FieldRow>
      </div>
      <FieldRow label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className={inputClass} />
      </FieldRow>
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton pending={pending} pendingText="Saving…">Save details</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <FieldRow label="Current password" htmlFor="current">
        <input id="current" name="current" type="password" required autoComplete="current-password" className={inputClass} />
      </FieldRow>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="New password" htmlFor="new-password" hint={`At least ${MIN_PASSWORD} characters`}>
          <input id="new-password" name="password" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputClass} />
        </FieldRow>
        <FieldRow label="Confirm new password" htmlFor="confirm">
          <input id="confirm" name="confirm" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputClass} />
        </FieldRow>
      </div>
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton pending={pending} pendingText="Saving…">Change password</SubmitButton>
    </form>
  );
}
