import { cn } from "@/lib/utils";

type BadgeVariant =
  | "primary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-50 text-accent-700",
  neutral: "bg-ink-100 text-ink-700",
  success: "bg-accent-50 text-accent-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  outline: "border border-ink-200 text-ink-600",
};

/** Small status / category label pill. */
export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
