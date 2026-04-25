interface ImportMetaEnv {
  readonly CRM_URL: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly SUPABASE_SECRET_KEY: string;
  readonly CLOUDFLARE_SITE_KEY: string;
  readonly CLOUDFLARE_SECRET_KEY: string;
  readonly PUBLIC_GTM_CONTAINER: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
  readonly PUBLIC_CLOUDFLARE_SITE_KEY: string;
  readonly PUBLIC_CRM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  turnstile: {
    render: (
      container: HTMLElement,
      options: Record<string, unknown>,
    ) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
  };
}
