import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-primary-700",
  accent:
    "bg-accent text-white shadow-sm hover:bg-accent-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-accent-700",
  outline:
    "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 hover:border-ink-300 hover:-translate-y-0.5 active:translate-y-0",
  ghost: "text-ink-700 hover:bg-ink-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2",
};

/**
 * Primary action button. Renders a native <button>; compose with <Link asChild>
 * pattern by wrapping in a Link where a navigation element is needed.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
