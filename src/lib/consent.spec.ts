import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  getStoredConsent,
  saveConsent,
  acceptAllConsent,
  rejectOptionalConsent,
} from "./consent";

describe("consent.ts", () => {
  beforeEach(() => {
    localStorage.clear();
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

  it("dispatches a cookie_consent_updated event on save", () => {
    let detail: any = null;
    window.addEventListener("cookie_consent_updated", (e) => {
      detail = (e as CustomEvent).detail;
    });

    saveConsent({ analytics: true, marketing: true });

    expect(detail).toMatchObject({ analytics: true, marketing: true });
  });

  it("handles acceptAllConsent and rejectOptionalConsent helper functions", () => {
    acceptAllConsent();
    expect(getStoredConsent()?.analytics).toBe(true);
    expect(getStoredConsent()?.marketing).toBe(true);

    rejectOptionalConsent();
    expect(getStoredConsent()?.analytics).toBe(false);
    expect(getStoredConsent()?.marketing).toBe(false);
  });
});
