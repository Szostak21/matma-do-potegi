"use client";

import { useActionState } from "react";

import { loginAdmin, type LoginState } from "@/actions/admin-session";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: LoginState = { status: "idle" };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-oatmeal px-4 py-16">
      <form
        action={action}
        className="w-full max-w-sm rounded-3xl bg-white/80 p-6 shadow-soft ring-1 ring-ink/5"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-olive-700">
          Panel administratora
        </p>
        <h1 className="mt-2 font-serif text-3xl text-ink">Logowanie</h1>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/45">
            Hasło
          </span>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            autoFocus
          />
        </label>
        {state.status === "error" && state.message ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" className="mt-5 w-full" disabled={pending}>
          {pending ? "Logowanie…" : "Zaloguj"}
        </Button>
      </form>
    </main>
  );
}
