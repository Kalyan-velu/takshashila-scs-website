export const MOBILE_NO = 6001657575;
export const EMAIL = "info@takshashilascs.com";

const phoneDigits = String(MOBILE_NO);
export const PHONE_TEL = `+91${phoneDigits}`;
export const PHONE_HREF = `tel:${PHONE_TEL}`;
export const PHONE_DISPLAY = `+91 ${phoneDigits.slice(0, 5)}-${phoneDigits.slice(5)}`;

// Canonical site URL (with www) — used for meta tags, canonical links, and structured data.
export const SITE_URL = "https://takshashilascs.com";
// Bare domain (no www) — this is the host WordPress content itself links to.
export const SITE_DOMAIN = "https://takshashilascs.com";
export const CURRENT_AFFAIRS_URL = "https://currentaffairs.takshashilascs.com";
// See src/lib/currentAffairs.ts for the API client.
export const CURRENT_AFFAIRS_API_BASE = `${CURRENT_AFFAIRS_URL}/api/v1`;
// Individual posts on the external site live under /current_affairs/ (underscore) — the
// /current-affairs (hyphen) path is the archive/listing page.
export function currentAffairsPostUrl(titleUrl: string): string {
  return `${CURRENT_AFFAIRS_URL}/current_affairs/${titleUrl}`;
}
// Blogger-hosted blog — see src/lib/blogger.ts for the feed client.
export const BLOG_URL = "https://blogs.takshashilascs.com";

export function whatsappUrl(message: string): string {
  return `https://wa.me/91${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export const socials = {
  FACEBOOK: "https://www.facebook.com/takshasheelascs",
  INSTAGRAM: "https://www.instagram.com/takshasheelascs",
  LINKEDIN:
    "https://www.linkedin.com/company/takshashila-school-of-civil-services",
  TWITTER: "https://twitter.com/takshashilascs",
  YOUTUBE: "https://www.youtube.com/@Takshashilascs",
};
