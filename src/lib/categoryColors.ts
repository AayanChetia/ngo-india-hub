/**
 * Per-category colour theme. Each entry uses fully-spelled Tailwind class
 * strings (not interpolated) so the JIT compiler can statically detect them.
 * Keyed by category slug. Brand purple/teal stay the global UI accent; these
 * give each cause a recognisable identity on cards and hero sections.
 */
export type CategoryTheme = {
  iconBg: string; // tile behind the emoji
  border: string; // left border on NGO cards
  topBorder: string; // top border on featured cards
  hoverBorder: string; // card hover border
  gradient: string; // hero gradient wash (from-*)
  cardBg: string; // category-card gradient background
  bar: string; // impact-bar fill
  text: string; // accent text
};

const DEFAULT: CategoryTheme = {
  iconBg: "bg-primary-100",
  border: "border-l-primary-500",
  topBorder: "border-t-primary-500",
  hoverBorder: "hover:border-primary-300",
  gradient: "from-primary-50",
  cardBg: "bg-gradient-to-br from-primary-50 to-primary-100",
  bar: "bg-primary-500",
  text: "text-primary-700",
};

function make(color: string): CategoryTheme {
  return {
    iconBg: `bg-${color}-100`,
    border: `border-l-${color}-500`,
    topBorder: `border-t-${color}-500`,
    hoverBorder: `hover:border-${color}-300`,
    gradient: `from-${color}-50`,
    cardBg: `bg-gradient-to-br from-${color}-50 to-${color}-100`,
    bar: `bg-${color}-500`,
    text: `text-${color}-700`,
  };
}

// NOTE: the literal class strings below (not `make()`) are what Tailwind scans.
// `make()` only assembles them at runtime; the safelist comment keeps JIT happy.
// prettier-ignore
const THEMES: Record<string, CategoryTheme> = {
  "education":          make("blue"),
  "healthcare":         make("rose"),
  "women-empowerment":  make("pink"),
  "child-welfare":      make("amber"),
  "animal-welfare":     make("orange"),
  "environment":        make("emerald"),
  "sanitation":         make("cyan"),
  "rural-development":  make("lime"),
  "disaster-relief":    make("red"),
  "disability-support": make("indigo"),
  "elderly-care":       make("violet"),
  "hunger-relief":      make("yellow"),
  "human-rights":       make("teal"),
  "skill-development":  make("accent"),
  "mental-health":      make("purple"),
};

/* Tailwind safelist — keep these literals so JIT generates every themed class:
   bg-blue-100 border-l-blue-500 border-t-blue-500 hover:border-blue-300 from-blue-50 to-blue-100 bg-blue-500 text-blue-700
   bg-rose-100 border-l-rose-500 border-t-rose-500 hover:border-rose-300 from-rose-50 to-rose-100 bg-rose-500 text-rose-700
   bg-pink-100 border-l-pink-500 border-t-pink-500 hover:border-pink-300 from-pink-50 to-pink-100 bg-pink-500 text-pink-700
   bg-amber-100 border-l-amber-500 border-t-amber-500 hover:border-amber-300 from-amber-50 to-amber-100 bg-amber-500 text-amber-700
   bg-orange-100 border-l-orange-500 border-t-orange-500 hover:border-orange-300 from-orange-50 to-orange-100 bg-orange-500 text-orange-700
   bg-emerald-100 border-l-emerald-500 border-t-emerald-500 hover:border-emerald-300 from-emerald-50 to-emerald-100 bg-emerald-500 text-emerald-700
   bg-cyan-100 border-l-cyan-500 border-t-cyan-500 hover:border-cyan-300 from-cyan-50 to-cyan-100 bg-cyan-500 text-cyan-700
   bg-lime-100 border-l-lime-500 border-t-lime-500 hover:border-lime-300 from-lime-50 to-lime-100 bg-lime-500 text-lime-700
   bg-red-100 border-l-red-500 border-t-red-500 hover:border-red-300 from-red-50 to-red-100 bg-red-500 text-red-700
   bg-indigo-100 border-l-indigo-500 border-t-indigo-500 hover:border-indigo-300 from-indigo-50 to-indigo-100 bg-indigo-500 text-indigo-700
   bg-violet-100 border-l-violet-500 border-t-violet-500 hover:border-violet-300 from-violet-50 to-violet-100 bg-violet-500 text-violet-700
   bg-yellow-100 border-l-yellow-500 border-t-yellow-500 hover:border-yellow-300 from-yellow-50 to-yellow-100 bg-yellow-500 text-yellow-700
   bg-teal-100 border-l-teal-500 border-t-teal-500 hover:border-teal-300 from-teal-50 to-teal-100 bg-teal-500 text-teal-700
   bg-accent-100 border-l-accent-500 border-t-accent-500 hover:border-accent-300 from-accent-50 to-accent-100 bg-accent-500 text-accent-700
   bg-purple-100 border-l-purple-500 border-t-purple-500 hover:border-purple-300 from-purple-50 to-purple-100 bg-purple-500 text-purple-700
*/

/** Map a category name (e.g. "Women Empowerment") to its URL slug. */
export function slugifyCategory(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/&/g, "and");
}

/** Look up a theme by slug, falling back to the brand purple theme. */
export function categoryTheme(slug: string | null | undefined): CategoryTheme {
  if (!slug) return DEFAULT;
  return THEMES[slug] ?? DEFAULT;
}

/** Look up a theme by category display name. */
export function categoryThemeByName(
  name: string | null | undefined
): CategoryTheme {
  if (!name) return DEFAULT;
  return categoryTheme(slugifyCategory(name));
}
