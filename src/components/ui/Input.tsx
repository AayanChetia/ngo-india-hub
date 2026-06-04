import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Text input matching the design system. Forwards ref for form libraries. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-full border border-ink-200 bg-white px-4 text-sm text-ink-900",
        "placeholder:text-ink-400",
        "focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
