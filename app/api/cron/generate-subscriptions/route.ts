import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/require-admin";

// ETAP 2+: akcja 25. dnia — generowanie abonamentów miesięcznych

export async function POST(request: Request) {
  const denied = requireAdminRequest(request);
  if (denied) return denied;

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
