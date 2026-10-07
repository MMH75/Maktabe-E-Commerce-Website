import type { ReactNode } from "react";
import AccountNav from "@/components/account/AccountNav";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { logoutCustomer } from "../actions";

// Every page in this group needs a logged-in customer. Each page calls
// requireCustomer("<its own path>") itself, so after logging in the customer
// returns to the page they asked for; the layout only renders the frame.
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const customer = await getCurrentCustomer();
  if (!customer) return <>{children}</>; // the page redirects to the login page

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="eyebrow text-gold">My account</p>
        <h1 className="font-heading text-3xl font-bold text-crimson">Assalam-o-Alaikum, {customer.name}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <aside className="h-fit space-y-3 rounded-2xl border border-cream-deep bg-surface p-3 shadow-sm">
          <AccountNav />
          <form action={logoutCustomer} className="border-t border-cream-deep pt-3">
            <button
              type="submit"
              className="w-full rounded-lg px-4 py-2 text-left text-sm font-semibold text-crimson transition hover:bg-crimson/5"
            >
              Log out
            </button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
