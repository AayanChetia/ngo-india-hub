export type NewsArticle = {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: string;
};

type GNewsResponse = {
  articles?: Array<{
    title: string;
    description: string | null;
    url: string;
    image: string | null;
    publishedAt: string;
    source?: { name?: string };
  }>;
};

/**
 * Fetch news from GNews (server-side only — keeps the API key off the client).
 * Returns [] on any failure or when GNEWS_API_KEY is unset, so callers can
 * render/​degrade without special-casing errors. Cached for 1 hour.
 */
export async function fetchNews(query: string, max = 6): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const endpoint =
    `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}` +
    `&lang=en&country=in&max=${max}&apikey=${apiKey}`;

  try {
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("GNews request failed:", res.status);
      return [];
    }
    const data = (await res.json()) as GNewsResponse;
    return (data.articles ?? []).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name ?? "News",
    }));
  } catch (err) {
    console.error("GNews fetch error:", err);
    return [];
  }
}
