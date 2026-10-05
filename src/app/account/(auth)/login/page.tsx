import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/AccountForms";
import { AuthCard } from "@/components/account/ui";
import { getCurrentCustomer, safeNext } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "Log in — Maktaba Khuddam-ul-Quran" };

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentCustomer()) redirect(next);

  return (
    <AuthCard title="Log in" subtitle="Welcome back. Log in to see your orders, addresses and wishlist.">
      <LoginForm next={next} />
      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="font-semibold text-navy hover:text-gold">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
