import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/require-admin";

// ETAP 2+: akcja 5. dnia — twardy limit, status SUSPENDED

export async function POST(request: Request) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
