export function RevenuePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[var(--border)] bg-white/5 px-3 py-1 text-xs text-white">
      {label}: {value}
    </div>
  );
}
