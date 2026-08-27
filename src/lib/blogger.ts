import * as cheerio from "cheerio";
import { BLOG_URL } from "@/config/CONSTANTS.ts";

export interface BlogAuthor {
  name: string;
  avatarUrl: string | null;
  profileUrl: string | null;
}

export interface BlogComment {
  id: string;
  author: BlogAuthor;
  /** Plain text — comment bodies come from third-party commenters, so we never render them as HTML. */
  content: string;
  publishedAt: string;
  replies: BlogComment[];
}

export interface BlogPost {
  id: string;
  slug: string;
  /** Path on this site the post is mirrored at, e.g. "/some-slug/". */
  link: string;
  /** Original permalink on blogs.takshashilascs.com. */
  bloggerLink: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  author: BlogAuthor;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  commentCount: number;
  /** Atom feed URL for this post's comments — used by getComments(). */
  commentsFeedUrl: string;
}

interface BloggerLink {
  rel: string;
  type?: string;
  href: string;
}

interface BloggerAuthorEntry {
  name: { $t: string };
  uri?: { $t: string };
  gd$image?: { src: string };
}

interface BloggerEntry {
  id: { $t: string };
  published: { $t: string };
  updated: { $t: string };
  title: { $t: string };
  category: {
    term: string;
  }[];
  content?: { $t: string };
  link: BloggerLink[];
  author?: BloggerAuthorEntry[];
  media$thumbnail?: { url: string };
  thr$total?: { $t: string };
}

interface BloggerFeedResponse {
  feed: {
    openSearch$totalResults?: { $t: string };
    entry?: BloggerEntry[];
  };
}

interface BloggerCommentEntry {
  id: { $t: string };
  published: { $t: string };
  content?: { $t: string };
  author?: BloggerAuthorEntry[];
  "thr$in-reply-to"?: { ref: string };
}

interface BloggerCommentsFeedResponse {
  feed: {
    openSearch$totalResults?: { $t: string };
    entry?: BloggerCommentEntry[];
  };
}

/** Decodes HTML entities (e.g. "&amp;" -> "&") using cheerio's parser. */
function decodeEntities(text: string): string {
  return cheerio.load(text).text();
}

function slugFromPermalink(url: string): string {
  const path = new URL(url).pathname; // e.g. /2026/08/some-slug.html
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return last.replace(/\.html?$/, "");
}

/** Blogger thumbnail URLs embed a size segment like "/s72-w640-h360-c/" — swap it for a larger one. */
function upsizeThumbnail(url: string): string {
  return url.replace(/\/s\d+(-w\d+-h\d+-c)?\//, "/s1200/");
}

/** Some Blogger avatar URLs are protocol-relative ("//..."). */
function normalizeAvatarUrl(src: string): string {
  return src.startsWith("//") ? `https:${src}` : src;
}

function mapAuthor(entry?: BloggerAuthorEntry): BlogAuthor {
  const avatarSrc = entry?.["gd$image"]?.src;
  return {
    name: entry?.name.$t ? decodeEntities(entry.name.$t) : "Anonymous",
    avatarUrl: avatarSrc
      ? normalizeAvatarUrl(upsizeThumbnail(avatarSrc))
      : null,
    profileUrl: entry?.uri?.$t ?? null,
  };
}

/**
 * Pulls the first <img> out of the content to use as the post's heading
 * image (only needed when Blogger hasn't set a thumbnail), removing it — and
 * its <figure> wrapper, if any — from the returned HTML so it doesn't also
 * appear duplicated at the top of the article body.
 */
function extractFirstImage(html: string): { url: string | null; html: string } {
  const $ = cheerio.load(html);
  const img = $("img").first();
  if (img.length === 0) {
    return { url: null, html };
  }

  const url = img.attr("src") ?? null;
  const figure = img.closest("figure");
  (figure.length > 0 ? figure : img).remove();

  return { url, html: $("body").html() ?? html };
}

function estimateReadingMinutes(plainText: string): number {
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/**
 * Only some posts kept the anchor ids their <h2> headings had back on
 * WordPress — Blogger drops them on new/edited posts. Without an id there's
 * nothing for the table of contents to link to, so every <h2> gets one here.
 */
function ensureHeadingIds(html: string): string {
  const $ = cheerio.load(html);
  const usedIds = new Set<string>();

  $("h2").each((_, el) => {
    const $el = $(el);
    const existing = $el.attr("id");
    if (existing) {
      usedIds.add(existing);
      return;
    }

    const base = slugifyHeading($el.text());
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${base}-${suffix++}`;
    }
    usedIds.add(id);
    $el.attr("id", id);
  });

  return $("body").html() ?? html;
}

function mapEntry(entry: BloggerEntry): BlogPost {
  const alternate = entry.link.find((l) => l.rel === "alternate")?.href ?? "";
  const commentsFeedUrl =
    entry.link.find(
      (l) => l.rel === "replies" && l.type === "application/atom+xml",
    )?.href ?? "";
  const slug = slugFromPermalink(alternate);
  const thumbnail = entry.media$thumbnail?.url;

  let content = ensureHeadingIds(entry.content?.$t ?? "");
  let imageUrl: string | null;
  if (thumbnail) {
    imageUrl = upsizeThumbnail(thumbnail);
  } else {
    const extracted = extractFirstImage(content);
    imageUrl = extracted.url;
    content = extracted.html;
  }

  const plainText = cheerio.load(content).text().replace(/\s+/g, " ").trim();
  const keywords =
    entry.category?.map((value: { term: string }) => value.term) ?? [];
  return {
    id: entry.id.$t,
    slug,
    link: `/${slug}/`,
    bloggerLink: alternate,
    keywords,
    title: decodeEntities(entry.title.$t),
    excerpt:
      plainText.length > 160 ? `${plainText.slice(0, 160).trim()}…` : plainText,
    content,
    imageUrl,
    author: mapAuthor(entry.author?.[0]),
    publishedAt: entry.published.$t,
    updatedAt: entry.updated.$t,
    readingTimeMinutes: estimateReadingMinutes(plainText),
    commentCount: Number(entry["thr$total"]?.$t ?? 0),
    commentsFeedUrl,
  };
}

async function fetchFeed(
  params: Record<string, string>,
): Promise<BloggerFeedResponse> {
  const url = new URL(`${BLOG_URL.replace(/\/$/, "")}/feeds/posts/default`);
  url.searchParams.set("alt", "json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(
      `Blogger feed error [${res.status}] for: ${url.toString()}`,
    );
  }
  return res.json() as Promise<BloggerFeedResponse>;
}

async function fetchAllPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  const pageSize = 150;
  let startIndex = 1;
  let total = Infinity;

  while (posts.length < total) {
    const data = await fetchFeed({
      "max-results": String(pageSize),
      "start-index": String(startIndex),
    });
    const entries = data.feed.entry ?? [];
    total = Number(
      data.feed.openSearch$totalResults?.$t ?? posts.length + entries.length,
    );
    if (entries.length === 0) break;

    posts.push(...entries.map(mapEntry));
    startIndex += pageSize;
  }

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

// This runs at build/request time in Astro frontmatter only (never shipped to
// the browser), so the result is cached in-module to avoid re-fetching the
// feed once per page that calls getAllPosts()/getLatestPosts().
let allPostsPromise: Promise<BlogPost[]> | null = null;

/** All posts, newest first. */
export function getAllPosts(): Promise<BlogPost[]> {
  if (!allPostsPromise) {
    allPostsPromise = fetchAllPosts();
  }
  return allPostsPromise;
}

/** A page of posts, newest first. */
export async function getLatestPosts(
  page = 1,
  perPage = 10,
): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  const start = (page - 1) * perPage;
  return posts.slice(start, start + perPage);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

/** Builds a table of contents from a post's <h2> headings. */
export function getBlogTOC(content: string) {
  const subHeadings: { id: string; text: string }[] = [];
  const $ = cheerio.load(content);
  $("h2").each((_, el) => {
    const id = el.attribs?.id;
    if (!id) return;
    subHeadings.push({ id: `#${id}`, text: $(el).text() });
  });
  return subHeadings;
}

async function fetchCommentsFeed(
  feedUrl: string,
  params: Record<string, string>,
): Promise<BloggerCommentsFeedResponse> {
  const url = new URL(feedUrl);
  url.searchParams.set("alt", "json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(
      `Blogger comments feed error [${res.status}] for: ${url.toString()}`,
    );
  }
  return res.json() as Promise<BloggerCommentsFeedResponse>;
}

/**
 * Nests replies under the comment they reply to. A comment's
 * thr$in-reply-to.ref is the post's own id for a top-level comment, or
 * another comment's id for a reply — whichever it is, we only need to know
 * whether that id is one of this post's own comments.
 */
function buildCommentTree(entries: BloggerCommentEntry[]): BlogComment[] {
  const byId = new Map<string, BlogComment>();
  for (const entry of entries) {
    byId.set(entry.id.$t, {
      id: entry.id.$t,
      author: mapAuthor(entry.author?.[0]),
      content: cheerio
        .load(entry.content?.$t ?? "")
        .text()
        .trim(),
      publishedAt: entry.published.$t,
      replies: [],
    });
  }

  const roots: BlogComment[] = [];
  for (const entry of entries) {
    const comment = byId.get(entry.id.$t)!;
    const parent = byId.get(entry["thr$in-reply-to"]?.ref ?? "");
    (parent ? parent.replies : roots).push(comment);
  }

  const byDate = (a: BlogComment, b: BlogComment) =>
    new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
  const sortTree = (list: BlogComment[]) => {
    list.sort(byDate);
    list.forEach((comment) => sortTree(comment.replies));
  };
  sortTree(roots);

  return roots;
}

/** Fetches a post's comments (and their replies) as a tree, oldest first. */
export async function getComments(post: BlogPost): Promise<BlogComment[]> {
  if (!post.commentsFeedUrl) return [];

  const entries: BloggerCommentEntry[] = [];
  const pageSize = 150;
  let startIndex = 1;
  let total = Infinity;

  while (entries.length < total) {
    const data = await fetchCommentsFeed(post.commentsFeedUrl, {
      "max-results": String(pageSize),
      "start-index": String(startIndex),
    });
    const batch = data.feed.entry ?? [];
    total = Number(
      data.feed.openSearch$totalResults?.$t ?? entries.length + batch.length,
    );
    if (batch.length === 0) break;

    entries.push(...batch);
    startIndex += pageSize;
  }

  return buildCommentTree(entries);
}
