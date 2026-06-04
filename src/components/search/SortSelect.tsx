"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "impact_score", label: "Impact score" },
  { value: "name", label: "Name (A–Z)" },
  { value: "founded_year_asc", label: "Oldest first" },
  { value: "founded_year_desc", label: "Newest first" },
  { value: "beneficiaries_count", label: "Most beneficiaries" },
];

/** URL-driven sort selector. Defaults to impact score. */
export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "impact_score") params.delete("sort");
    else params.set("sort", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-ink-500">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={searchParams.get("sort") ?? "impact_score"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
