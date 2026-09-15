"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { groszeToInputValue, parseMoneyInput } from "@/lib/money";

type MoneyFieldProps = {
  label: string;
  valueGrosze: number;
  disabled?: boolean;
  /** Wywoływane po opuszczeniu pola, gdy wartość faktycznie się zmieniła. */
  onCommit: (grosze: number) => void;
};

/**
 * Pole kwoty w złotych. Trzyma tekst lokalnie, a zapis puszcza dopiero na blur —
 * żeby wpisywanie "4", "41", "410" nie wywołało trzech zapisów do bazy.
 */
export function MoneyField({
  label,
  valueGrosze,
  disabled = false,
  onCommit,
}: MoneyFieldProps) {
  const [draft, setDraft] = useState(() => groszeToInputValue(valueGrosze));
  const [isInvalid, setIsInvalid] = useState(false);
  const [syncedGrosze, setSyncedGrosze] = useState(valueGrosze);

  // Kwota zmieniona na serwerze (zapis, przeliczenie) wygrywa z niezatwierdzonym
  // draftem. Korekta w trakcie renderu, nie w efekcie — bez kaskady renderów.
  if (syncedGrosze !== valueGrosze) {
    setSyncedGrosze(valueGrosze);
    setDraft(groszeToInputValue(valueGrosze));
    setIsInvalid(false);
  }

  function commit() {
    const parsed = parseMoneyInput(draft);

    if (parsed === null) {
      setIsInvalid(true);
      return;
    }

    setIsInvalid(false);

    if (parsed !== valueGrosze) {
      onCommit(parsed);
    }
  }

  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink/40">
        {label}
      </span>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          // Bez tego Chrome po odświeżeniu wstawia starą kwotę, która nie odpowiada bazie.
          autoComplete="off"
          value={draft}
          disabled={disabled}
          aria-invalid={isInvalid}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          className={cn(
            "w-full rounded-xl border bg-white py-2 pl-2.5 pr-7 text-sm tabular-nums text-ink transition focus:outline-none focus:ring-2 focus:ring-olive-500/20 disabled:bg-ink/5 disabled:text-ink/40",
            isInvalid
              ? "border-red-400 focus:border-red-500"
              : "border-ink/10 focus:border-olive-500",
          )}
        />
        <span
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink/35"
          aria-hidden
        >
          zł
        </span>
      </div>
    </label>
  );
}
