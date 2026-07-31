/**
 * First-touch UTM z kampanii (Meta Ads: source, medium, campaign, content).
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

function sanitizeUtmValue(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().slice(0, MAX_UTM_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Odczyt UTM z query stringa (np. window.location.search). */
export function parseUtmFromSearch(search: string): UtmParams {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const result: UtmParams = {};

  for (const key of UTM_PARAM_KEYS) {
    const value = sanitizeUtmValue(params.get(key));
    if (value) {
      result[key] = value;
    }
  }

  return result;
}

export function hasAnyUtm(params: UtmParams): boolean {
  return UTM_PARAM_KEYS.some((key) => Boolean(params[key]));
}

/** First-touch: zapisz tylko gdy jeszcze nic nie ma w sessionStorage. */
export function captureFirstTouchUtmFromSearch(search: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const parsed = parseUtmFromSearch(search);
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

/**
 * Jedna komórka admina: source / medium / campaign / content (linie),
 * albo null → wyświetl "-".
 */
export function formatUtmForAdmin(fields: LeadUtmFields): string | null {
  const lines: string[] = [];

  if (fields.utmSource) {
    lines.push(`source: ${fields.utmSource}`);
  }
  if (fields.utmMedium) {
    lines.push(`medium: ${fields.utmMedium}`);
  }
  if (fields.utmCampaign) {
    lines.push(`campaign: ${fields.utmCampaign}`);
  }
  if (fields.utmContent) {
    lines.push(`content: ${fields.utmContent}`);
  }

  return lines.length > 0 ? lines.join("\n") : null;
}
