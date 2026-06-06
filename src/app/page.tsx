import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getCategoryCounts,
  getFeaturedNgos,
  getHomeStats,
  getTopStates,
  type HomeStats,
  type StateWithCount,
} from "@/lib/supabase/queries";
import type { Category, NGO } from "@/types/database";
import { Hero } from "@/components/home/Hero";
import { StatsBanner } from "@/components/home/StatsBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedNgos } from "@/components/home/FeaturedNgos";
import { BrowseByState } from "@/components/home/BrowseByState";
import { NewsTicker } from "@/components/news/NewsTicker";
import { NewsCard } from "@/components/news/NewsCard";
import { fetchNews, type NewsArticle } from "@/lib/news";

// Revalidate the homepage data periodically (ISR).
export const revalidate = 3600;

const FALLBACK_STATS: HomeStats = {
  ngoCount: 234,
  stateCount: 22,
  categoryCount: 15,
};

export default async function Home() {
  const supabase = createClient();

  let categories: Category[] = [];
  let counts: Record<string, number> = {};
  let featured: NGO[] = [];
  let stats: HomeStats = FALLBACK_STATS;
  let topStates: StateWithCount[] = [];

  // Fetch in parallel; degrade gracefully if any query fails so the page
  // still renders during local dev / transient DB issues.
  try {
    [categories, counts, featured, stats, topStates] = await Promise.all([
      getCategories(supabase),
      getCategoryCounts(supabase),
      getFeaturedNgos(supabase, 6),
      getHomeStats(supabase),
      getTopStates(supabase, 8),
    ]);
  } catch (err) {
    console.error("Homepage data fetch failed:", err);
  }

  // Sector news for the "Latest NGO News" grid (empty when no API key set).
  const news = await fetchNews("NGO India", 6);

  return (
    <>
      <Hero />
      <NewsTicker />
      <StatsBanner stats={stats} />
      {categories.length > 0 && (
        <CategoryGrid categories={categories} counts={counts} />
      )}
      <LatestNews articles={news} />
      <HowItWorks />
      <FeaturedNgos ngos={featured} />
      <BrowseByState states={topStates} />
    </>
  );
}

/** "Latest NGO News" — a 6-card grid of sector news. Hidden when empty. */
function LatestNews({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="container-page py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">
            Latest NGO News
          </h2>
          <p className="mt-1 text-ink-500">
            Headlines from across India&apos;s social sector.
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
