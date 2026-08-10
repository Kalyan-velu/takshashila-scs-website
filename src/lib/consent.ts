export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export const CONSENT_STORAGE_KEY = "takshashila_cookie_consent_v1";

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

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
 * Dynamically loads the Microsoft Clarity script if consent is granted.
 */
export function loadClarity(clarityId?: string): void {
  if (typeof window === "undefined") return;

  const projectId =
    clarityId ||
    import.meta.env.PUBLIC_CLARITY_PROJECT_ID ||
    "";

  if (!projectId) return;

  if (window.clarity) {
    window.clarity("consent");
    return;
  }

  (function (c: any, l: any, a: any, r: any, i: any) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    const t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", projectId);
}

/**
 * Updates Google Consent Mode v2 state and triggers GTM / Clarity integration.
 */
export function updateGoogleConsentMode(prefs: CookieConsentPreferences): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }

  const analyticsState = prefs.analytics ? "granted" : "denied";
  const marketingState = prefs.marketing ? "granted" : "denied";

  window.gtag("consent", "update", {
    analytics_storage: analyticsState,
    ad_storage: marketingState,
    ad_user_data: marketingState,
    ad_personalization: marketingState,
  });

  window.dataLayer.push({
    event: "consent_update",
    cookie_consent_analytics: prefs.analytics,
    cookie_consent_marketing: prefs.marketing,
  });

  if (prefs.analytics) {
    loadClarity();
  }
}

/**
 * Saves consent preferences to localStorage and updates consent mode & analytics scripts.
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

    updateGoogleConsentMode(fullPrefs);

    // Notify listeners
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
