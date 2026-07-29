"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useSyncExternalStore } from "react";

import { ContactLinkTracker } from "@/components/ContactLinkTracker";
import { trackPageView } from "@/lib/analytics-events";
import { CLARITY_ID, getGaMeasurementId, META_PIXEL_ID } from "@/lib/analytics-config";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  getCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

const GA_ID = getGaMeasurementId();

function subscribeToConsentChanges(onStoreChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onStoreChange);
  };
}

function getServerConsentSnapshot(): CookieConsent | null {
  return null;
}

function RoutePageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackPageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  const consent = useSyncExternalStore(
    subscribeToConsentChanges,
    getCookieConsent,
    getServerConsentSnapshot,
  );

  if (consent !== "granted") {
    return null;
  }

  const hasTracking = Boolean(GA_ID || META_PIXEL_ID || CLARITY_ID);

  return (
    <>
      {GA_ID ? (
        <>
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
              });
              gtag('config', '${GA_ID}', {
                anonymize_ip: true,
                send_page_view: false,
                transport_type: 'beacon'
              });
              gtag('event', 'page_view', {
                page_path: window.location.pathname + window.location.search
              });
            `}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        </>
      ) : null}
      {META_PIXEL_ID ? (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              width="1"
              className="hidden"
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
      {CLARITY_ID ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      ) : null}
      {hasTracking ? (
        <>
          <Suspense fallback={null}>
            <RoutePageViewTracker />
          </Suspense>
          <ContactLinkTracker />
        </>
      ) : null}
    </>
  );
}
