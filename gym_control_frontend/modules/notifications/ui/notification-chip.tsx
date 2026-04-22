export function NotificationChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--border)] bg-white/5 px-2 py-1 text-xs text-white">
      {label}
    </span>
  );
}
