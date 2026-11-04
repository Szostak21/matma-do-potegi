import { createHmac, timingSafeEqual } from "node:crypto";

function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function verifySharedSecret(
  candidate: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!candidate || !expected) {
    return false;
  }

  return constantTimeEqual(candidate, expected);
}

export function verifyAdminPassword(
  password: string | null | undefined,
): boolean {
  return verifySharedSecret(password, process.env.ADMIN_SECRET);
}

export const ADMIN_SESSION_COOKIE = "matma_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export function adminSessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}

function sessionSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Signed `expiry.hmac` token. The admin password itself never goes into the cookie. */
export function createAdminSessionToken(
  nowMs: number = Date.now(),
  secret: string | undefined = process.env.ADMIN_SECRET,
): string {
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }

  const exp = Math.floor(nowMs / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS;
  const payload = String(exp);
  return `${payload}.${sessionSignature(payload, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | null | undefined,
  nowMs: number = Date.now(),
  secret: string | undefined = process.env.ADMIN_SECRET,
): boolean {
  if (!token || !secret) {
    return false;
  }

  const separator = token.lastIndexOf(".");
  if (separator <= 0) {
    return false;
  }

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sessionSignature(payload, secret);

  if (!constantTimeEqual(signature, expected)) {
    return false;
  }

  const exp = Number(payload);
  if (!Number.isFinite(exp)) {
    return false;
  }

  return exp * 1000 > nowMs;
}
