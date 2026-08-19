import type { SelectHTMLAttributes } from "react";
import { inputBaseClasses } from "./Input";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  const classes = [inputBaseClasses, className].filter(Boolean).join(" ");
  return <select className={classes} {...props} />;
}
