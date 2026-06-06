import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  CheckCircle2,
  Users,
  Star,
  Globe,
  Mail,
  Phone,
  CalendarDays,
  HandHeart,
  Briefcase,
  Heart,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getNgoProfileBySlug,
  getNgoPrograms,
  stateSlug,
} from "@/lib/supabase/queries";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { NgoProfile, Program } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImpactBar } from "@/components/ngo/ImpactBar";
import { VolunteerCTA } from "@/components/ngo/VolunteerCTA";
import { SaveNgoButton } from "@/components/ngo/SaveNgoButton";
import { CompareButton } from "@/components/compare/CompareButton";
import { ReviewsList } from "@/components/ngo/ReviewsList";
import { ReviewForm } from "@/components/ngo/ReviewForm";
import { categoryThemeByName } from "@/lib/categoryColors";
import { cn, formatCompact } from "@/lib/utils";

export const revalidate = 86400; // ISR: revalidate profiles daily

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const ngo = await getNgoProfileBySlug(supabase, params.slug);
  if (!ngo) return { title: "NGO not found — NGO India Hub" };

  const title = `${ngo.name} — Volunteer, Donate & Learn | NGO India Hub`;
  const description =
    ngo.description ?? `${ngo.name} on NGO India Hub.`;
  const url = `${SITE_URL}/ngo/${ngo.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function NgoProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const ngo = await getNgoProfileBySlug(supabase, params.slug);
  if (!ngo) notFound();

  const programs = await getNgoPrograms(supabase, ngo.id);

  const programOptions = programs.map((p) => ({ id: p.id, title: p.title }));

  return (
    <div className="bg-white">
      <NgoJsonLd ngo={ngo} />
      <NgoHero ngo={ngo} programs={programOptions} />

      <div className="container-page grid grid-cols-1 gap-8 py-10 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-10">
          <About ngo={ngo} />
          <Programs programs={programs} />
          <GetInvolved ngo={ngo} />
          <section>
            <h2 className="text-xl font-semibold text-ink-900">Reviews</h2>
            <ReviewsList ngoId={ngo.id} />
            <ReviewForm ngoId={ngo.id} ngoSlug={ngo.slug} />
          </section>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <ImpactCard ngo={ngo} />
          <ContactCard ngo={ngo} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Structured data (JSON-LD): Organization + BreadcrumbList
// ─────────────────────────────────────────────────────────────
function NgoJsonLd({ ngo }: { ngo: NgoProfile }) {
  const url = `${SITE_URL}/ngo/${ngo.slug}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: ngo.name,
    description: ngo.description ?? undefined,
    url,
    email: ngo.email ?? undefined,
    telephone: ngo.phone ?? undefined,
    foundingDate: ngo.founded_year ? String(ngo.founded_year) : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: ngo.address ?? undefined,
      addressLocality: ngo.city || undefined,
      addressRegion: ngo.state || undefined,
      postalCode: ngo.pincode ?? undefined,
      addressCountry: "IN",
    },
    sameAs:
      Object.values(ngo.social_links ?? {}).filter(Boolean).length > 0
        ? Object.values(ngo.social_links).filter(Boolean)
        : undefined,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ngo.primary_category
        ? {
            "@type": "ListItem",
            position: 2,
            name: ngo.primary_category,
            item: `${SITE_URL}/category/${stateSlug(ngo.primary_category)}`,
          }
        : null,
      {
        "@type": "ListItem",
        position: ngo.primary_category ? 3 : 2,
        name: ngo.name,
        item: url,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data must be a raw JSON string in the markup.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────
function NgoHero({
  ngo,
  programs,
}: {
  ngo: NgoProfile;
  programs: { id: string; title: string }[];
}) {
  const theme = categoryThemeByName(ngo.primary_category);
  return (
    <div
      className={cn(
        "border-b border-ink-100 bg-gradient-to-b to-white",
        theme.gradient
      )}
    >
      <div className="container-page py-12 sm:py-16">
        <nav className="mb-4 text-sm text-ink-500">
          <Link href="/" className="hover:text-primary-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink-700">{ngo.primary_category}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {ngo.categories.map((c) => (
            <Badge key={c} variant="primary">
              {c}
            </Badge>
          ))}
          {ngo.is_verified && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-accent-600">
              <CheckCircle2 size={16} /> Verified
            </span>
          )}
        </div>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          {ngo.name}
        </h1>
        {ngo.description && (
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            {ngo.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
          {(ngo.city || ngo.state) && (
            <span className="flex items-center gap-1.5">
              <MapPin size={15} />
              {[ngo.city, ngo.state].filter(Boolean).join(", ")}
            </span>
          )}
          {ngo.founded_year && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} /> Founded {ngo.founded_year}
            </span>
          )}
          {ngo.beneficiaries_count != null && (
            <span className="flex items-center gap-1.5">
              <Users size={15} /> {formatCompact(ngo.beneficiaries_count)}{" "}
              beneficiaries
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {ngo.volunteer_available && (
            <VolunteerCTA
              ngoId={ngo.id}
              ngoSlug={ngo.slug}
              ngoName={ngo.name}
              programs={programs}
            />
          )}
          {ngo.donation_available && (
            <Button variant="accent">Donate</Button>
          )}
          {ngo.website && (
            <a href={ngo.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Visit website</Button>
            </a>
          )}
          <SaveNgoButton ngoId={ngo.id} variant="button" />
          <CompareButton slug={ngo.slug} name={ngo.name} variant="button" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// About + registration badges
// ─────────────────────────────────────────────────────────────
function About({ ngo }: { ngo: NgoProfile }) {
  const facts: { label: string; value: string | null }[] = [
    { label: "Team size", value: ngo.team_size },
    { label: "Funding type", value: ngo.funding_type },
    { label: "Registration no.", value: ngo.registration_number },
  ];
  const visibleFacts = facts.filter((f) => f.value && f.value !== "Verify");

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink-900">About</h2>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-600">
        {ngo.long_description ?? ngo.description ?? "No description available."}
      </p>

      {visibleFacts.length > 0 && (
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {visibleFacts.map((f) => (
            <div key={f.label} className="rounded-xl bg-ink-50 p-4">
              <dt className="text-xs text-ink-500">{f.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink-900">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Registration badges */}
      <div className="mt-5">
        <h3 className="text-sm font-medium text-ink-700">
          Registration &amp; compliance
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <RegBadge label="80G" status={ngo.is_80g} />
          <RegBadge label="12A" status={ngo.is_12a} />
          <RegBadge label="FCRA" status={ngo.is_fcra} />
        </div>
      </div>
    </section>
  );
}

function RegBadge({
  label,
  status,
}: {
  label: string;
  status: "Yes" | "No" | "Verify";
}) {
  if (status === "Yes")
    return (
      <Badge variant="success">
        <CheckCircle2 size={13} /> {label} registered
      </Badge>
    );
  if (status === "Verify")
    return <Badge variant="warning">{label}: to verify</Badge>;
  return <Badge variant="danger">{label}: not registered</Badge>;
}

// ─────────────────────────────────────────────────────────────
// Programs
// ─────────────────────────────────────────────────────────────
function Programs({ programs }: { programs: Program[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink-900">Programs</h2>
      {programs.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-ink-200 p-5 text-sm text-ink-500">
          Programme details for this NGO are being compiled. Check back soon.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.id} className="p-5">
              <h3 className="font-semibold text-ink-900">{p.title}</h3>
              {p.description && (
                <p className="mt-1.5 text-sm text-ink-500">{p.description}</p>
              )}
              {p.beneficiaries != null && (
                <p className="mt-3 text-xs text-accent-700">
                  {formatCompact(p.beneficiaries)} beneficiaries
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Get involved (derived from availability flags)
// ─────────────────────────────────────────────────────────────
function GetInvolved({ ngo }: { ngo: NgoProfile }) {
  const opportunities = [
    {
      show: ngo.volunteer_available,
      icon: HandHeart,
      title: "Volunteer",
      desc: "Give your time and skills to support their work on the ground.",
    },
    {
      show: ngo.internship_available,
      icon: Briefcase,
      title: "Internship",
      desc: "Gain hands-on experience through a structured internship.",
    },
    {
      show: ngo.donation_available,
      icon: Heart,
      title: "Donate",
      desc: "Fund programmes directly and help expand their reach.",
    },
    {
      show: ngo.accepts_csr,
      icon: Building2,
      title: "CSR Partnership",
      desc: "Partner your organisation for corporate social responsibility.",
    },
  ].filter((o) => o.show);

  if (opportunities.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink-900">Get involved</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {opportunities.map((o) => (
          <Card key={o.title} className="flex gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <o.icon size={20} />
            </span>
            <div>
              <h3 className="font-semibold text-ink-900">{o.title}</h3>
              <p className="mt-0.5 text-sm text-ink-500">{o.desc}</p>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-400">
        Contact the NGO directly to discuss skill requirements and how to start.
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Impact (sidebar)
// ─────────────────────────────────────────────────────────────
function ImpactCard({ ngo }: { ngo: NgoProfile }) {
  const theme = categoryThemeByName(ngo.primary_category);
  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-ink-900">Impact</h2>
      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-2xl font-bold text-primary">
            <Star size={20} className="fill-primary text-primary" />
            {ngo.impact_score}/10
          </div>
          <p className="mb-2 text-xs text-ink-500">Impact score</p>
          <ImpactBar
            score={ngo.impact_score}
            barClass={theme.bar}
            showLabel={false}
          />
        </div>
        {ngo.beneficiaries_count != null && (
          <div>
            <div className="text-2xl font-bold text-ink-900">
              {formatCompact(ngo.beneficiaries_count)}
            </div>
            <p className="text-xs text-ink-500">People reached</p>
          </div>
        )}
        {ngo.founded_year && (
          <div>
            <div className="text-2xl font-bold text-ink-900">
              {new Date().getFullYear() - ngo.founded_year}+
            </div>
            <p className="text-xs text-ink-500">Years of operation</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Contact (sidebar)
// ─────────────────────────────────────────────────────────────
const SOCIAL_LABELS: Record<string, string> = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
};

function ContactCard({ ngo }: { ngo: NgoProfile }) {
  const socials = Object.entries(ngo.social_links ?? {}).filter(
    ([, v]) => v && v.trim()
  );

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-ink-900">Contact</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {ngo.website && (
          <li>
            <a
              href={ngo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-ink-600 hover:text-primary-700"
            >
              <Globe size={16} className="shrink-0" />
              <span className="truncate">
                {ngo.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          </li>
        )}
        {ngo.email && (
          <li>
            <a
              href={`mailto:${ngo.email}`}
              className="flex items-center gap-2 text-ink-600 hover:text-primary-700"
            >
              <Mail size={16} className="shrink-0" />
              <span className="truncate">{ngo.email}</span>
            </a>
          </li>
        )}
        {ngo.phone && (
          <li>
            <a
              href={`tel:${ngo.phone}`}
              className="flex items-center gap-2 text-ink-600 hover:text-primary-700"
            >
              <Phone size={16} className="shrink-0" />
              {ngo.phone}
            </a>
          </li>
        )}
        {ngo.address && (
          <li className="flex items-start gap-2 text-ink-600">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>
              {ngo.address}
              {ngo.pincode ? ` — ${ngo.pincode}` : ""}
            </span>
          </li>
        )}
      </ul>

      {socials.length > 0 && (
        <div className="mt-5 border-t border-ink-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {socials.map(([key, value]) => (
              <a
                key={key}
                href={socialHref(key, value)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-600 hover:bg-primary-50 hover:text-primary-700"
              >
                {SOCIAL_LABELS[key] ?? key}
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Social values in the seed are handles like "@PETAIndia" or slugs; build a
// best-effort URL when the value isn't already a full link.
function socialHref(key: string, value: string): string {
  if (value.startsWith("http")) return value;
  const handle = value.replace(/^@/, "");
  switch (key) {
    case "twitter":
      return `https://twitter.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/company/${handle}`;
    case "instagram":
      return `https://www.instagram.com/${handle}`;
    case "facebook":
      return `https://www.facebook.com/${handle}`;
    default:
      return value;
  }
}
