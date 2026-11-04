import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { getGaMeasurementId, META_PIXEL_ID } from "@/lib/analytics-config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: {
      (...args: unknown[]): void;
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: Window["fbq"];
  }
}

type EventParams = Record<
  string,
  | string
  | number
  | boolean
  | undefined
  | ReadonlyArray<Record<string, string | number>>
>;

type TrackResult = {
  ga: boolean;
  meta: boolean;
};

function trackGaEvent(eventName: string, params?: EventParams): boolean {
  if (typeof window.gtag !== "function") {
    return false;
  }

  window.gtag("event", eventName, params);
  return true;
}

function trackMetaStandardEvent(
  eventName: string,
  params?: EventParams,
  options?: { eventID?: string },
): boolean {
  if (typeof window.fbq !== "function") {
    return false;
  }

  if (options?.eventID) {
    window.fbq("track", eventName, params, { eventID: options.eventID });
  } else {
    window.fbq("track", eventName, params);
  }

  return true;
}

function trackMetaCustomEvent(
  eventName: string,
  params?: EventParams,
): boolean {
  if (typeof window.fbq !== "function") {
    return false;
  }

  window.fbq("trackCustom", eventName, params);
  return true;
}

export function trackEvent(
  gaEventName: string,
  metaEventName: string,
  params?: EventParams,
  metaMode: "standard" | "custom" = "standard",
  options?: { eventID?: string },
): TrackResult {
  if (!hasAnalyticsConsent()) {
    return { ga: false, meta: false };
  }

  const ga = trackGaEvent(gaEventName, params);
  const meta =
    metaMode === "custom"
      ? trackMetaCustomEvent(metaEventName, params)
      : trackMetaStandardEvent(metaEventName, params, options);

  return { ga, meta };
}

export function trackFormStart() {
  trackEvent("form_start", "FormStart", { form_name: "lead_signup" }, "custom");
}

/**
 * GA4-only: które pola nie przeszły walidacji (same nazwy, bez wartości / PII).
 * Nie wysyłamy do Meta — kampania Lead nienaruszona.
 */
export function trackFormValidationError({ fields }: { fields: string[] }) {
  if (!hasAnalyticsConsent() || fields.length === 0) {
    return;
  }

  trackGaEvent("form_validation_error", {
    form_name: "lead_signup",
    invalid_fields: fields.join(","),
    field_count: fields.length,
  });
}

export async function trackLeadSubmit({
  packageType,
  eventId,
}: {
  packageType: string;
  /** Ten sam eventId co w zdarzeniu serwerowym CAPI — dla deduplikacji. */
  eventId?: string;
}): Promise<void> {
  if (!hasAnalyticsConsent()) {
    return;
  }

  const params = {
    package_type: packageType,
    form_name: "lead_signup",
  };

  trackMetaStandardEvent(
    "Lead",
    params,
    eventId ? { eventID: eventId } : undefined,
  );

  // Czekamy na GA4, zanim ContactForm zrobi router.push — inaczej
  // Google Ads (import generate_lead) może zgubić konwersję.
  await trackGaEventWithCallback("generate_lead", params, 800);
  await sleep(150);
}

/**
 * Wysyła zdarzenie GA4 i rozwiązuje promise, gdy realnie wyszło (event_callback)
 * lub po timeoucie — dzięki temu przed redirectem do Stripe nie gubimy zdarzenia.
 */
function trackGaEventWithCallback(
  eventName: string,
  params: EventParams,
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.gtag !== "function") {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    window.gtag("event", eventName, { ...params, event_callback: finish });
    window.setTimeout(finish, timeoutMs);
  });
}

/**
 * InitiateCheckout (Meta) + begin_checkout (GA4). Zwraca promise, którego
 * należy poczekać PRZED przekierowaniem do Stripe — inaczej beacon może nie
 * zdążyć wyjść i zdarzenie (kluczowe dla optymalizacji kampanii) ginie.
 */
export async function trackBeginCheckout({
  value,
  currency = "PLN",
  eventId,
}: {
  value: number;
  currency?: string;
  /** Wspólny eventId z serwerowym InitiateCheckout (CAPI) — deduplikacja. */
  eventId?: string;
}): Promise<void> {
  if (!hasAnalyticsConsent()) {
    return;
  }

  const items = [
    {
      item_id: "deposit",
      item_name: "Zaliczka",
      item_category: "deposit",
      price: value,
      quantity: 1,
    },
  ];

  // Meta najpierw — fbq przetwarza kolejkę natychmiast (sendBeacon).
  trackMetaStandardEvent(
    "InitiateCheckout",
    { value, currency },
    eventId ? { eventID: eventId } : undefined,
  );

  // GA4 z callbackiem — poczekaj aż zdarzenie faktycznie wyjdzie.
  await trackGaEventWithCallback(
    "begin_checkout",
    { value, currency, items },
    800,
  );

  // Krótki bufor, by beacon Meta zdążył opuścić stronę.
  await sleep(150);
}

/**
 * ViewContent (Meta) + view_item (GA4) — użytkownik ogląda ofertę/zaliczkę
 * na stronie podsumowania rezerwacji. Świetne do remarketingu ciepłej grupy.
 */
export function trackViewContent({
  packageType,
  value,
  currency = "PLN",
}: {
  packageType: string;
  value: number;
  currency?: string;
}): TrackResult {
  if (!hasAnalyticsConsent()) {
    return { ga: false, meta: false };
  }

  const items = [
    {
      item_id: packageType,
      item_name: packageType,
      item_category: "package",
      price: value,
      quantity: 1,
    },
  ];

  const ga = trackGaEvent("view_item", { value, currency, items });
  const meta = trackMetaStandardEvent("ViewContent", {
    value,
    currency,
    content_type: "product",
    content_category: packageType,
  });

  return { ga, meta };
}

/**
 * Contact (Meta) + contact (GA4) — kliknięcie w telefon lub e-mail.
 * Silny sygnał intencji: klient próbuje się skontaktować bezpośrednio.
 */
export function trackContact(method: "phone" | "email"): TrackResult {
  return trackEvent("contact", "Contact", { method });
}

export function trackPurchase({
  value,
  currency = "PLN",
  transactionId,
}: {
  value: number;
  currency?: string;
  transactionId: string;
}): TrackResult {
  if (!hasAnalyticsConsent()) {
    return { ga: false, meta: false };
  }

  // GA4 ecommerce (wymagane: transaction_id, value, currency; items = lepszy raport).
  const ga = trackGaEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    items: [
      {
        item_id: "deposit",
        item_name: "Zaliczka",
        item_category: "deposit",
        price: value,
        quantity: 1,
      },
    ],
  });

  // Meta Purchase — value/currency; eventID = token płatności (dedup z przyszłym CAPI).
  const meta = trackMetaStandardEvent(
    "Purchase",
    { value, currency },
    { eventID: transactionId },
  );

  return { ga, meta };
}

export function trackPageView(pagePath: string) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  // GA4 używa page_location/page_title (page_path to relikt Universal Analytics).
  trackGaEvent("page_view", {
    page_location:
      typeof window !== "undefined" ? window.location.href : pagePath,
    page_title: typeof document !== "undefined" ? document.title : undefined,
    page_path: pagePath,
  });
  trackMetaStandardEvent("PageView");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Czeka aż skrypty GA4/Meta będą gotowe po zgodzie (po powrocie ze Stripe
 * Script afterInteractive ładuje się asynchronicznie — bez tego purchase ginie).
 */
export async function waitForTrackingReady(options?: {
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<TrackResult> {
  const timeoutMs = options?.timeoutMs ?? 10_000;
  const intervalMs = options?.intervalMs ?? 150;
  const startedAt = Date.now();
  const needsGa = Boolean(getGaMeasurementId());
  const needsMeta = Boolean(META_PIXEL_ID);

  while (Date.now() - startedAt < timeoutMs) {
    if (!hasAnalyticsConsent()) {
      await sleep(intervalMs);
      continue;
    }

    const ga = !needsGa || typeof window.gtag === "function";
    const meta = !needsMeta || typeof window.fbq === "function";

    if (ga && meta) {
      return {
        ga: needsGa && typeof window.gtag === "function",
        meta: needsMeta && typeof window.fbq === "function",
      };
    }

    await sleep(intervalMs);
  }

  return {
    ga: typeof window.gtag === "function",
    meta: typeof window.fbq === "function",
  };
}
