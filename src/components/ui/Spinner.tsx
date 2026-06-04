import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: number;
  label?: string;
};

/** Accessible loading spinner. */
export function Spinner({ className, size = 20, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-ink-200 border-t-primary",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
