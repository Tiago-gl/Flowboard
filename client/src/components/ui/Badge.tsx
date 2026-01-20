import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type BadgeTone = "accent" | "muted" | "warning" | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  accent: "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent-strong))]",
  muted: "bg-[rgba(var(--border),0.4)] text-[rgb(var(--muted))]",
  warning: "bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]",
  danger: "bg-[rgba(var(--danger),0.2)] text-[rgb(var(--danger))]",
};

const Badge = ({ className, tone = "muted", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
      toneClasses[tone],
      className
    )}
    {...props}
  />
);

export default Badge;
