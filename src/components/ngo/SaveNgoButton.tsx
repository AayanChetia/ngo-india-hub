"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SaveNgoButtonProps = {
  ngoId: string;
  /** "icon" floats over a card; "button" sits inline with other CTAs. */
  variant?: "icon" | "button";
  className?: string;
};

/**
 * Bookmark toggle for an NGO. Checks saved state on mount, toggles optimistically
 * on click, and reverts on error. Sends logged-out users to /login.
 */
export function SaveNgoButton({
  ngoId,
  variant = "icon",
  className,
}: SaveNgoButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);

  // Check whether this NGO is already saved by the current user.
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setReady(true);
        return;
      }
      const { data } = await supabase
        .from("saved_ngos")
        .select("ngo_id")
        .eq("user_id", user.id)
        .eq("ngo_id", ngoId)
        .maybeSingle();
      if (active) {
        setSaved(Boolean(data));
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [ngoId]);

  async function toggle(e: React.MouseEvent) {
    // The card wraps the button area in a Link; don't navigate when saving.
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !saved;
    setSaved(next); // optimistic
    setPending(true);

    const { error } = next
      ? await supabase
          .from("saved_ngos")
          .insert({ user_id: user.id, ngo_id: ngoId })
      : await supabase
          .from("saved_ngos")
          .delete()
          .eq("user_id", user.id)
          .eq("ngo_id", ngoId);

    if (error) setSaved(!next); // revert on failure
    setPending(false);
  }

  const label = saved ? "Remove from saved" : "Save NGO";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={label}
        disabled={!ready}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 text-sm font-medium text-ink-800 transition-all hover:-translate-y-0.5 hover:border-ink-300 hover:bg-ink-50 active:translate-y-0 disabled:opacity-50",
          saved && "border-primary-200 bg-primary-50 text-primary-700",
          className
        )}
      >
        <Bookmark size={16} className={cn(saved && "fill-current")} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={label}
      disabled={!ready}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-sm ring-1 ring-ink-100 backdrop-blur transition-colors hover:text-primary-700 disabled:opacity-50",
        saved && "text-primary-700",
        className
      )}
    >
      <Bookmark size={16} className={cn(saved && "fill-current")} />
    </button>
  );
}
