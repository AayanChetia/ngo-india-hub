import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/news";

// Re-exported so client components can import the type from the route path.
export type { NewsArticle } from "@/lib/news";

/**
 * GET /api/news?type=general|specific&query=...
 *
 * - type=general  → sector-wide news ("NGO India")
 * - type=specific → news for a given NGO (query = NGO name)
 *
 * Proxies GNews so the API key stays server-side. Returns { articles: [] }
 * on any failure or when the key is unset, so the UI degrades quietly.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "general";
  const rawQuery = searchParams.get("query")?.trim();

  const query = type === "specific" && rawQuery ? rawQuery : "NGO India";

  const articles = await fetchNews(query, 6);
  return NextResponse.json({ articles });
}
