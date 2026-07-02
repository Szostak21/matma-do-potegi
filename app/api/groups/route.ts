import { NextResponse } from "next/server";

// ETAP 2+: GET lista grup + Lazy Validation

export async function GET() {
  return NextResponse.json({ groups: [] });
}
