"use client";

import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import type { NewsArticle } from "@/app/api/news/route";

/**
 * Auto-scrolling horizontal ticker of sector news headlines. Fetches general
 * "NGO India" news on mount and renders nothing until at least one headline
 * loads (so it never shows an empty strip).
 */
export function NewsTicker() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/news?type=general")
      .then((r) => r.json())
      .then((data: { articles?: NewsArticle[] }) => {
        if (active) setArticles(data.articles ?? []);
      })
      .catch(() => {
        if (active) setArticles([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (articles.length === 0) return null;

  // Duplicate the list so the -50% translate loops without a visible seam.
  const loop = [...articles, ...articles];

  return (
    <div className="marquee-group flex items-stretch border-y border-ink-100 bg-ink-50">
      {/* Label */}
      <div className="z-10 flex shrink-0 items-center gap-2 bg-primary px-4 text-sm font-semibold text-white">
        <Newspaper size={16} />
        <span className="hidden sm:inline">NGO News</span>
      </div>

      {/* Scrolling track */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee whitespace-nowrap py-3">
          {loop.map((a, i) => (
            <a
              key={`${a.url}-${i}`}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-6 inline-flex items-center text-sm text-ink-600 hover:text-primary-700"
            >
              <span className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
              <span className="font-medium">{a.source}:</span>
              <span className="ml-1.5">{a.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
