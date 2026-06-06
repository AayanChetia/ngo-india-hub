import Link from "next/link";
import type { Metadata } from "next";
import {
  Users,
  Building2,
  MapPin,
  HandHeart,
  Briefcase,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getImpactStats, stateSlug } from "@/lib/supabase/queries";
import { categoryTheme } from "@/lib/categoryColors";
import { formatCompact, cn } from "@/lib/utils";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Impact | NGO India Hub",
  description:
    "Platform-wide statistics for NGO India Hub — verified NGOs, beneficiaries reached, states covered, and volunteering, internship, and CSR opportunities.",
  alternates: { canonical: `${SITE_URL}/impact` },
  openGraph: {
    title: "Our Impact | NGO India Hub",
    description:
      "Platform-wide statistics for NGO India Hub — verified NGOs, beneficiaries reached, and opportunities across India.",
    url: `${SITE_URL}/impact`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default async function ImpactPage() {
  const supabase = createClient();
  const stats = await getImpactStats(supabase);

  const maxCategoryCount = Math.max(
    1,
    ...stats.categoryBreakdown.map((c) => c.count)
  );
  const maxStateCount = Math.max(1, ...stats.topStates.map((s) => s.count));

  const headline = [
    {
      icon: Building2,
      value: formatCompact(stats.ngoCount),
      label: "NGOs listed",
    },
    {
      icon: Users,
      value: formatCompact(stats.beneficiaries),
      label: "Beneficiaries reached",
    },
    {
      icon: MapPin,
      value: String(stats.stateCount),
      label: "States covered",
    },
    {
      icon: HandHeart,
      value: formatCompact(stats.volunteerCount),
      label: "Volunteer opportunities",
    },
  ];

  const opportunityCards = [
    {
      icon: HandHeart,
      value: stats.volunteerCount,
      label: "NGOs seeking volunteers",
      tone: "text-accent-700",
      bg: "bg-accent-50",
    },
    {
      icon: Briefcase,
      value: stats.internshipCount,
      label: "NGOs offering internships",
      tone: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      icon: Building2,
      value: stats.csrCount,
      label: "NGOs accepting CSR",
      tone: "text-primary-700",
      bg: "bg-primary-50",
    },
    {
      icon: ShieldCheck,
      value: stats.reg80gCount,
      label: "NGOs with 80G registration",
      tone: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-primary-50 to-white">
        <div className="container-page py-14 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-700 shadow-sm">
            <Sparkles size={14} /> Platform impact
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            India&apos;s most comprehensive NGO directory
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Real numbers from across the platform — the organisations, the reach,
            and the ways to get involved.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {headline.map((h) => (
              <div
                key={h.label}
                className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
              >
                <h.icon className="text-primary" size={22} />
                <div className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
                  {h.value}
                </div>
                <p className="mt-1 text-sm text-ink-500">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page space-y-16 py-14">
        {/* Category breakdown */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">
            NGOs by category
          </h2>
          <p className="mt-1 text-ink-500">
            {stats.categoryCount} cause categories across the directory.
          </p>

          <div className="mt-6 space-y-3">
            {stats.categoryBreakdown.map((c) => {
              const theme = categoryTheme(c.slug);
              const pct = Math.round((c.count / maxCategoryCount) * 100);
              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group flex items-center gap-4"
                >
                  <span className="w-40 shrink-0 truncate text-sm font-medium text-ink-700 group-hover:text-primary-700">
                    {c.name}
                  </span>
                  <span className="relative h-6 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span
                      className={cn("absolute inset-y-0 left-0 rounded-full", theme.bar)}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink-900">
                    {c.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top states */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">
            Top states by NGO count
          </h2>
          <div className="mt-6 space-y-3">
            {stats.topStates.map((s, i) => {
              const pct = Math.round((s.count / maxStateCount) * 100);
              return (
                <Link
                  key={s.id}
                  href={`/state/${stateSlug(s.name)}`}
                  className="group flex items-center gap-4"
                >
                  <span className="flex w-40 shrink-0 items-center gap-2 text-sm font-medium text-ink-700 group-hover:text-primary-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                      {i + 1}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </span>
                  <span className="relative h-6 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-primary-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink-900">
                    {s.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Opportunity stats */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">
            Ways to get involved
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {opportunityCards.map((o) => (
              <div
                key={o.label}
                className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    o.bg,
                    o.tone
                  )}
                >
                  <o.icon size={22} />
                </span>
                <div className="mt-4 text-3xl font-bold text-ink-900">
                  {formatCompact(o.value)}
                </div>
                <p className="mt-1 text-sm text-ink-500">{o.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
