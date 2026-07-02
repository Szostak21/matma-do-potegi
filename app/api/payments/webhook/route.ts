import { NextResponse } from "next/server";

// ETAP 2+: potwierdzenie wpłaty od bramki płatności

export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
