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

export interface CurrentAffairsQuizListItem {
  id: string;
  title: string;
  date: string;
  categories: CurrentAffairsCategory[];
  published: boolean;
  pdfUrl: string | null;
  questionCount: number;
}

export interface CurrentAffairsQuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface CurrentAffairsQuiz {
  id: string;
  title: string;
  date: string;
  published: boolean;
  categories: CurrentAffairsCategory[];
  questions: CurrentAffairsQuizQuestion[];
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

/** Same as {@link apiGet}, but for single-object endpoints (envelope `data` is not an array). */
async function apiGetOne<T>(endpoint: string): Promise<T | null> {
  const apiKey = variables.CMS_KEY;
  if (!apiKey) {
    console.error(`CMS_KEY is not set — skipping ${endpoint} fetch.`);
    return null;
  }

  try {
    const res = await fetch(`${CURRENT_AFFAIRS_API_BASE}/${endpoint}`, {
      headers: { "x-api-key": apiKey },
    });
    if (!res.ok) {
      if (res.status !== 404) {
        console.error(
          `Current Affairs API error [${res.status}] for ${endpoint}`,
        );
      }
      return null;
    }

    const body = (await res.json()) as ApiEnvelope<T>;
    return body.success ? body.data : null;
  } catch (err) {
    console.error(`Failed to fetch ${endpoint}:`, err);
    return null;
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

/** Published quiz sets, newest first. Question bodies aren't included — only a count. */
export function getQuizzes(limit = 20): Promise<CurrentAffairsQuizListItem[]> {
  return apiGet<CurrentAffairsQuizListItem>("quizzes", {
    limit: String(limit),
  });
}

/**
 * One quiz set with its full question list, including the answer key
 * (`correctOptionIndex` / `explanation`) — used to render instant grading.
 * Returns `null` if the id doesn't exist or isn't published.
 */
export function getQuizById(id: string): Promise<CurrentAffairsQuiz | null> {
  return apiGetOne<CurrentAffairsQuiz>(`quizzes/${encodeURIComponent(id)}`);
}
