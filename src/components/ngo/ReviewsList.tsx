import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNgoReviews } from "@/lib/supabase/queries";
import type { Review } from "@/types/database";
import { cn } from "@/lib/utils";

/** Renders a row of 5 stars with the first `value` filled. */
function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Approved reviews for an NGO, with average rating and total count. */
export async function ReviewsList({ ngoId }: { ngoId: string }) {
  const supabase = createClient();
  const reviews: Review[] = await getNgoReviews(supabase, ngoId);

  if (reviews.length === 0) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-ink-200 p-5 text-sm text-ink-500">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-ink-900">
          {average.toFixed(1)}
        </span>
        <div>
          <Stars value={Math.round(average)} size={18} />
          <p className="mt-0.5 text-xs text-ink-500">
            {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-4">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-ink-100 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <Stars value={r.rating} />
              <span className="text-xs text-ink-400">
                {formatDate(r.created_at)}
              </span>
            </div>
            {r.comment && (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                {r.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
