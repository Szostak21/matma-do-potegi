export function groszeToZl(grosze: number): string {
  return (grosze / 100).toFixed(2);
}

export function zlToGrosze(zl: number): number {
  return Math.round(zl * 100);
}

export function formatPln(grosze: number): string {
  return `${groszeToZl(grosze)} zł`;
}

/** Wartość dla pola edycji kwoty: pełne złotówki bez zer, grosze z przecinkiem. */
export function groszeToInputValue(grosze: number): string {
  return grosze % 100 === 0
    ? String(grosze / 100)
    : (grosze / 100).toFixed(2).replace(".", ",");
}

/**
 * Parsuje ręcznie wpisaną kwotę w złotych na grosze. Przyjmuje przecinek i kropkę
 * oraz wartości ujemne (dopłata zamiast zniżki). `null` = wpisano coś nieliczbowego.
 */
export function parseMoneyInput(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");

  if (normalized === "" || normalized === "-") {
    return 0;
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  return zlToGrosze(Number(normalized));
}
