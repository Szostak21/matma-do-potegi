import { NextResponse } from "next/server";

import { verifyAdminSecret } from "@/lib/auth";

export function requireAdminRequest(request: Request): NextResponse | null {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (!verifyAdminSecret(secret)) {
    return new NextResponse(null, { status: 404 });
  }

  return null;
}
