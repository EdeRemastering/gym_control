export function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white/5 p-2">
      <p className="text-[10px] uppercase text-[var(--muted)]">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}
