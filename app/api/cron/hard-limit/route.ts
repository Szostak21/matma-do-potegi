import { NextResponse } from "next/server";

// ETAP 2+: akcja 5. dnia — twardy limit, status SUSPENDED

export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
