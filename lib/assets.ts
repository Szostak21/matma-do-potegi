/** Ścieżki do plików w `public/images/` (od roota witryny). */
export const IMAGE_ASSETS = {
  brand: {
    logo: "/images/brand/logo.png",
  },
  hero: {
    /** Zdjęcia do sekcji hero - dodaj pliki do `public/images/hero/`. */
  },
  teacher: {
    /** Zdjęcie nauczyciela - dodaj plik do `public/images/teacher/`. */
  },
} as const;

export const BRAND_ASSETS = IMAGE_ASSETS.brand;

export function getPublicAssetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!base) {
    return path;
  }

  return `${base}${path}`;
}
