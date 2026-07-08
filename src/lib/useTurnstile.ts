import { onBeforeUnmount, ref } from "vue";

interface UseTurnstileOptions {
  siteKey: string;
}

/**
 * Renders a Cloudflare Turnstile widget into `container` and exposes the
 * verification token. The widget script is loaded globally in Layout.astro,
 * but it's async, so this still handles the "not loaded yet" case.
 */
export function useTurnstile({ siteKey }: UseTurnstileOptions) {
  const token = ref<string | null>(null);
  const container = ref<HTMLElement | null>(null);
  let widgetId: string | null = null;

  function mount() {
    if (!container.value || widgetId !== null) return;

    const renderWidget = () => {
      if (!container.value) return;
      widgetId = window.turnstile.render(container.value, {
        sitekey: siteKey,
        callback: (t: string) => {
          token.value = t;
        },
        "expired-callback": () => {
          token.value = null;
        },
        "error-callback": () => {
          token.value = null;
        },
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existing = document.querySelector('script[src*="turnstile"]');
    if (existing) {
      existing.addEventListener("load", renderWidget);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);
  }

  function reset() {
    if (widgetId !== null) window.turnstile.reset(widgetId);
    token.value = null;
  }

  onBeforeUnmount(() => {
    if (widgetId !== null) window.turnstile.remove(widgetId);
  });

  return { token, container, mount, reset };
}
