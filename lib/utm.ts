/**
 * First-touch atrybucja z kampanii (UTM + kliknięcia Google Ads / Meta).
 * Zapis w sessionStorage przy pierwszym wejściu z parametrami w URL.
 */

export const UTM_STORAGE_KEY = "matma_utm_first_touch";

export const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
] as const;

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number];

export type UtmParams = Partial<Record<UtmParamKey, string>>;

export type LeadUtmFields = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
};

const MAX_UTM_LENGTH = 200;

const PAID_MEDIA = new Set([
  "cpc",
  "ppc",
  "paid",
  "paidsearch",
  "paid_search",
  "paidsocial",
  "paid_social",
  "ads",
  "display",
]);

const ORGANIC_MEDIA = new Set(["organic", "seo"]);

function sanitizeUtmValue(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().slice(0, MAX_UTM_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseSearchParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

/** Odczyt UTM z query stringa (np. window.location.search). */
export function parseUtmFromSearch(search: string): UtmParams {
  const params = parseSearchParams(search);
  const result: UtmParams = {};

  for (const key of UTM_PARAM_KEYS) {
    const value = sanitizeUtmValue(params.get(key));
    if (value) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Auto-tagowanie Google Ads (`gclid`) i Meta (`fbclid`) nie dodaje UTM.
 * Gdy nie ma source, uzupełniamy kanał, żeby lead nie wyglądał na „bezpośredni”.
 */
export function inferUtmFromClickIds(
  search: string,
  params: UtmParams,
): UtmParams {
  if (params.utm_source) {
    return params;
  }

  const query = parseSearchParams(search);
  const inferred: UtmParams = { ...params };

  if (query.get("gclid")) {
    inferred.utm_source = "google";
    inferred.utm_medium = inferred.utm_medium ?? "cpc";
  } else if (query.get("fbclid")) {
    inferred.utm_source = "facebook";
    inferred.utm_medium = inferred.utm_medium ?? "paid";
  }

  return inferred;
}

export function hasAnyUtm(params: UtmParams): boolean {
  return UTM_PARAM_KEYS.some((key) => Boolean(params[key]));
}

/** First-touch: zapisz tylko gdy jeszcze nic nie ma w sessionStorage. */
export function captureFirstTouchUtmFromSearch(search: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const parsed = inferUtmFromClickIds(search, parseUtmFromSearch(search));
  if (!hasAnyUtm(parsed)) {
    return;
  }

  try {
    if (sessionStorage.getItem(UTM_STORAGE_KEY)) {
      return;
    }

    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // sessionStorage niedostępny (prywatny tryb / quota) — pomiń
  }
}

export function readStoredUtm(): UtmParams {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const result: UtmParams = {};
    for (const key of UTM_PARAM_KEYS) {
      const value = sanitizeUtmValue(
        (parsed as Record<string, unknown>)[key] as string | undefined,
      );
      if (value) {
        result[key] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
}

export function utmParamsToLeadFields(params: UtmParams): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
} {
  return {
    utmSource: params.utm_source,
    utmMedium: params.utm_medium,
    utmCampaign: params.utm_campaign,
    utmContent: params.utm_content,
  };
}

function normalizeToken(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function humanizeToken(value: string): string {
  let decoded = value.replace(/\+/g, " ");

  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // zostaw surowy ciąg, jeśli nie da się zdekodować
  }

  return decoded.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function looksLikeTrackingId(value: string): boolean {
  const compact = value.replace(/[\s_-]/g, "");
  if (compact.length < 6) {
    return false;
  }

  return /^[0-9]+$/.test(compact) || /^[0-9a-f]{8,}$/i.test(compact);
}

function isPaidMedium(medium: string): boolean {
  return PAID_MEDIA.has(medium);
}

function isOrganicMedium(medium: string): boolean {
  return ORGANIC_MEDIA.has(medium) || medium === "";
}

function channelLabel(source: string, medium: string): string | null {
  const isGoogle =
    source === "google" ||
    source === "googleads" ||
    source === "adwords" ||
    source === "google ads";
  const isMeta =
    source === "facebook" ||
    source === "fb" ||
    source === "ig" ||
    source === "instagram" ||
    source === "meta" ||
    source === "an";

  if (isGoogle && (isPaidMedium(medium) || medium === "cpc")) {
    return "Google Ads";
  }
  if (isGoogle && isOrganicMedium(medium)) {
    return "Google";
  }
  if (isMeta && isPaidMedium(medium)) {
    return source === "instagram" || source === "ig" ? "Instagram Ads" : "Meta Ads";
  }
  if (source === "instagram" || source === "ig") {
    return "Instagram";
  }
  if (source === "facebook" || source === "fb") {
    return "Facebook";
  }
  if (source === "tiktok") {
    return "TikTok";
  }
  if (medium === "email" || source === "newsletter" || source === "email") {
    return "E-mail";
  }
  if (medium === "referral" && source) {
    return humanizeToken(source);
  }
  if (source) {
    return humanizeToken(source);
  }
  if (medium) {
    return humanizeToken(medium);
  }

  return null;
}

function extraDetail(fields: LeadUtmFields, channel: string): string | null {
  const candidates = [fields.utmCampaign, fields.utmContent]
    .map((value) => (value ? humanizeToken(value) : ""))
    .filter((value) => value.length > 0 && !looksLikeTrackingId(value));

  const unique = candidates.filter(
    (value, index) =>
      candidates.findIndex((item) => item.toLowerCase() === value.toLowerCase()) ===
      index,
  );

  for (const value of unique) {
    if (value.toLowerCase() === channel.toLowerCase()) {
      continue;
    }

    return value.length > 48 ? `${value.slice(0, 47).trim()}…` : value;
  }

  return null;
}

/**
 * Krótka etykieta „skąd przyszedł” do panelu i maila, bez surowych parametrów.
 */
export function formatTrafficSourceLabel(fields: LeadUtmFields): string | null {
  const source = normalizeToken(fields.utmSource);
  const medium = normalizeToken(fields.utmMedium);

  if (!source && !medium && !fields.utmCampaign && !fields.utmContent) {
    return null;
  }

  const channel = channelLabel(source, medium);
  if (!channel) {
    const fallback = extraDetail(fields, "");
    return fallback;
  }

  const detail = extraDetail(fields, channel);
  return detail ? `${channel} · ${detail}` : channel;
}

/** @deprecated Użyj formatTrafficSourceLabel. */
export function formatUtmForAdmin(fields: LeadUtmFields): string | null {
  return formatTrafficSourceLabel(fields);
}
