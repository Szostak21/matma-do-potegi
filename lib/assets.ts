/** Ścieżki do plików w `public/images/` (od roota witryny). */
export const IMAGE_ASSETS = {
  brand: {
    logo: "/images/brand/logo.png",
  },
  hero: {
    main: "/images/hero/main.png",
    exerciseCloseUp: "/images/hero/excercise_close_up.png",
    bookshelf: "/images/hero/bookshelf.png",
    closeUp: "/images/hero/close_up.png",
  },
  teacher: {
    portrait: "/images/teacher/portrait.jpg",
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
