export const SITE_NAME = "Matma do potęgi";
export const SITE_HOST = "matmadopotegi.pl";
export const SITE_URL = "https://www.matmadopotegi.pl";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [SITE_HOST],
    url: `${SITE_URL}/`,
  };
}
