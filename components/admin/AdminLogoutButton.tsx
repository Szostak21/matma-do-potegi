import { logoutAdmin } from "@/actions/admin-session";

export function AdminLogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button
        type="submit"
        className="text-xs text-ink/50 underline-offset-2 hover:underline"
      >
        Wyloguj
      </button>
    </form>
  );
}
