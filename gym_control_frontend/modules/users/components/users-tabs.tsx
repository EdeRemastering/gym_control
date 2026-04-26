"use client";

interface UsersTabsProps {
  activeTab: "all" | "active" | "inactive" | "blocked" | "pending";
  counters: { all: number; active: number; inactive: number; blocked: number; pending: number };
  onChange: (tab: UsersTabsProps["activeTab"]) => void;
}

export function UsersTabs({ activeTab, counters, onChange }: UsersTabsProps) {
  const tabs: Array<{ id: UsersTabsProps["activeTab"]; label: string }> = [
    { id: "all", label: "Todos los usuarios" },
    { id: "active", label: "Activos" },
    { id: "inactive", label: "Inactivos" },
    { id: "blocked", label: "Bloqueados" },
    { id: "pending", label: "Invitaciones" },
  ];
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${activeTab === tab.id ? "bg-cyan-500/20 text-white" : "text-[var(--muted)] hover:text-white"}`}
        >
          {tab.label} <span className="text-xs">{counters[tab.id]}</span>
        </button>
      ))}
    </div>
  );
}
