export function TrainingChip({ label }: { label: string }) {
  return (
    <span className="rounded-lg bg-[var(--primary-soft)] px-2 py-1 text-xs text-white">
      {label}
    </span>
  );
}
