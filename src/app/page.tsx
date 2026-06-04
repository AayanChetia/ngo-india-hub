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

  return (
    <>
      <Hero />
      <StatsBanner stats={stats} />
      {categories.length > 0 && (
        <CategoryGrid categories={categories} counts={counts} />
      )}
      <HowItWorks />
      <FeaturedNgos ngos={featured} />
      <BrowseByState states={topStates} />
    </>
  );
}
