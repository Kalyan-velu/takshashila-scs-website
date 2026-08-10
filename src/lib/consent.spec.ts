import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  getStoredConsent,
  saveConsent,
  acceptAllConsent,
  rejectOptionalConsent,
  loadClarity,
} from "./consent";

describe("consent.ts", () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as any).dataLayer;
    delete (window as any).gtag;
    delete (window as any).clarity;
  });

  it("returns null when no consent is stored", () => {
    expect(getStoredConsent()).toBeNull();
  });

  it("saves and retrieves consent preferences", () => {
    const prefs = saveConsent({ analytics: true, marketing: false });

    expect(prefs.necessary).toBe(true);
    expect(prefs.analytics).toBe(true);
    expect(prefs.marketing).toBe(false);

    const stored = getStoredConsent();
    expect(stored?.analytics).toBe(true);
    expect(stored?.marketing).toBe(false);
  });

  it("updates Google Consent Mode via dataLayer", () => {
    saveConsent({ analytics: true, marketing: true });

    expect(window.dataLayer).toBeDefined();
    const updateEvent = window.dataLayer?.find(
      (entry) => entry.event === "consent_update"
    );
    expect(updateEvent).toEqual({
      event: "consent_update",
      cookie_consent_analytics: true,
      cookie_consent_marketing: true,
    });
  });

  it("handles acceptAllConsent and rejectOptionalConsent helper functions", () => {
    acceptAllConsent();
    expect(getStoredConsent()?.analytics).toBe(true);
    expect(getStoredConsent()?.marketing).toBe(true);

    rejectOptionalConsent();
    expect(getStoredConsent()?.analytics).toBe(false);
    expect(getStoredConsent()?.marketing).toBe(false);
  });

  it("loads Clarity script when clarityId is provided", () => {
    loadClarity("test-clarity-id");
    const script = document.querySelector('script[src*="clarity.ms"]');
    expect(script).not.toBeNull();
  });
});
