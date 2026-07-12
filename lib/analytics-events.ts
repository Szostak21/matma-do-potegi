import { hasAnalyticsConsent } from "@/lib/cookie-consent";

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

type EventParams = Record<string, string | number | boolean | undefined>;

function trackGaEvent(eventName: string, params?: EventParams) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

function trackMetaStandardEvent(eventName: string, params?: EventParams) {
  if (typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", eventName, params);
}

function trackMetaCustomEvent(eventName: string, params?: EventParams) {
  if (typeof window.fbq !== "function") {
    return;
  }

  window.fbq("trackCustom", eventName, params);
}

export function trackEvent(
  gaEventName: string,
  metaEventName: string,
  params?: EventParams,
  metaMode: "standard" | "custom" = "standard",
) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  trackGaEvent(gaEventName, params);

  if (metaMode === "custom") {
    trackMetaCustomEvent(metaEventName, params);
  } else {
    trackMetaStandardEvent(metaEventName, params);
  }
}

export function trackFormStart() {
  trackEvent("form_start", "FormStart", { form_name: "lead_signup" }, "custom");
}

export function trackLeadSubmit({ packageType }: { packageType: string }) {
  trackEvent(
    "generate_lead",
    "Lead",
    {
      package_type: packageType,
      form_name: "lead_signup",
    },
    "standard",
  );
}

export function trackBeginCheckout({
  value,
  currency = "PLN",
}: {
  value: number;
  currency?: string;
}) {
  trackEvent(
    "begin_checkout",
    "InitiateCheckout",
    {
      value,
      currency,
    },
    "standard",
  );
}

export function trackPurchase({
  value,
  currency = "PLN",
  transactionId,
}: {
  value: number;
  currency?: string;
  transactionId: string;
}) {
  trackEvent(
    "purchase",
    "Purchase",
    {
      value,
      currency,
      transaction_id: transactionId,
    },
    "standard",
  );
}

export function trackPageView(pagePath: string) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  trackGaEvent("page_view", { page_path: pagePath });
  trackMetaStandardEvent("PageView");
}
