"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, State } from "@/types/database";

type FilterSidebarProps = {
  states: State[];
  categories?: Category[];
  /** Hide the state dropdown (e.g. on /state pages where state is fixed). */
  showStateFilter?: boolean;
};

const TOGGLES = [
  { key: "volunteer", label: "Volunteering available" },
  { key: "internship", label: "Internships available" },
  { key: "donation", label: "Accepts donations" },
  { key: "csr", label: "Accepts CSR partnerships" },
] as const;

/**
 * URL-driven filter controls for the search listing.
 * Each change is serialised into the query string so results are shareable
 * and server-rendered. Sort defaults to impact score.
 */
export function FilterSidebar({
  states,
  categories,
  showStateFilter = true,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for the debounced city text input.
  const [city, setCity] = useState(searchParams.get("city") ?? "");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Debounce city updates into the URL.
  useEffect(() => {
    const current = searchParams.get("city") ?? "";
    if (city === current) return;
    const t = setTimeout(() => setParam("city", city.trim() || null), 400);
    return () => clearTimeout(t);
  }, [city, searchParams, setParam]);

  // Selected category slugs (comma-separated in the URL).
  const selectedCategories = (searchParams.get("category") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug];
    setParam("category", next.length ? next.join(",") : null);
  }

  // Impact score range (1–10), defaulting to the full span.
  const impactMin = Number(searchParams.get("impact_min") ?? "1");
  const impactMax = Number(searchParams.get("impact_max") ?? "10");

  function setImpact(which: "impact_min" | "impact_max", value: number) {
    let min = which === "impact_min" ? value : impactMin;
    let max = which === "impact_max" ? value : impactMax;
    // Keep the bounds ordered so the range stays valid.
    if (min > max) {
      if (which === "impact_min") max = min;
      else min = max;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (min <= 1) params.delete("impact_min");
    else params.set("impact_min", String(min));
    if (max >= 10) params.delete("impact_max");
    else params.set("impact_max", String(max));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const hasFilters = Array.from(searchParams.keys()).some(
    (k) => k !== "sort" && k !== "q"
  );

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={() => {
              const params = new URLSearchParams();
              const q = searchParams.get("q");
              const sort = searchParams.get("sort");
              if (q) params.set("q", q);
              if (sort) params.set("sort", sort);
              const qs = params.toString();
              router.replace(qs ? `${pathname}?${qs}` : pathname, {
                scroll: false,
              });
            }}
            className="text-xs font-medium text-primary-700 hover:text-primary-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* State */}
      {showStateFilter && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-700">
            State
          </label>
          <select
            value={searchParams.get("state") ?? ""}
            onChange={(e) => setParam("state", e.target.value || null)}
            className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
      <div>
        <h3 className="mb-2 text-xs font-medium text-ink-700">Categories</h3>
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {categories.map((c) => {
            const active = selectedCategories.includes(c.slug);
            return (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700"
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleCategory(c.slug)}
                  className="h-4 w-4 rounded border-ink-300 text-primary focus:ring-primary-400"
                />
                {c.name}
              </label>
            );
          })}
        </div>
      </div>
      )}

      {/* City */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-700">
          City
        </label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Mumbai"
          className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-2.5">
        {TOGGLES.map((t) => {
          const active = searchParams.get(t.key) === "1";
          return (
            <label
              key={t.key}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setParam(t.key, e.target.checked ? "1" : null)}
                className="h-4 w-4 rounded border-ink-300 text-primary focus:ring-primary-400"
              />
              {t.label}
            </label>
          );
        })}
      </div>

      {/* Impact score range */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-medium text-ink-700">
            Impact score
          </label>
          <span className="text-xs text-ink-500">
            {impactMin} – {impactMax}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={1}
            max={10}
            value={impactMin}
            onChange={(e) => setImpact("impact_min", Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Minimum impact score"
          />
          <input
            type="range"
            min={1}
            max={10}
            value={impactMax}
            onChange={(e) => setImpact("impact_max", Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Maximum impact score"
          />
        </div>
      </div>
    </aside>
  );
}
