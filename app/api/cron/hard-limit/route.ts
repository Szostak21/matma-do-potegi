import { NextResponse } from "next/server";

import { requireCronRequest } from "@/lib/require-admin";

// ETAP 2+: akcja 5. dnia — twarde przypomnienie / lista do kontaktu
// (dawniej planowany status SUSPENDED — usunięty z enumu)

export async function POST(request: Request) {
  const denied = requireCronRequest(request);
  if (denied) return denied;

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
