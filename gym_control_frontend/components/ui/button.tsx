import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:translate-y-[-1px] hover:shadow-[0_10px_24px_rgba(91,124,255,0.35)]",
        secondary:
          "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[#263243]",
        ghost: "text-[var(--foreground)] hover:bg-white/5",
        destructive: "bg-[var(--danger)] text-white hover:bg-[#d53a3a]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
      loading: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, loading }), className)}
      {...props}
    />
  );
}
