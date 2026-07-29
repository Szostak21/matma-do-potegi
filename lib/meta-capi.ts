import "server-only";

import { createHash } from "node:crypto";

import { cookies, headers } from "next/headers";

import { META_PIXEL_ID } from "@/lib/analytics-config";
import {
  COOKIE_CONSENT_KEY,
  parseCookieConsent,
} from "@/lib/cookie-consent";

/**
 * Meta Conversions API (CAPI) — zdarzenia serwerowe.
 *
 * Token dostępu to SEKRET — czytany wyłącznie po stronie serwera (bez NEXT_PUBLIC_).
 * Pixel ID współdzielimy z warstwą przeglądarkową (NEXT_PUBLIC_META_PIXEL_ID),
 * dzięki czemu Meta deduplikuje zdarzenie przeglądarkowe i serwerowe po `event_id`.
 *
 * Wszystkie zdarzenia wysyłamy wyłącznie przy zgodzie marketingowej (ta sama
 * co Meta Pixel: cookie `matma_cookie_consent=granted`).
 */

const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN?.trim() ?? "";

/**
 * Kod testowy Events Manager → Test Events.
 * TODO: usuń po weryfikacji w zakładce "Testuj zdarzenia" (wróć do env META_CAPI_TEST_EVENT_CODE).
 */
const META_CAPI_TEST_EVENT_CODE = "TEST83272";

const GRAPH_API_VERSION = "v21.0";

export function isMetaCapiConfigured(): boolean {
  return Boolean(META_PIXEL_ID && META_CAPI_ACCESS_TOKEN);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Meta wymaga: trim + lowercase, następnie SHA-256. */
function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

/**
 * Meta wymaga: same cyfry z kodem kraju (bez "+"/spacji/liter), następnie SHA-256.
 * Polskie 9-cyfrowe numery uzupełniamy o prefix 48 (Advanced Matching / cross-device).
 */
function hashPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.length === 9) {
    digits = `48${digits}`;
  }

  return sha256(digits);
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

type MetaServerEventInput = {
  eventName: "Lead" | "InitiateCheckout" | "Purchase";
  /** Wspólny identyfikator zdarzenia dla deduplikacji z Pixelem przeglądarkowym. */
  eventId: string;
  eventSourceUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  customData?: Record<string, string | number | boolean>;
};

/**
 * Kontekst marketingowy z żądania (zgoda + identyfikatory Meta + IP/UA).
 * Używany w Server Actions / Route Handlers, gdzie dostępne są cookies()/headers().
 */
export type ServerMarketingContext = {
  consentGranted: boolean;
  fbp: string | null;
  fbc: string | null;
  clientIpAddress: string | null;
  clientUserAgent: string | null;
  eventSourceUrl: string | null;
};

export async function getServerMarketingContext(): Promise<ServerMarketingContext> {
  try {
    const [cookieStore, requestHeaders] = await Promise.all([
      cookies(),
      headers(),
    ]);

    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const clientIpAddress =
      forwardedFor?.split(",")[0]?.trim() ??
      requestHeaders.get("x-real-ip") ??
      null;

    return {
      consentGranted:
        parseCookieConsent(cookieStore.get(COOKIE_CONSENT_KEY)?.value) ===
        "granted",
      fbp: cookieStore.get("_fbp")?.value ?? null,
      fbc: cookieStore.get("_fbc")?.value ?? null,
      clientIpAddress,
      clientUserAgent: requestHeaders.get("user-agent"),
      eventSourceUrl: requestHeaders.get("referer"),
    };
  } catch {
    return {
      consentGranted: false,
      fbp: null,
      fbc: null,
      clientIpAddress: null,
      clientUserAgent: null,
      eventSourceUrl: null,
    };
  }
}

/**
 * Niskopoziomowa wysyłka zdarzenia do Graph API. Nie sprawdza zgody
 * (to odpowiedzialność wywołującego) i nigdy nie rzuca wyjątkiem.
 */
async function postMetaEvent(input: MetaServerEventInput): Promise<void> {
  if (!isMetaCapiConfigured()) {
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
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: String(input.eventId),
        action_source: "website",
        ...(input.eventSourceUrl
          ? { event_source_url: input.eventSourceUrl }
          : {}),
        user_data: userData,
        ...(input.customData ? { custom_data: input.customData } : {}),
      },
    ],
  };

  // Tymczasowo zawsze wysyłamy test_event_code (zob. META_CAPI_TEST_EVENT_CODE powyżej).
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
        `[Meta CAPI] ${input.eventName} failed (${response.status}): ${detail}`,
      );
    }
  } catch (error) {
    console.error(`[Meta CAPI] ${input.eventName} request error:`, error);
  }
}

type LeadContact = {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
};

/**
 * Serwerowe zdarzenie "Lead". Wymaga zgody (czytana z cookie w kontekście żądania).
 */
export async function sendMetaLeadEvent(
  input: {
    eventId: string;
    packageType?: string | null;
  } & LeadContact,
): Promise<void> {
  const ctx = await getServerMarketingContext();

  if (!ctx.consentGranted) {
    return;
  }

  await postMetaEvent({
    eventName: "Lead",
    eventId: input.eventId,
    email: input.email,
    phone: input.phone,
    fullName: input.fullName,
    clientIpAddress: ctx.clientIpAddress,
    clientUserAgent: ctx.clientUserAgent,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
    eventSourceUrl: ctx.eventSourceUrl,
    customData: {
      form_name: "lead_signup",
      ...(input.packageType ? { package_type: input.packageType } : {}),
    },
  });
}

/**
 * Serwerowe zdarzenie "InitiateCheckout" — z kontekstu żądania (Server Action).
 * eventId musi być współdzielony z Pixelem przeglądarkowym (dedup).
 */
export async function sendMetaInitiateCheckoutEvent(input: {
  eventId: string;
  value: number;
  currency?: string;
  contact: LeadContact;
}): Promise<void> {
  const ctx = await getServerMarketingContext();

  if (!ctx.consentGranted) {
    return;
  }

  await postMetaEvent({
    eventName: "InitiateCheckout",
    eventId: input.eventId,
    email: input.contact.email,
    phone: input.contact.phone,
    fullName: input.contact.fullName,
    clientIpAddress: ctx.clientIpAddress,
    clientUserAgent: ctx.clientUserAgent,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
    eventSourceUrl: ctx.eventSourceUrl,
    customData: {
      value: input.value,
      currency: input.currency ?? "PLN",
    },
  });
}

/**
 * Serwerowe zdarzenie "Purchase" — z webhooka Stripe (brak kontekstu żądania).
 * Zgoda, _fbp/_fbc oraz IP/UA pochodzą z metadanych sesji Stripe,
 * zapisanych przy tworzeniu checkoutu. eventId = token płatności (dedup z Pixelem).
 *
 * em/ph/fn/ln (SHA-256) + IP/UA + fbp/fbc = Advanced Matching cross-device.
 */
export async function sendMetaPurchaseEvent(input: {
  eventId: string;
  value: number;
  currency?: string;
  consentGranted: boolean;
  contact: LeadContact;
  fbp?: string | null;
  fbc?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
}): Promise<void> {
  if (!input.consentGranted) {
    return;
  }

  await postMetaEvent({
    eventName: "Purchase",
    eventId: input.eventId,
    email: input.contact.email,
    phone: input.contact.phone,
    fullName: input.contact.fullName,
    clientIpAddress: input.clientIpAddress,
    clientUserAgent: input.clientUserAgent,
    fbp: input.fbp,
    fbc: input.fbc,
    customData: {
      value: input.value,
      currency: input.currency ?? "PLN",
    },
  });
}
