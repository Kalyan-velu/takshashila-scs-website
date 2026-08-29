import { CURRENT_AFFAIRS_API_BASE } from "@/config/CONSTANTS.ts";
import variables from "@/config/variables";

export interface CurrentAffairsCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CurrentAffairsPost {
  id: string;
  title: string;
  titleUrl: string;
  tags: string[];
  categories: CurrentAffairsCategory[];
  text: string;
  pdfUrl: string | null;
  coverImg: string | null;
  date: string;
}

export interface CurrentAffairsMagazine {
  id: string;
  title: string;
  month: number;
  year: number;
  issueDate: string;
  coverImg: string | null;
  pdfUrl: string | null;
  categories: CurrentAffairsCategory[];
}

export interface CurrentAffairsGalleryImage {
  id: string;
  title: string | null;
  imageUrl: string;
  categories: CurrentAffairsCategory[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Fetches at build/request time only (never shipped to the browser) — the
 * x-api-key header must stay server-side, per the API's own docs.
 */
async function apiGet<T>(
  endpoint: string,
  params: Record<string, string>,
): Promise<T[]> {
  const apiKey = variables.CMS_KEY;
  if (!apiKey) {
    console.error(`CMS_KEY is not set — skipping ${endpoint} fetch.`);
    return [];
  }

  try {
    console.log(
      "Endpoint:",
      endpoint,
      "Params:",
      params,
      "API Key:",
      apiKey.slice(0, 4) + "...",
    );
    const url = new URL(`${CURRENT_AFFAIRS_API_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
      headers: { "x-api-key": apiKey },
    });
    if (!res.ok) {
      console.error(
        `Current Affairs API error [${res.status}] for ${endpoint}`,
      );
      return [];
    }

    const body = (await res.json()) as ApiEnvelope<T[]>;
    return body.success ? body.data : [];
  } catch (err) {
    console.error(`Failed to fetch ${endpoint}:`, err);
    return [];
  }
}

export function getLatestCurrentAffairs(
  limit = 3,
): Promise<CurrentAffairsPost[]> {
  return apiGet<CurrentAffairsPost>("current-affairs", {
    limit: String(limit),
  });
}

/** Magazine issues, most recent first. */
export function getMagazines(limit = 50): Promise<CurrentAffairsMagazine[]> {
  return apiGet<CurrentAffairsMagazine>("magazines", { limit: String(limit) });
}

/** Categories tagged for the gallery section. */
export function getGalleryCategories(): Promise<CurrentAffairsCategory[]> {
  return apiGet<CurrentAffairsCategory>("categories", { type: "GALLERY" });
}

/** Gallery images, most recently uploaded first. `limit` is capped at 100 by the API. */
export function getGalleryImages(
  limit = 100,
): Promise<CurrentAffairsGalleryImage[]> {
  return apiGet<CurrentAffairsGalleryImage>("gallery", {
    limit: String(limit),
  });
}
