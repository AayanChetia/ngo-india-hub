import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  searchNgosByText,
  getStates,
  getCategories,
  type NgoFilters,
  type SortOption,
} from "@/lib/supabase/queries";
import { NgoCard } from "@/components/ngo/NgoCard";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SortSelect } from "@/components/search/SortSelect";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search NGOs in India | NGO India Hub",
  description:
    "Search and filter 234+ verified NGOs across India by cause, state, city, and more.",
  keywords: [
    "search NGOs India", "find NGO India", "NGO directory",
    "volunteer opportunities India", "NGO internship India",
    "donate to NGO India", "CSR NGO partners India",
    "80G registered NGOs", "verified NGOs India",
  ],
  alternates: { canonical: `${SITE_URL}/search` },
  openGraph: {
    title: "Search NGOs in India | NGO India Hub",
    description:
      "Search and filter 234+ verified NGOs across India by cause, state, city, and more.",
    url: `${SITE_URL}/search`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search NGOs in India | NGO India Hub",
    description:
      "Search and filter 234+ verified NGOs across India by cause, state, city, and more.",
  },
};

type SearchParams = {
  q?: string;
  state?: string;
  category?: string;
  city?: string;
  volunteer?: string;
  internship?: string;
  donation?: string;
  csr?: string;
  impact_min?: string;
  impact_max?: string;
  sort?: string;
};

function parseScore(value: string | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(10, Math.max(1, Math.round(n)));
}

const VALID_SORTS: SortOption[] = [
  "impact_score",
  "name",
  "founded_year_asc",
  "founded_year_desc",
  "beneficiaries_count",
];

function buildFilters(sp: SearchParams): NgoFilters {
  const sort = VALID_SORTS.includes(sp.sort as SortOption)
    ? (sp.sort as SortOption)
    : "impact_score";
  const categories = sp.category
    ? sp.category.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;
  const impactMin =
    sp.impact_min !== undefined ? parseScore(sp.impact_min, 1) : undefined;
  const impactMax =
    sp.impact_max !== undefined ? parseScore(sp.impact_max, 10) : undefined;
  return {
    state_id: sp.state || undefined,
    category_slugs: categories?.length ? categories : undefined,
    city: sp.city || undefined,
    volunteer_available: sp.volunteer === "1" || undefined,
    internship_available: sp.internship === "1" || undefined,
    donation_available: sp.donation === "1" || undefined,
    accepts_csr: sp.csr === "1" || undefined,
    impact_score_min: impactMin,
    impact_score_max: impactMax,
    sort,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const q = searchParams.q ?? "";
  const filters = buildFilters(searchParams);

  const [ngos, states, categories] = await Promise.all([
    searchNgosByText(supabase, q, filters),
    getStates(supabase),
    getCategories(supabase),
  ]);

  return (
    <div className="bg-white">
      <div className="border-b border-ink-100 bg-primary-50">
        <div className="container-page flex flex-wrap items-end justify-between gap-4 py-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink-900">
              {q ? `Results for “${q}”` : "Search NGOs in India"}
            </h1>
            <p className="mt-1 text-ink-500">
              Showing {ngos.length} {ngos.length === 1 ? "NGO" : "NGOs"}
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:border-ink-300 hover:bg-ink-50"
          >
            <Scale size={16} className="text-primary" />
            Compare NGOs
          </Link>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <FilterSidebar states={states} categories={categories} />
          </div>

          <div>
            <div className="mb-6 flex items-center justify-end">
              <SortSelect />
            </div>
            {ngos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-200 py-20 text-center">
                <p className="text-ink-500">
                  No NGOs match your search. Try a different term or clear
                  filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {ngos.map((ngo) => (
                  <NgoCard key={ngo.id} ngo={ngo} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
