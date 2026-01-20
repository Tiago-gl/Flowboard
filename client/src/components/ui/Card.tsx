import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
};

const Card = ({ className, elevated = false, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-3xl border bg-[rgb(var(--surface))] p-5 shadow-sm",
      elevated && "bg-[rgb(var(--surface-elevated))] shadow-lg",
      className
    )}
    {...props}
  />
);

export default Card;
