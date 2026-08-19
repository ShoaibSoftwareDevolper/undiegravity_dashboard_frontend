import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-text">
      <input
        id={id}
        type="checkbox"
        className={["h-4 w-4 rounded border-border text-accent focus:ring-accent/40", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {label}
    </label>
  );
}
