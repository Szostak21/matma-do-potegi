import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAdminSecret } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/cron")) {
    const secret = searchParams.get("secret");

    if (!verifyAdminSecret(secret)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/cron/:path*"],
};
