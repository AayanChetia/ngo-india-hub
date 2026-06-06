import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPendingReviews } from "@/lib/supabase/queries";
import { ReviewModerationActions } from "@/components/admin/ReviewModerationActions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Review moderation — NGO India Hub",
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={15}
          className={cn(
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-ink-300"
          )}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin/reviews");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Admin-only area — send everyone else home.
  if (profile?.role !== "admin") redirect("/");

  const pending = await getPendingReviews(supabase);

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Review moderation
        </h1>
        <p className="mt-1 text-ink-500">
          {pending.length === 0
            ? "Nothing waiting for review."
            : `${pending.length} review${
                pending.length > 1 ? "s" : ""
              } awaiting approval.`}
        </p>

        {pending.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
            All caught up — no pending reviews.
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {pending.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-ink-100 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    {r.ngo ? (
                      <Link
                        href={`/ngo/${r.ngo.slug}`}
                        className="font-semibold text-ink-900 hover:text-primary-700 hover:underline"
                      >
                        {r.ngo.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink-500">
                        Unknown NGO
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Stars value={r.rating} />
                      <span className="text-xs text-ink-400">
                        {new Date(r.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <ReviewModerationActions reviewId={r.id} />
                </div>
                {r.comment && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                    {r.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
