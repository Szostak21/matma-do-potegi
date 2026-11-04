export const NAVBAR_HEIGHT_PX = 64;

export function scrollToSectionId(
  id: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const element = document.getElementById(id);
  if (!element) {
    return false;
  }

  const top =
    element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT_PX;

  window.scrollTo({ top, behavior });
  return true;
}

/**
 * Przewija w górę tak, by górna krawędź elementu była tuż pod sticky navbarem.
 * Nie robi nic, gdy element jest już na lub poniżej tej linii (nigdy nie scrolluje w dół).
 */
export function scrollUpToElementUnderNavbar(
  element: HTMLElement,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const rect = element.getBoundingClientRect();

  if (rect.top >= NAVBAR_HEIGHT_PX) {
    return false;
  }

  const top = window.scrollY + rect.top - NAVBAR_HEIGHT_PX;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

/**
 * Bierze pierwsze pole z przekazanej tablicy (kolejność formularza),
 * dla którego istnieje etykieta `label[for]`, i scrolluje w górę tylko gdy
 * tytuł jest ponad bezpiecznym obszarem pod navbarem.
 * Bez programatycznego focus — clear-on-focus nie może skasować komunikatu.
 */
export function scrollUpToFirstInvalidFieldLabel(
  fieldIds: readonly string[],
  behavior: ScrollBehavior = "smooth",
): void {
  for (const id of fieldIds) {
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${CSS.escape(id)}"]`,
    );
    if (label) {
      scrollUpToElementUnderNavbar(label, behavior);
      return;
    }
  }
}

export function getSectionIdFromHref(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return null;
  }

  return href.slice(hashIndex + 1) || null;
}
