import Link from "next/link";
import type { Category } from "@/types/database";
import { categoryTheme } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";

type CategoryGridProps = {
  categories: Category[];
  counts: Record<string, number>;
};

/** Grid of all NGO categories — themed gradient cards with live NGO counts. */
export function CategoryGrid({ categories, counts }: CategoryGridProps) {
  return (
    <section
      id="categories"
      className="container-page scroll-mt-20 py-16 sm:py-20"
    >
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink-900">
          Browse by cause
        </h2>
        <p className="mt-2 text-ink-500">
          15 categories spanning every major social cause in India
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const theme = categoryTheme(category.slug);
          const count = counts[category.id] ?? 0;
          return (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <div
                className={cn(
                  "group flex h-full flex-col items-center gap-3 rounded-2xl border border-white/60 p-5 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
                  theme.cardBg
                )}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm transition-transform duration-200 group-hover:scale-110"
                  aria-hidden
                >
                  {category.icon ?? "🤝"}
                </span>
                <span className="text-sm font-semibold text-ink-900">
                  {category.name}
                </span>
                <span
                  className={cn(
                    "mt-auto rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium",
                    theme.text
                  )}
                >
                  {count} {count === 1 ? "NGO" : "NGOs"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
