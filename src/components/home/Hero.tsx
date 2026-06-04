import Link from "next/link";
import { Users, MapPin } from "lucide-react";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { slugifyCategory } from "@/lib/categoryColors";

const POPULAR = ["Education", "Healthcare", "Environment", "Women Empowerment"];

/** Homepage hero — full-height, brand gradient, search, and floating stats. */
export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600">
      {/* Diagonal sheen + colour blooms */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-accent-400/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-accent-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-primary-400/30 blur-3xl"
      />
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Ashoka Chakra watermark — more visible but still subtle */}
      <ChakraGlyph className="pointer-events-none absolute -right-20 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 text-white/10" />

      {/* Floating stat cards */}
      <StatCard
        className="left-6 top-24 hidden xl:flex"
        icon={<Users size={18} />}
        value="1.2M+"
        label="beneficiaries reached"
      />
      <StatCard
        className="bottom-24 right-8 hidden xl:flex"
        icon={<MapPin size={18} />}
        value="22"
        label="states covered"
      />

      <div className="container-page relative z-10 py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur">
          🇮🇳 234 verified NGOs · 22 states · 15 causes
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find and connect with India&apos;s most{" "}
          <span className="bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
            impactful NGOs
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-primary-100">
          Discover NGOs by cause, city, or state. Volunteer, donate, or partner
          for CSR — all in one place.
        </p>

        {/* Search with live autocomplete */}
        <div className="mx-auto mt-10 max-w-2xl text-left">
          <SearchAutocomplete />
        </div>

        {/* Popular causes */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-primary-100">
          <span>Popular:</span>
          {POPULAR.map((cause) => (
            <Link
              key={cause}
              href={`/category/${slugifyCategory(cause)}`}
              className="rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/25"
            >
              {cause}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  className,
  icon,
  value,
  label,
}: {
  className?: string;
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className={`absolute z-10 animate-fade-up items-center gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-card-hover backdrop-blur ${className ?? ""}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        {icon}
      </span>
      <span className="text-left">
        <span className="block text-xl font-bold text-ink-900">{value}</span>
        <span className="block text-xs text-ink-500">{label}</span>
      </span>
    </div>
  );
}

/** Decorative 24-spoke Ashoka-chakra-inspired line glyph. */
function ChakraGlyph({ className }: { className?: string }) {
  const spokes = Array.from({ length: 24 });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none">
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="1.5" />
      {spokes.map((_, i) => {
        const a = (i * 360) / 24;
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2="50"
            y2="2"
            stroke="currentColor"
            strokeWidth="0.7"
            transform={`rotate(${a} 50 50)`}
          />
        );
      })}
    </svg>
  );
}
