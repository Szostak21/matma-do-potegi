import { NextResponse } from "next/server";

import { requireCronRequest } from "@/lib/require-admin";

// ETAP 2+: akcja 25. dnia - generowanie abonamentów miesięcznych

export async function POST(request: Request) {
  const denied = requireCronRequest(request);
  if (denied) return denied;

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
