"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { State } from "@/types/database";

type FilterSidebarProps = {
  states: State[];
};

const TOGGLES = [
  { key: "volunteer", label: "Volunteering available" },
  { key: "internship", label: "Internships available" },
  { key: "donation", label: "Accepts donations" },
] as const;

/**
 * URL-driven filter controls for category / search listings.
 * Each change is serialised into the query string so results are shareable
 * and server-rendered. Sort defaults to impact score.
 */
export function FilterSidebar({ states }: FilterSidebarProps) {
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

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== "sort");

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-xs font-medium text-primary-700 hover:text-primary-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* State */}
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
    </aside>
  );
}
