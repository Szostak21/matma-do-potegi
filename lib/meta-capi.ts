import "server-only";

import { createHash } from "node:crypto";

import { cookies } from "next/headers";

import { META_PIXEL_ID } from "@/lib/analytics-config";
import {
  COOKIE_CONSENT_KEY,
  parseCookieConsent,
} from "@/lib/cookie-consent";

/**
 * Meta Conversions API (CAPI) — wysyłka zdarzeń serwerowych.
 *
 * Token dostępu to SEKRET — czytany wyłącznie po stronie serwera (bez NEXT_PUBLIC_).
 * Pixel ID współdzielimy z warstwą przeglądarkową (NEXT_PUBLIC_META_PIXEL_ID),
 * dzięki czemu Meta może zdeduplikować zdarzenie przeglądarkowe i serwerowe
 * po wspólnym `event_id`.
 *
 * CAPI uruchamia się wyłącznie przy zgodzie marketingowej (ten sam wybór
 * co Meta Pixel: cookie `matma_cookie_consent=granted`).
 */

const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN?.trim() ?? "";

/** Kod testowy z Events Manager -> Test Events (opcjonalny, tylko do debugowania). */
const META_CAPI_TEST_EVENT_CODE =
  process.env.META_CAPI_TEST_EVENT_CODE?.trim() ?? "";

const GRAPH_API_VERSION = "v21.0";

export function isMetaCapiConfigured(): boolean {
  return Boolean(META_PIXEL_ID && META_CAPI_ACCESS_TOKEN);
}

async function hasMarketingConsent(): Promise<boolean> {
  const cookieStore = await cookies();
  return (
    parseCookieConsent(cookieStore.get(COOKIE_CONSENT_KEY)?.value) === "granted"
  );
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Meta wymaga: trim + lowercase, następnie SHA-256. */
function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

/** Meta wymaga: same cyfry z kodem kraju (bez "+"/spacji/liter), następnie SHA-256. */
function hashPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return sha256(digitsOnly);
}

/** Meta wymaga: trim + lowercase, następnie SHA-256. */
function hashName(name: string): string {
  return sha256(name.trim().toLowerCase());
}

/** Rozbija "Imię Nazwisko" na osobne, zahashowane pola fn/ln. */
function splitAndHashName(fullName: string): { fn?: string[]; ln?: string[] } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {};
  }

  const [first, ...rest] = parts;
  const result: { fn?: string[]; ln?: string[] } = { fn: [hashName(first)] };

  if (rest.length > 0) {
    result.ln = [hashName(rest.join(" "))];
  }

  return result;
}

type MetaLeadEventInput = {
  /** Wspólny identyfikator zdarzenia dla deduplikacji z Pixelem przeglądarkowym. */
  eventId: string;
  eventSourceUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  /** Wartość cookie _fbp (Meta browser id). */
  fbp?: string | null;
  /** Wartość cookie _fbc (Meta click id). */
  fbc?: string | null;
  customData?: Record<string, string | number | boolean>;
};

type MetaUserData = {
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
};

/**
 * Wysyła standardowe zdarzenie "Lead" do Meta Conversions API.
 *
 * Side-effect: nigdy nie rzuca wyjątkiem. Wymaga zgody marketingowej
 * (ta sama co Meta Pixel).
 */
export async function sendMetaLeadEvent(
  input: MetaLeadEventInput,
): Promise<void> {
  if (!isMetaCapiConfigured()) {
    return;
  }

  if (!(await hasMarketingConsent())) {
    return;
  }

  const userData: MetaUserData = {};

  if (input.email) {
    userData.em = [hashEmail(input.email)];
  }
  if (input.phone) {
    userData.ph = [hashPhone(input.phone)];
  }
  if (input.fullName) {
    const { fn, ln } = splitAndHashName(input.fullName);
    if (fn) userData.fn = fn;
    if (ln) userData.ln = ln;
  }
  if (input.clientIpAddress) {
    userData.client_ip_address = input.clientIpAddress;
  }
  if (input.clientUserAgent) {
    userData.client_user_agent = input.clientUserAgent;
  }
  if (input.fbp) {
    userData.fbp = input.fbp;
  }
  if (input.fbc) {
    userData.fbc = input.fbc;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl
          ? { event_source_url: input.eventSourceUrl }
          : {}),
        user_data: userData,
        ...(input.customData ? { custom_data: input.customData } : {}),
      },
    ],
  };

  if (META_CAPI_TEST_EVENT_CODE) {
    payload.test_event_code = META_CAPI_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${META_CAPI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(
        `[Meta CAPI] Lead event failed (${response.status}): ${detail}`,
      );
    }
  } catch (error) {
    console.error("[Meta CAPI] Lead event request error:", error);
  }
}
