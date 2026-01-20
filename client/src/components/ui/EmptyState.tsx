import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[rgba(var(--border),0.8)] px-6 py-8 text-center">
      <p className="text-sm font-semibold text-[rgb(var(--text))]">{title}</p>
      {description ? (
        <p className="text-sm text-[rgb(var(--muted))]">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
