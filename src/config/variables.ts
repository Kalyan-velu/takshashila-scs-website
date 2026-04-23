export const isServer = typeof window === "undefined";

export default ((isServer: boolean | undefined = false) => {
  if (!isServer) {
    return {
      GTM_CONTAINER: import.meta.env.PUBLIC_GTM_CONTAINER || "",
      SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL || "",
      SUPABASE_KEY: import.meta.env.PUBLIC_SUPABASE_KEY || "",
      CLOUDFLARE_SITE_KEY: import.meta.env.PUBLIC_CLOUDFLARE_SITE_KEY || "",
      CLOUDFLARE_SECRET_KEY: "",
    };
  }
  return {
    SUPABASE_URL: import.meta.env.SUPABASE_URL || "",
    SUPABASE_KEY: import.meta.env.SUPABASE_SECRET_KEY || "",
    CLOUDFLARE_SITE_KEY: import.meta.env.CLOUDFLARE_SITE_KEY || "",
    CLOUDFLARE_SECRET_KEY: import.meta.env.CLOUDFLARE_SECRET_KEY || "",
  };
})(isServer);
