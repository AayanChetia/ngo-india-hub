"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  ngoId: string;
  ngoSlug: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

const MIN_COMMENT_LENGTH = 30;

/**
 * Review submission form for an NGO profile. Handles auth gating, an
 * interactive star rating, duplicate-review prevention, and moderation notice.
 */
export function ReviewForm({ ngoId, ngoSlug }: ReviewFormProps) {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

  const commentValid = comment.trim().length >= MIN_COMMENT_LENGTH;
  const canSubmit = rating >= 1 && commentValid && state !== "submitting";

  // Determine auth + whether this user has already reviewed this NGO.
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) {
          setLoggedIn(false);
          setChecking(false);
        }
        return;
      }
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("ngo_id", ngoId)
        .maybeSingle();
      if (active) {
        setLoggedIn(true);
        setAlreadyReviewed(Boolean(data));
        setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [ngoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setState("submitting");
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoggedIn(false);
      setState("idle");
      return;
    }

    // Guard against a duplicate slipping through (e.g. two open tabs).
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("ngo_id", ngoId)
      .maybeSingle();
    if (existing) {
      setAlreadyReviewed(true);
      setState("idle");
      return;
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      user_id: user.id,
      ngo_id: ngoId,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      comment: comment.trim(),
    });

    if (insertError) {
      setError(insertError.message || "Something went wrong. Please try again.");
      setState("error");
      return;
    }
    setState("success");
  }

  if (checking) {
    return (
      <div className="mt-4 h-24 animate-pulse rounded-2xl border border-ink-100 bg-ink-50" />
    );
  }

  if (!loggedIn) {
    return (
      <div className="mt-4 rounded-2xl border border-ink-100 bg-ink-50 p-6 text-center">
        <p className="text-sm text-ink-600">
          Share your experience with this NGO.
        </p>
        <Link
          href={`/login?redirect=/ngo/${ngoSlug}`}
          className="mt-3 inline-block"
        >
          <Button>Sign in to leave a review</Button>
        </Link>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <p className="mt-4 flex items-center gap-2 rounded-2xl border border-ink-100 bg-ink-50 p-5 text-sm text-ink-600">
        <CheckCircle2 size={18} className="text-accent-600" />
        You&apos;ve already reviewed this NGO.
      </p>
    );
  }

  if (state === "success") {
    return (
      <p className="mt-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-700">
        <CheckCircle2 size={18} className="shrink-0" />
        Review submitted — it will appear after moderation.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-5 rounded-2xl border border-ink-100 bg-white p-6"
    >
      <div>
        <span className="block text-sm font-medium text-ink-800">
          Your rating
        </span>
        <div
          className="mt-1.5 flex gap-1"
          onMouseLeave={() => setHover(0)}
          role="radiogroup"
          aria-label="Star rating"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <Star
                  size={28}
                  className={cn(
                    "transition-colors",
                    active
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-ink-300"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-ink-800"
        >
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What stood out about your experience with this NGO?"
          className="mt-1.5 w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span
            className={cn(
              "text-ink-400",
              comment.length > 0 && !commentValid && "text-amber-600"
            )}
          >
            {commentValid
              ? "Looks good"
              : `At least ${MIN_COMMENT_LENGTH} characters`}
          </span>
          <span className="text-ink-400">{comment.trim().length}</span>
        </div>
      </div>

      {state === "error" && error && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <Button type="submit" disabled={!canSubmit}>
        {state === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </Button>
    </form>
  );
}
