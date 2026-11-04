import { NextResponse } from "next/server";

import { verifySharedSecret } from "@/lib/auth";

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when that env var is set.
 * The admin password is not accepted here.
 */
export function requireCronRequest(request: Request): NextResponse | null {
  const token = bearerToken(request);

  if (!verifySharedSecret(token, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
