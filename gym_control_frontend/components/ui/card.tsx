import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-4 backdrop-blur-md transition hover:border-[#3b4d66]",
        className,
      )}
    >
      {children}
    </article>
  );
}
