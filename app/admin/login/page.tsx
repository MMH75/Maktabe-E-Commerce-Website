import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="rounded-2xl border border-cream-deep bg-surface p-6 shadow-sm sm:p-8">
        <p className="eyebrow text-gold">Admin Panel</p>
        <h1 className="mt-1 mb-6 font-heading text-3xl font-bold text-crimson">Log in</h1>
        <LoginForm />
      </div>
      <p className="mt-4 text-center">
        <Link href="/" className="text-xs font-semibold text-muted hover:text-navy">
          ← Back to the website
        </Link>
      </p>
    </div>
  );
}
