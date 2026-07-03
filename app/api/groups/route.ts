import { NextResponse } from "next/server";

import {
  getAvailableGroups,
  isValidPackageType,
  runLazyValidation,
} from "@/lib/groups";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packageParam = searchParams.get("package");

  if (!packageParam || !isValidPackageType(packageParam)) {
    return NextResponse.json({ groups: [] });
  }

  await runLazyValidation();

  const groups = await getAvailableGroups(packageParam);

  return NextResponse.json({ groups });
}
