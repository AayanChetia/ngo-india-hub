import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getStateBySlug,
  getNgosByStateId,
  getStateCategoryBreakdown,
  getStates,
  type NgoFilters,
  type SortOption,
} from "@/lib/supabase/queries";
import { NgoCard } from "@/components/ngo/NgoCard";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SortSelect } from "@/components/search/SortSelect";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

type SearchParams = {
  city?: string;
  category?: string;
  volunteer?: string;
  internship?: string;
  donation?: string;
  csr?: string;
  impact_min?: string;
  impact_max?: string;
  sort?: string;
};

const VALID_SORTS: SortOption[] = [
  "impact_score",
  "name",
  "founded_year_asc",
  "founded_year_desc",
  "beneficiaries_count",
];

function parseScore(value: string | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function buildFilters(sp: SearchParams): NgoFilters {
  const sort = VALID_SORTS.includes(sp.sort as SortOption)
    ? (sp.sort as SortOption)
    : "impact_score";
  const categories = sp.category
    ? sp.category.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;
  return {
    city: sp.city || undefined,
    category_slugs: categories?.length ? categories : undefined,
    volunteer_available: sp.volunteer === "1" || undefined,
    internship_available: sp.internship === "1" || undefined,
    donation_available: sp.donation === "1" || undefined,
    accepts_csr: sp.csr === "1" || undefined,
    impact_score_min:
      sp.impact_min !== undefined ? parseScore(sp.impact_min, 1) : undefined,
    impact_score_max:
      sp.impact_max !== undefined ? parseScore(sp.impact_max, 10) : undefined,
    sort,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { state: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const state = await getStateBySlug(supabase, params.state);
  if (!state) return { title: "State not found — NGO India Hub" };

  const { count } = await supabase
    .from("ngos")
    .select("id", { count: "exact", head: true })
    .eq("listing_status", "Active")
    .eq("state_id", state.id);

  const title = `NGOs in ${state.name} | NGO India Hub`;
  const description = `Find verified NGOs in ${state.name}. Browse ${
    count ?? 0
  } organisations across all cause categories.`;
  const url = `${SITE_URL}/state/${params.state}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function StatePage({
  params,
  searchParams,
}: {
  params: { state: string };
  searchParams: SearchParams;
}) {
  const supabase = createClient();

  const state = await getStateBySlug(supabase, params.state);
  if (!state) notFound();

  const filters = buildFilters(searchParams);
  const [ngos, breakdown, states] = await Promise.all([
    getNgosByStateId(supabase, state.id, filters),
    getStateCategoryBreakdown(supabase, state.id),
    getStates(supabase),
  ]);

  return (
    <div className="bg-white">
      {/* State hero */}
      <div className="border-b border-ink-100 bg-primary-50">
        <div className="container-page py-12">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm">
              <MapPin size={24} />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                NGOs in {state.name}
              </h1>
              <p className="mt-1 text-ink-500">
                {ngos.length} {ngos.length === 1 ? "NGO" : "NGOs"} working across{" "}
                {state.name}
              </p>
            </div>
          </div>

          {/* Category breakdown chips */}
          {breakdown.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {breakdown.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}?state=${state.id}`}
                  className="group flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
                >
                  <span className="font-medium text-ink-800">{cat.name}</span>
                  <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar — state is fixed by the route, so no state dropdown here */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <FilterSidebar states={states} showStateFilter={false} />
          </div>

          {/* Results */}
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-ink-500">
                <span className="font-semibold text-ink-900">{ngos.length}</span>{" "}
                {ngos.length === 1 ? "NGO" : "NGOs"} found
              </p>
              <SortSelect />
            </div>

            {ngos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-200 py-20 text-center">
                <p className="text-ink-500">
                  No NGOs match these filters. Try clearing some.
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
