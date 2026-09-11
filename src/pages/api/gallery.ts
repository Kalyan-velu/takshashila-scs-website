import type { APIRoute } from "astro";
import { getGalleryImagesPage } from "@/lib/currentAffairs.ts";

export const prerender = false;

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 24;

export const GET: APIRoute = async ({ url }) => {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(url.searchParams.get("limit")) || DEFAULT_LIMIT),
  );
  const category = url.searchParams.get("category") || undefined;

  const { images, pagination } = await getGalleryImagesPage(
    page,
    limit,
    category,
  );

  return new Response(JSON.stringify({ success: true, images, pagination }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
};
