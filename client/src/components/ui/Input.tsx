import {
  type InputHTMLAttributes,
  forwardRef,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm text-[rgb(var(--text))] shadow-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]",
        hasError && "border-[rgb(var(--danger))] focus:border-[rgb(var(--danger))]",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm text-[rgb(var(--text))] shadow-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]",
        hasError && "border-[rgb(var(--danger))] focus:border-[rgb(var(--danger))]",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
