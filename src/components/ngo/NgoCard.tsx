import Link from "next/link";
import { MapPin, CheckCircle2, Users } from "lucide-react";
import type { NGO } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImpactBar } from "@/components/ngo/ImpactBar";
import { categoryThemeByName } from "@/lib/categoryColors";
import { cn, formatCompact } from "@/lib/utils";

type NgoCardProps = {
  ngo: NGO;
  showCategory?: boolean;
  border?: "left" | "top";
  className?: string;
};

/**
 * NGO listing card — homepage featured, category pages, search results.
 * Carries a category-coloured accent border plus volunteering / internship
 * pills. `border` chooses a left (listings) or top (featured) accent.
 */
export function NgoCard({
  ngo,
  showCategory = true,
  border = "left",
  className,
}: NgoCardProps) {
  const theme = categoryThemeByName(ngo.primary_category);

  return (
    <Card
      hover
      className={cn(
        "flex h-full flex-col",
        border === "top" ? cn("border-t-4", theme.topBorder) : cn("border-l-4", theme.border),
        theme.hoverBorder,
        className
      )}
    >
      <Link
        href={`/ngo/${ngo.slug}`}
        className="flex h-full flex-col rounded-2xl p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      >
        <div className="flex items-start justify-between gap-2">
          {showCategory && ngo.primary_category && (
            <Badge variant="primary">{ngo.primary_category}</Badge>
          )}
          {ngo.is_verified && (
            <span className="flex items-center gap-1 text-xs font-medium text-accent-600">
              <CheckCircle2 size={14} />
              Verified
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-semibold text-ink-900">
          {ngo.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">
          {ngo.description}
        </p>

        {/* Opportunity pills */}
        {(ngo.volunteer_available ||
          ngo.internship_available ||
          ngo.donation_available) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ngo.volunteer_available && (
              <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700">
                Volunteers
              </span>
            )}
            {ngo.internship_available && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                Internships
              </span>
            )}
            {ngo.donation_available && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                Donations
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          {(ngo.city || ngo.state) && (
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {[ngo.city, ngo.state].filter(Boolean).join(", ")}
            </span>
          )}
          {ngo.beneficiaries_count != null && (
            <span className="flex items-center gap-1">
              <Users size={13} />
              {formatCompact(ngo.beneficiaries_count)} reached
            </span>
          )}
        </div>

        {/* Impact meter */}
        <div className="mt-auto pt-4">
          <ImpactBar score={ngo.impact_score} barClass={theme.bar} />
        </div>
      </Link>
    </Card>
  );
}
