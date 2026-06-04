import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/** Surface container with subtle border + shadow. Set `hover` for lift on hover. */
export function Card({
  className,
  hover = false,
  ...props
}: DivProps & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200 bg-white shadow-card",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return (
    <div className={cn("flex items-center p-5 pt-0", className)} {...props} />
  );
}
