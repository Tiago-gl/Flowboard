import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-2xl border bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm text-[rgb(var(--text))] shadow-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]",
        hasError && "border-[rgb(var(--danger))] focus:border-[rgb(var(--danger))]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";

export default Select;
