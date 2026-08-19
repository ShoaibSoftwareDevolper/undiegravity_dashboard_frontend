import type { InputHTMLAttributes } from "react";

export const inputBaseClasses =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const classes = [inputBaseClasses, className].filter(Boolean).join(" ");
  return <input className={classes} {...props} />;
}
