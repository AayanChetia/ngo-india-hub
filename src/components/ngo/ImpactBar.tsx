import { cn } from "@/lib/utils";

type ImpactBarProps = {
  score: number; // 1–10
  barClass?: string; // themed fill colour
  className?: string;
  showLabel?: boolean;
};

/** Horizontal impact-score meter (score out of 10). */
export function ImpactBar({
  score,
  barClass = "bg-primary-500",
  className,
  showLabel = true,
}: ImpactBarProps) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-ink-500">Impact score</span>
          <span className="font-semibold text-ink-700">{score}/10</span>
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label="Impact score"
      >
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
