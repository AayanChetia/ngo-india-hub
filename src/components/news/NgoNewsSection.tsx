import { NewsCard } from "./NewsCard";
import { fetchNews } from "@/lib/news";

/**
 * "In the news" block for an NGO profile. Server component — fetches news for
 * the NGO name through the shared (1h-cached) helper, so it hits GNews at most
 * once per hour per NGO regardless of traffic. Renders nothing when empty.
 */
export async function NgoNewsSection({ ngoName }: { ngoName: string }) {
  const articles = (await fetchNews(ngoName, 5)).slice(0, 5);

  if (articles.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink-900">In the news</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <NewsCard
            key={a.url}
            title={a.title}
            description={a.description}
            url={a.url}
            source={a.source}
            publishedAt={a.publishedAt}
            image={a.image}
          />
        ))}
      </div>
    </section>
  );
}
