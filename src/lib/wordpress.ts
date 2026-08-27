import type { WPMedia, WPPage } from "@/types";
import variables from "@/config/variables.ts";

const base = variables.CRM_URL;

function wpUrl(path: string): string {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function wpFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(wpUrl(`wp-json/wp/v2/${endpoint}`));
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`WP API error [${res.status}] for: ${url.toString()}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch all pages */
export async function getPages(): Promise<WPPage[]> {
  return wpFetch<WPPage[]>("pages");
}

/** Fetch a single page by slug */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await wpFetch<WPPage[]>("pages", { slug });
  return pages[0] ?? null;
}

/** Fetch media by ID */
export async function getMedia(id: number): Promise<WPMedia> {
  return wpFetch<WPMedia>(`media/${id}`);
}
