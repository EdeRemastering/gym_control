"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const baseControlStyles =
  "w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-[var(--primary)]";

export const FormInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(baseControlStyles, className)} {...props} />;
  },
);
FormInput.displayName = "FormInput";

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={cn(baseControlStyles, className)} {...props} />;
});
FormTextarea.displayName = "FormTextarea";
