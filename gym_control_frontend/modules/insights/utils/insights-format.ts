export function formatCurrencyMx(value: number): string {
  return value.toLocaleString("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.round(diff / 3600_000);
  if (hrs < 24) return `Hace ${hrs} h`;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}
