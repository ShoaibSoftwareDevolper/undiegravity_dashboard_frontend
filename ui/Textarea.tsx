import type { TextareaHTMLAttributes } from "react";
import { inputBaseClasses } from "./Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  const classes = [inputBaseClasses, "h-auto min-h-24 resize-y py-2", className]
    .filter(Boolean)
    .join(" ");
  return <textarea className={classes} {...props} />;
}
