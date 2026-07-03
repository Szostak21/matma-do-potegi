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
    element.getBoundingClientRect().top +
    window.scrollY -
    NAVBAR_HEIGHT_PX;

  window.scrollTo({ top, behavior });
  return true;
}

export function getSectionIdFromHref(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return null;
  }

  return href.slice(hashIndex + 1) || null;
}
