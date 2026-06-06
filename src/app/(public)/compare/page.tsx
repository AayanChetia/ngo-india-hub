import Link from "next/link";
import type { Metadata } from "next";
import { Check, X, MapPin, Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNgoProfileBySlug } from "@/lib/supabase/queries";
import type { NgoProfile } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImpactBar } from "@/components/ngo/ImpactBar";
import { categoryThemeByName } from "@/lib/categoryColors";
import { formatCompact } from "@/lib/utils";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compare NGOs | NGO India Hub",
  description:
    "Compare verified Indian NGOs side by side — impact, registration, volunteering, and CSR readiness.",
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "Compare NGOs | NGO India Hub",
    description:
      "Compare verified Indian NGOs side by side — impact, registration, volunteering, and CSR readiness.",
    url: `${SITE_URL}/compare`,
    siteName: SITE_NAME,
    type: "website",
  },
};

const MAX = 3;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { ngos?: string };
}) {
  const slugs = (searchParams.ngos ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX);

  const supabase = createClient();
  const fetched = await Promise.all(
    slugs.map((slug) => getNgoProfileBySlug(supabase, slug))
  );
  const ngos = fetched.filter((n): n is NgoProfile => n !== null);

  return (
    <div className="bg-white">
      <div className="border-b border-ink-100 bg-ink-50/60">
        <div className="container-page py-10">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-ink-900">
            <Scale className="text-primary" /> Compare NGOs
          </h1>
          <p className="mt-2 text-ink-600">
            Side-by-side comparison of up to {MAX} organisations.
          </p>
        </div>
      </div>

      <div className="container-page py-10 pb-28">
        {ngos.length === 0 ? (
          <EmptyState />
        ) : (
          <ComparisonTable ngos={ngos} />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 p-12 text-center">
      <p className="text-ink-600">
        No NGOs selected to compare. Browse listings and use the{" "}
        <span className="font-medium text-ink-900">Compare</span> button on a
        card to build your shortlist.
      </p>
      <Link href="/search" className="mt-5 inline-block">
        <Button>Browse NGOs</Button>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────────────────────
type Row = {
  label: string;
  render: (ngo: NgoProfile) => React.ReactNode;
};

const ROWS: Row[] = [
  {
    label: "Location",
    render: (n) => (
      <span className="flex items-center gap-1.5 text-ink-700">
        <MapPin size={14} className="shrink-0 text-ink-400" />
        {[n.city, n.state].filter(Boolean).join(", ") || "—"}
      </span>
    ),
  },
  { label: "Founded", render: (n) => n.founded_year ?? "—" },
  { label: "Team size", render: (n) => n.team_size ?? "—" },
  {
    label: "Beneficiaries",
    render: (n) =>
      n.beneficiaries_count != null
        ? `${formatCompact(n.beneficiaries_count)} reached`
        : "—",
  },
  {
    label: "Impact score",
    render: (n) => {
      const theme = categoryThemeByName(n.primary_category);
      return (
        <div className="space-y-1">
          <span className="text-sm font-semibold text-ink-900">
            {n.impact_score}/10
          </span>
          <ImpactBar score={n.impact_score} barClass={theme.bar} showLabel={false} />
        </div>
      );
    },
  },
  { label: "80G", render: (n) => <RegCell status={n.is_80g} /> },
  { label: "12A", render: (n) => <RegCell status={n.is_12a} /> },
  { label: "FCRA", render: (n) => <RegCell status={n.is_fcra} /> },
  { label: "Volunteering", render: (n) => <YesNo value={n.volunteer_available} /> },
  { label: "Internships", render: (n) => <YesNo value={n.internship_available} /> },
  { label: "Accepts CSR", render: (n) => <YesNo value={n.accepts_csr} /> },
  { label: "Funding type", render: (n) => n.funding_type ?? "—" },
];

function ComparisonTable({ ngos }: { ngos: NgoProfile[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-40 bg-white" />
            {ngos.map((n) => (
              <th
                key={n.slug}
                className="border-b border-ink-100 p-4 text-left align-top"
              >
                <div className="flex flex-wrap gap-1.5">
                  {n.categories.slice(0, 2).map((c) => (
                    <Badge key={c} variant="primary">
                      {c}
                    </Badge>
                  ))}
                </div>
                <Link
                  href={`/ngo/${n.slug}`}
                  className="mt-2 block text-base font-semibold text-ink-900 hover:text-primary-700"
                >
                  {n.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={row.label} className={i % 2 ? "bg-ink-50/40" : ""}>
              <th
                scope="row"
                className="sticky left-0 z-10 whitespace-nowrap bg-inherit px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-500"
              >
                {row.label}
              </th>
              {ngos.map((n) => (
                <td
                  key={n.slug}
                  className="px-4 py-3 text-sm text-ink-800 align-middle"
                >
                  {row.render(n)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th className="sticky left-0 z-10 bg-white" />
            {ngos.map((n) => (
              <td key={n.slug} className="px-4 pt-5">
                <Link href={`/ngo/${n.slug}`}>
                  <Button size="sm">View full profile</Button>
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1.5 font-medium text-accent-700">
      <Check size={16} /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-ink-400">
      <X size={16} /> No
    </span>
  );
}

function RegCell({ status }: { status: "Yes" | "No" | "Verify" }) {
  if (status === "Yes")
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-accent-700">
        <Check size={16} /> Registered
      </span>
    );
  if (status === "Verify")
    return <Badge variant="warning">To verify</Badge>;
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-400">
      <X size={16} /> No
    </span>
  );
}
