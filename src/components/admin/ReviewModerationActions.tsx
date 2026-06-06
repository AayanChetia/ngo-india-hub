"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = { reviewId: string };

type Busy = "approve" | "delete" | null;

/** Approve / delete controls for a pending review. Admin-only via RLS. */
export function ReviewModerationActions({ reviewId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setBusy("approve");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", reviewId);
    if (error) {
      setError(error.message);
      setBusy(null);
      return;
    }
    router.refresh();
  }

  async function remove() {
    setBusy("delete");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) {
      setError(error.message);
      setBusy(null);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <button
          onClick={approve}
          disabled={busy !== null}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-white",
            "hover:bg-accent-600 disabled:opacity-50"
          )}
        >
          {busy === "approve" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={15} />
          )}
          Approve
        </button>
        <button
          onClick={remove}
          disabled={busy !== null}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 px-4 text-sm font-medium text-red-700",
            "hover:bg-red-50 disabled:opacity-50"
          )}
        >
          {busy === "delete" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
          Delete
        </button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
