export function ClassBadge({ occupancy }: { occupancy: number }) {
  return (
    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
      {occupancy}% ocupado
    </span>
  );
}
