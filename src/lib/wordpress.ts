export interface WPPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

export async function getLatestPosts(limit: number = 4): Promise<WPPost[]> {
  try {
    const res = await fetch(`https://takshashilascs.com/wp-json/wp/v2/posts?per_page=${limit}&_embed=1`);
    if (!res.ok) {
        return [];
    }
    const posts: WPPost[] = await res.json();
    return posts;
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return [];
  }
}
