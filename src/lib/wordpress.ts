import type { WPMedia, WPPage, WPPost } from "@/types";
import variables from "@/config/variables.ts";
import * as cheerio from "cheerio";

const base = variables.CRM_URL;

function wpUrl(path: string): string {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function wpFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(wpUrl(`wp-json/wp/v2/${endpoint}`));
  console.log("Url:", url.toString());
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`WP API error [${res.status}] for: ${url.toString()}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch paginated posts. Uses _embed to get featured images in one request. */
export async function getLatestPosts(
  page = 1,
  perPage = 10,
  extra?: Record<string, string>,
): Promise<WPPost[]> {
  return wpFetch<WPPost[]>("posts", {
    page: String(page),
    per_page: String(perPage),
    _embed: "1",
    ...extra,
  });
}

/** Fetch a single post by slug */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>("posts", { slug, _embed: "1" });
  return posts[0] ?? null;
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

/**
 * Rewrites WordPress media URLs to go through your Astro proxy.
 * Use this on any HTML content from WordPress to fix broken image/file URLs.
 */
export function rewriteMediaUrls(html: string, wpBase: string): string {
  // Replace absolute WP URLs with proxied paths
  return html.replaceAll(wpBase.replace(/\/$/, ""), "/api/wp");
}

export interface Magazine {
  title: string;
  imageUrl: string;
  downloadUrl: string | null;
}

/**
 * Extracts monthly magazine data from the provided HTML string.
 *
 * @returns {Array} An array of magazine objects containing title, imageUrl, and downloadUrl.
 */
export async function getMagazines(): Promise<Magazine[]> {
  const response = await getPageBySlug("magazines");

  if (!response) return [];

  const pages = await response.json();

  const html = (pages[0]?.content?.rendered ?? "").replaceAll(
    "https://takshashilascs.com".replace(/\/$/, ""),
    "https://crm.takshashilascs.com",
  );

  console.log(html);
  const $ = cheerio.load(html);
  const magazines: Magazine[] = [];

  // We use a Set to track processed cards and avoid duplicates from nested HTML structures
  const processedCards = new Set();

  // Iterate over every figure tag, as every magazine card has an image inside a figure
  $("figure").each((i, el) => {
    // Find the closest wrapper column for the magazine card
    const card = $(el).closest(".stk-block-column");

    // Skip if we've already processed this specific card wrapper
    if (card.length === 0 || processedCards.has(card[0])) return;
    processedCards.add(card[0]);

    // Extract the image URL
    const imageUrl = card.find("img").first().attr("src");
    if (!imageUrl) return; // Skip if there's no image

    // Extract the title
    let title = card.find("h6").first().text().trim();

    // If an <h6> wasn't found, look for the title inside <p> tags
    if (!title) {
      card.find("p").each((_, p) => {
        const pText = $(p).text().trim();
        // Avoid picking up the "Download" text as a title
        if (pText && pText.toLowerCase() !== "download") {
          title = pText;
          return false; // Break out of the .each() loop once we find the title
        }
      });
    }

    // If no title could be parsed, it's likely an empty layout block
    if (!title) return;

    // Extract the download link
    let downloadUrl = card.find("a").first().attr("href") || null;

    // Clean up empty or JavaScript void links
    if (downloadUrl === "javascript:void(0)" || downloadUrl === "") {
      downloadUrl = null;
    }

    magazines.push({
      title,
      imageUrl: imageUrl,
      downloadUrl: downloadUrl,
    });
  });
  return magazines;
}
