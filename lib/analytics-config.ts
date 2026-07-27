/** Identyfikator pomiaru GA4 (format: G-XXXXXXXXXX). */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

/** ID Meta Pixel z Meta Events Manager. Opcjonalne. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

/** ID projektu Microsoft Clarity. Opcjonalne. */
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID?.trim() ?? "";

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

export function isValidGaMeasurementId(id: string): boolean {
  return GA_ID_PATTERN.test(id);
}

export function getGaMeasurementId(): string | null {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  if (!isValidGaMeasurementId(GA_MEASUREMENT_ID)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Analytics] NEXT_PUBLIC_GA_ID ma nieprawidłowy format: "${GA_MEASUREMENT_ID}". Oczekiwany format: G-XXXXXXXXXX`,
      );
    }

    return null;
  }

  return GA_MEASUREMENT_ID;
}
