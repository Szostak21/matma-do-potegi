import { describe, expect, it } from "vitest";

import {
  formatTrafficSourceLabel,
  inferUtmFromClickIds,
  parseUtmFromSearch,
} from "@/lib/utm";

describe("utm", () => {
  it("reads the campaign parameters", () => {
    expect(
      parseUtmFromSearch(
        "?utm_source=google&utm_medium=cpc&utm_campaign=matura",
      ),
    ).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "matura",
    });
  });

  it("infers the channel from a click id when UTM is missing", () => {
    expect(inferUtmFromClickIds("?gclid=abc", {})).toMatchObject({
      utm_source: "google",
      utm_medium: "cpc",
    });
    expect(inferUtmFromClickIds("?fbclid=abc", {})).toMatchObject({
      utm_source: "facebook",
      utm_medium: "paid",
    });
  });

  it("does not overwrite an explicit source", () => {
    expect(
      inferUtmFromClickIds("?utm_source=newsletter&gclid=abc", {
        utm_source: "newsletter",
      }),
    ).toEqual({ utm_source: "newsletter" });
  });

  it("labels paid Google traffic for the admin panel", () => {
    expect(
      formatTrafficSourceLabel({
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "matura-2026",
        utmContent: null,
      }),
    ).toBe("Google Ads · matura 2026");
  });
});
