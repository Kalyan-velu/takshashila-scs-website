// types/wp-post.ts

export interface WPRendered {
  rendered: string;
  protected: boolean;
}

export interface WPRobots {
  index: string;
  follow: string;
  "max-snippet": string;
  "max-image-preview": string;
  "max-video-preview": string;
}

export interface WPOGImage {
  width: number;
  height: number;
  url: string;
  type: string; // "image/jpeg"
}

export interface WPTwitterMisc {
  "Written by": string;
  "Est. reading time": string;
}

export interface WPSchemaImage {
  "@type": string;
  inLanguage?: string;
  "@id": string;
  url: string;
  contentUrl: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface WPSchemaAction {
  "@type": string;
  name?: string;
  target: string[] | { "@type": string; urlTemplate: string };
  "query-input"?: {
    "@type": string;
    valueRequired: boolean;
    valueName: string;
  };
}

export interface WPSchemaBreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

export interface WPSchemaGraph {
  "@type": string | string[];
  "@id": string;
  url?: string;
  name?: string;
  description?: string;
  inLanguage?: string;
  isPartOf?: { "@id": string };
  author?: { name: string; "@id": string };
  headline?: string;
  datePublished?: string;
  dateModified?: string;
  mainEntityOfPage?: { "@id": string };
  wordCount?: number;
  commentCount?: number;
  publisher?: { "@id": string };
  image?: { "@id": string } | WPSchemaImage;
  thumbnailUrl?: string;
  articleSection?: string[];
  potentialAction?: WPSchemaAction[];
  primaryImageOfPage?: { "@id": string };
  breadcrumb?: { "@id": string };
  itemListElement?: WPSchemaBreadcrumbItem[];
  logo?: WPSchemaImage;
  sameAs?: string[];
}

export interface WPYoastHeadJson {
  title: string;
  robots: WPRobots;
  canonical: string; // points to crm.* — override manually
  og_locale: string;
  og_type: string; // "article"
  og_title: string;
  og_description: string;
  og_url: string;
  og_site_name: string;
  article_published_time: string; // ISO 8601
  article_modified_time: string;
  og_image: WPOGImage[];
  author: string;
  twitter_card: string; // "summary_large_image"
  twitter_misc: WPTwitterMisc;
  schema: {
    "@context": string;
    "@graph": WPSchemaGraph[];
  };
}

export interface WPPost {
  id: string;
  link: string;
  date: string; // "2025-12-03T11:36:46"
  slug: string;
  title: WPRendered;
  content: WPRendered;
  excerpt: WPRendered;
  yoast_head_json: WPYoastHeadJson;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
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
    sizes: Record<
      string,
      { source_url: string; width: number; height: number }
    >;
  };
}
