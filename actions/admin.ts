"use server";

import { revalidatePath } from "next/cache";

import { assertAdminSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resetDatabaseToSeedState } from "@/lib/seed";

export type ResetDatabaseState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function resetDatabase(
  _prevState: ResetDatabaseState,
  formData: FormData,
): Promise<ResetDatabaseState> {
  const secret = formData.get("secret")?.toString();

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  const confirmed = formData.get("confirm")?.toString();

  if (confirmed !== "RESET") {
    return {
      status: "error",
      message: "Potwierdzenie nieprawidłowe. Wpisz RESET w polu potwierdzenia.",
    };
  }

  try {
    await resetDatabaseToSeedState(prisma);
    revalidatePath("/admin");

    return {
      status: "success",
      message: "Baza została zresetowana do stanu po seedzie.",
    };
  } catch {
    return {
      status: "error",
      message: "Nie udało się zresetować bazy. Spróbuj ponownie.",
    };
  }
}
