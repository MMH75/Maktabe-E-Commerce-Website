import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/account/AccountForms";
import { AuthCard } from "@/components/account/ui";
import { getCurrentCustomer, safeNext } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "Create an account — Maktaba Khuddam-ul-Quran" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentCustomer()) redirect(next);

  return (
    <AuthCard
      title="Create an account"
      subtitle="Save your addresses and wishlist, and follow your orders."
    >
      <RegisterForm next={next} />
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="font-semibold text-navy hover:text-gold">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
