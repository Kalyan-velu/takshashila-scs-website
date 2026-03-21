

const isServer = typeof window === 'undefined';
const base= import.meta.env.PUBLIC_WORDPRESS_URL;

function wpUrl(path: string): string {
  // Normalize slashes
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// ---- Types ----

export interface WPPost {
  id: number;
  slug: string;
  status: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details: { width: number; height: number };
    }>;
    author?: Array<{ name: string; avatar_urls: Record<string, string> }>;
  };
}

export interface WPPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: Record<string, { source_url: string; width: number; height: number }>;
  };
}

// ---- Fetch helpers ----

async function wpFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(wpUrl(`wp-json/wp/v2/${endpoint}`));
  console.log("Url:",url.toString())
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`WP API error [${res.status}] for: ${url.toString()}`);
  }
  return res.json() as Promise<T>;
}

// ---- API methods ----

/** Fetch paginated posts. Uses _embed to get featured images in one request. */
export async function getLatestPosts(
  page = 1,
  perPage = 10,
  extra?: Record<string, string>
): Promise<WPPost[]> {
  return wpFetch<WPPost[]>('posts', {
    page: String(page),
    per_page: String(perPage),
    _embed: '1',
    ...extra,
  });
}

/** Fetch a single post by slug */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>('posts', { slug, _embed: '1' });
  return posts[0] ?? null;
}

/** Fetch all pages */
export async function getPages(): Promise<WPPage[]> {
  return wpFetch<WPPage[]>('pages');
}

/** Fetch a single page by slug */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await wpFetch<WPPage[]>('pages', { slug });
  return pages[0] ?? null;
}

/** Fetch media by ID */
export async function getMedia(id: number): Promise<WPMedia> {
  return wpFetch<WPMedia>(`media/${id}`);
}

/**
 * Rewrites WordPress media URLs to go through your Astro proxy.
 * Use this on any HTML content from WordPress to fix broken image/file URLs.
 */
export function rewriteMediaUrls(html: string, wpBase: string): string {
  // Replace absolute WP URLs with proxied paths
  return html.replaceAll(wpBase.replace(/\/$/, ''), '/api/wp');
}
