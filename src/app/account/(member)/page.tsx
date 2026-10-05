import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/account/AccountForms";
import { requireCustomer } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "My account — Maktaba Khuddam-ul-Quran" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const customer = await requireCustomer("/account");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 font-heading text-xl font-bold text-navy">Your details</h2>
        <ProfileForm
          initial={{ name: customer.name, email: customer.email, phone: customer.phone ?? "" }}
        />
      </section>
      <section className="rounded-2xl border border-cream-deep bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 font-heading text-xl font-bold text-navy">Change password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
