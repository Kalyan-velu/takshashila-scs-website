export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export const CONSENT_STORAGE_KEY = "takshashila_cookie_consent_v1";

/**
 * Retrieves stored cookie consent preferences from localStorage.
 */
export function getStoredConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as CookieConsentPreferences;
  } catch (e) {
    console.error("Failed to read cookie consent from storage", e);
    return null;
  }
}

/**
 * Saves consent preferences to localStorage and notifies listeners.
 */
export function saveConsent(prefs: Partial<CookieConsentPreferences>): CookieConsentPreferences {
  const fullPrefs: CookieConsentPreferences = {
    necessary: true, // Always required
    analytics: !!prefs.analytics,
    marketing: !!prefs.marketing,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullPrefs));
    } catch (e) {
      console.error("Failed to save cookie consent to storage", e);
    }

    window.dispatchEvent(
      new CustomEvent("cookie_consent_updated", { detail: fullPrefs })
    );
  }

  return fullPrefs;
}

/**
 * Accepts all optional cookie categories.
 */
export function acceptAllConsent(): CookieConsentPreferences {
  return saveConsent({ analytics: true, marketing: true });
}

/**
 * Rejects optional cookie categories (keeps necessary only).
 */
export function rejectOptionalConsent(): CookieConsentPreferences {
  return saveConsent({ analytics: false, marketing: false });
}
