import { jwtVerify, SignJWT } from "jose";

// Signing and verifying the admin session token. Kept free of next/headers so
// it can be used both by src/proxy.ts and by server code (src/lib/auth.ts).

export const SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 7;

export type Session = { role: "admin" };

function getSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function signSession(): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("SESSION_SECRET is missing or shorter than 32 characters");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

/** Returns the session if the token is genuine and not expired, otherwise null. */
export async function readSession(token: string | undefined): Promise<Session | null> {
  const secret = getSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload.role === "admin" ? { role: "admin" } : null;
  } catch {
    return null;
  }
}
