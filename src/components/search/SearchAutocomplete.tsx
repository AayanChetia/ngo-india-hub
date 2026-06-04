"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Layers } from "lucide-react";
import type { SearchSuggestions } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

type SearchAutocompleteProps = {
  size?: "md" | "lg";
  placeholder?: string;
  className?: string;
  showButton?: boolean;
};

type FlatItem = {
  key: string;
  kind: "category" | "city" | "ngo";
  label: string;
  sub?: string;
  tag?: string;
  href: string;
};

const EMPTY: SearchSuggestions = { ngos: [], categories: [], cities: [] };

/**
 * Search box with live grouped typeahead (NGOs + categories + cities).
 * Fires from the first character (debounced). Clicking any suggestion
 * navigates to its target; Enter with nothing highlighted runs /search.
 * Used on both the homepage hero and the header nav.
 */
export function SearchAutocomplete({
  size = "lg",
  placeholder = "Search by name, cause, or city…",
  className,
  showButton = true,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchSuggestions>(EMPTY);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Flattened, ordered list for keyboard navigation.
  const items = useMemo<FlatItem[]>(() => {
    const list: FlatItem[] = [];
    data.categories.forEach((c) =>
      list.push({
        key: `cat-${c.slug}`,
        kind: "category",
        label: `${c.name} NGOs`,
        href: `/category/${c.slug}`,
      })
    );
    data.cities.forEach((c) =>
      list.push({
        key: `city-${c}`,
        kind: "city",
        label: `NGOs in ${c}`,
        href: `/search?city=${encodeURIComponent(c)}`,
      })
    );
    data.ngos.forEach((n) =>
      list.push({
        key: `ngo-${n.slug}`,
        kind: "ngo",
        label: n.name,
        sub: n.city,
        tag: n.primary_category,
        href: `/ngo/${n.slug}`,
      })
    );
    return list;
  }, [data]);

  // Debounced fetch — triggers from a single character.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 1) {
      setData(EMPTY);
      setOpen(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(term)}`,
          { signal: ctrl.signal }
        );
        const json = (await res.json()) as SearchSuggestions;
        setData(json);
        setOpen(true);
        setActive(-1);
      } catch {
        /* aborted or failed — ignore */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goToSearch() {
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || items.length === 0) {
      if (e.key === "Enter") goToSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) navigate(items[active].href);
      else goToSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputH =
    size === "lg" ? "h-14 pl-14 pr-5 text-base" : "h-10 pl-11 pr-4 text-sm";
  const iconLeft = size === "lg" ? "left-5" : "left-4";
  const hasResults = items.length > 0;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={size === "lg" ? 20 : 18}
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400",
              iconLeft
            )}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => hasResults && setOpen(true)}
            placeholder={placeholder}
            aria-label="Search NGOs"
            role="combobox"
            aria-expanded={open}
            aria-controls="search-suggestions"
            className={cn(
              "w-full rounded-full border border-ink-200 bg-white text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100",
              inputH
            )}
          />
        </div>
        {showButton && (
          <button
            onClick={goToSearch}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-6 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-md active:translate-y-0",
              size === "lg" ? "h-14 px-8 text-base" : "h-10 text-sm"
            )}
          >
            Search
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-ink-100 bg-white text-left shadow-card-hover"
        >
          {!hasResults ? (
            <div className="px-4 py-3 text-sm text-ink-500">
              {loading ? "Searching…" : "No matches. Press Enter to search."}
            </div>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto py-1.5">
              {items.map((item, i) => (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActive(i)}
                    role="option"
                    aria-selected={active === i}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      active === i ? "bg-primary-50" : "hover:bg-ink-50"
                    )}
                  >
                    <ItemIcon kind={item.kind} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {item.label}
                      </span>
                      {item.sub && (
                        <span className="flex items-center gap-1 text-xs text-ink-500">
                          <MapPin size={11} /> {item.sub}
                        </span>
                      )}
                    </span>
                    {item.tag && (
                      <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                        {item.tag}
                      </span>
                    )}
                    {item.kind !== "ngo" && (
                      <span className="shrink-0 text-[11px] uppercase tracking-wide text-ink-400">
                        {item.kind}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ItemIcon({ kind }: { kind: FlatItem["kind"] }) {
  const cls = "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg";
  if (kind === "category")
    return (
      <span className={cn(cls, "bg-accent-50 text-accent-600")}>
        <Layers size={15} />
      </span>
    );
  if (kind === "city")
    return (
      <span className={cn(cls, "bg-blue-50 text-blue-600")}>
        <MapPin size={15} />
      </span>
    );
  return (
    <span className={cn(cls, "bg-primary-50 text-primary-600")}>
      <Building2 size={15} />
    </span>
  );
}
