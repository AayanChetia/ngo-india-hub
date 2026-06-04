import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getCategoryBySlug,
  getNgosByCategory,
  getStates,
  type NgoFilters,
  type SortOption,
} from "@/lib/supabase/queries";
import { NgoCard } from "@/components/ngo/NgoCard";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SortSelect } from "@/components/search/SortSelect";

export const revalidate = 3600;

type SearchParams = {
  state?: string;
  city?: string;
  volunteer?: string;
  internship?: string;
  donation?: string;
  sort?: string;
};

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
  return {
    state_id: sp.state || undefined,
    city: sp.city || undefined,
    volunteer_available: sp.volunteer === "1" || undefined,
    internship_available: sp.internship === "1" || undefined,
    donation_available: sp.donation === "1" || undefined,
    sort,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const category = await getCategoryBySlug(supabase, params.slug);
  if (!category) return { title: "Category not found — NGO India Hub" };
  return {
    title: `${category.name} NGOs in India — NGO India Hub`,
    description:
      category.description ??
      `Browse verified ${category.name} NGOs across India.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const supabase = createClient();

  const category = await getCategoryBySlug(supabase, params.slug);
  if (!category) notFound();

  const filters = buildFilters(searchParams);
  const [ngos, states] = await Promise.all([
    getNgosByCategory(supabase, params.slug, filters),
    getStates(supabase),
  ]);

  return (
    <div className="bg-white">
      {/* Category header */}
      <div className="border-b border-ink-100 bg-primary-50">
        <div className="container-page py-12">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden>
              {category.icon ?? "🤝"}
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-1 max-w-2xl text-ink-500">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <FilterSidebar states={states} />
          </div>

          {/* Results */}
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-ink-500">
                <span className="font-semibold text-ink-900">
                  {ngos.length}
                </span>{" "}
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
                  <NgoCard key={ngo.id} ngo={ngo} showCategory={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
