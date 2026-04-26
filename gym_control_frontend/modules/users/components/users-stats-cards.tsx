"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, UserCheck, UserRoundPlus, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { UsersStats } from "@/modules/users/types/users-management.types";

export function UsersStatsCards({ stats }: { stats: UsersStats }) {
  const cards = [
    { label: "Usuarios totales", value: stats.total, icon: Users, tone: "text-cyan-300" },
    { label: "Usuarios activos", value: stats.active, icon: UserCheck, tone: "text-emerald-300" },
    { label: "Roles definidos", value: stats.roles, icon: ShieldCheck, tone: "text-violet-300" },
    { label: "Permisos totales", value: stats.permissions, icon: Lock, tone: "text-fuchsia-300" },
    { label: "Invitaciones pendientes", value: stats.invitations, icon: UserRoundPlus, tone: "text-amber-300" },
    { label: "Usuarios bloqueados", value: stats.blocked, icon: Lock, tone: "text-rose-300" },
  ];
  return (
    <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
          <Card className="space-y-1.5 border-white/10 bg-white/5">
            <card.icon className={`h-4 w-4 ${card.tone}`} />
            <p className="text-[11px] text-[var(--muted)]">{card.label}</p>
            <p className="text-2xl font-semibold text-white">{card.value}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
