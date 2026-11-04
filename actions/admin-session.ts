"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/admin-session";
import { verifyAdminPassword } from "@/lib/auth";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password")?.toString();

  if (!verifyAdminPassword(password)) {
    return { status: "error", message: "Nieprawidłowe hasło." };
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin");
}
