"use client";

import { GitCompare } from "lucide-react";
import { useCompare } from "./CompareProvider";
import { cn } from "@/lib/utils";

type CompareButtonProps = {
  slug: string;
  name: string;
  /** "icon" floats over a card; "button" sits inline with other CTAs. */
  variant?: "icon" | "button";
  className?: string;
};

/** Toggles an NGO in the comparison shortlist (persisted to localStorage). */
export function CompareButton({
  slug,
  name,
  variant = "icon",
  className,
}: CompareButtonProps) {
  const { add, remove, has } = useCompare();
  const selected = has(slug);

  function toggle(e: React.MouseEvent) {
    // The card wraps content in a Link; don't navigate when toggling.
    e.preventDefault();
    e.stopPropagation();
    if (selected) remove(slug);
    else add({ slug, name });
  }

  const label = selected ? "Remove from compare" : "Add to compare";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={selected}
        aria-label={label}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 text-sm font-medium text-ink-800 transition-all hover:-translate-y-0.5 hover:border-ink-300 hover:bg-ink-50 active:translate-y-0",
          selected && "border-primary-200 bg-primary-50 text-primary-700",
          className
        )}
      >
        <GitCompare size={16} className={cn(selected && "text-primary")} />
        {selected ? "Added to compare" : "Compare"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm ring-1 backdrop-blur transition-colors",
        selected
          ? "bg-primary text-white ring-primary"
          : "bg-white/90 text-ink-500 ring-ink-100 hover:text-primary-700",
        className
      )}
    >
      <GitCompare size={16} />
    </button>
  );
}
