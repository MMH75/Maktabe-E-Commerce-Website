"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, createSession, deleteSession, isAuthConfigured } from "@/lib/auth";

export type LoginState = { error: string } | undefined;

// Failed attempts per IP address, kept in memory (resets when the server restarts)
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; firstAt: number }>();

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return { error: "Admin login is not set up yet. Run `npm run set-admin-password` on the server." };
  }

  const ip = await clientIp();
  const record = failures.get(ip);
  if (record && Date.now() - record.firstAt > LOCKOUT_MS) failures.delete(ip);
  const current = failures.get(ip);
  if (current && current.count >= MAX_FAILURES) {
    return { error: "Too many wrong attempts. Please wait 15 minutes and try again." };
  }

  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) {
    failures.set(ip, { count: (current?.count ?? 0) + 1, firstAt: current?.firstAt ?? Date.now() });
    await new Promise((r) => setTimeout(r, 1000)); // slow down guessing
    return { error: "Incorrect password." };
  }

  failures.delete(ip);
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/admin/login");
}
