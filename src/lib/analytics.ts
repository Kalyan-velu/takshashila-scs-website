declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

/**
 * Pushes a custom analytics event to Google Tag Manager dataLayer.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }
}

/**
 * Tracks lead form submission conversions.
 */
export function trackLeadSubmit(source: string, course?: string | null) {
  trackEvent("generate_lead", {
    lead_source: source,
    target_course: course || "General Inquiry",
  });
}

/**
 * Tracks phone call and WhatsApp contact button clicks.
 */
export function trackContactClick(method: "phone" | "whatsapp", value?: string) {
  trackEvent("contact_click", {
    contact_method: method,
    contact_value: value || "",
  });
}
