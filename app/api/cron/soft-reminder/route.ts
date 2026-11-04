import { NextResponse } from "next/server";

import { requireCronRequest } from "@/lib/require-admin";

// ETAP 2+: akcja 2. dnia - miękkie przypomnienie o płatności

export async function POST(request: Request) {
  const denied = requireCronRequest(request);
  if (denied) return denied;

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
