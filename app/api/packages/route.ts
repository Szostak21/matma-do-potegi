import { NextResponse } from "next/server";

import { runLazyValidation } from "@/lib/groups";
import { getAllPackagesAvailability } from "@/lib/packages";

export async function GET() {
  await runLazyValidation();

  const packages = await getAllPackagesAvailability();

  return NextResponse.json({ packages });
}
