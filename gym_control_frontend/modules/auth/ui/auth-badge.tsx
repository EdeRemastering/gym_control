export function AuthBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs ${
        active ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
      }`}
    >
      {active ? "Sesión activa" : "Sesión cerrada"}
    </span>
  );
}
